import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { env } from "../../config/env.js";
import { emailService } from "../../services/email.service.js";
import { AppError } from "../../utils/app-error.js";
import { createBusinessIdentifier } from "../../utils/business-id.js";
import { defaultPermissionKeys, defaultRoleDefinitions } from "../../utils/default-authz.js";
import { compareHash, hashValue } from "../../utils/hash.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";

interface RegisterCompanyInput {
  fullName: string;
  companyName: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

type AuthenticatedUser = Prisma.UserGetPayload<{
  include: {
    role: true;
    business: true;
  };
}>;

interface PublicSessionTokens {
  accessToken: string;
  expiresIn: string;
}

interface PrivateSessionTokens extends PublicSessionTokens {
  refreshToken: string;
}

function getPermissionsForRole(roleName?: string | null) {
  return roleName && defaultRoleDefinitions[roleName] ? defaultRoleDefinitions[roleName] : [];
}

export class AuthService {
  async registerCompany(input: RegisterCompanyInput) {
    let registerStep = "check-existing-user";

    try {
      const normalizedEmail = input.email.toLowerCase();
      console.info("[auth.register] step=check-existing-user", { email: normalizedEmail });
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        throw new AppError("Email already exists.", 409, "EMAIL_ALREADY_EXISTS");
      }

      registerStep = "hash-password";
      console.info("[auth.register] step=hash-password");
      const passwordHash = await hashValue(input.password);

      registerStep = "generate-business-id";
      const identity = createBusinessIdentifier(input.companyName);
      const businessSlug = `${identity.slug}-${identity.businessId.toLowerCase()}`;
      console.info("[auth.register] step=generate-business-id", {
        businessId: identity.businessId,
        businessSlug,
      });

      registerStep = "transaction-start";
      const user = await prisma.$transaction(async (transaction) => {
        registerStep = "create-business";
        console.info("[auth.register] step=create-business", {
          businessId: identity.businessId,
          companyName: input.companyName,
        });

        const business = await transaction.business.create({
          data: {
            businessId: identity.businessId,
            name: input.companyName,
            slug: businessSlug,
            email: normalizedEmail,
          },
        });

        registerStep = "create-default-permissions";
        console.info("[auth.register] step=create-default-permissions", {
          businessId: business.businessId,
        });
        await this.createDefaultPermissions(transaction, business.businessId);

        registerStep = "create-default-roles";
        console.info("[auth.register] step=create-default-roles", {
          businessId: business.businessId,
        });
        await this.createDefaultRoles(transaction, business.businessId);

        registerStep = "find-owner-role";
        console.info("[auth.register] step=find-owner-role", {
          businessId: business.businessId,
          roleName: env.DEFAULT_OWNER_ROLE,
        });
        const ownerRole = await transaction.role.findFirst({
          where: {
            businessId: business.businessId,
            name: env.DEFAULT_OWNER_ROLE,
          },
        });

        if (!ownerRole) {
          throw new AppError("Owner role was not created.", 500, "OWNER_ROLE_MISSING");
        }

        registerStep = "create-owner-user";
        console.info("[auth.register] step=create-owner-user", {
          businessId: business.businessId,
          email: normalizedEmail,
        });
        const owner = await transaction.user.create({
          data: {
            businessId: business.businessId,
            roleId: ownerRole.id,
            fullName: input.fullName,
            email: normalizedEmail,
            passwordHash,
          },
          include: {
            role: true,
            business: true,
          },
        });

        registerStep = "link-owner-to-business";
        console.info("[auth.register] step=link-owner-to-business", {
          businessRecordId: business.id,
          ownerUserId: owner.id,
        });
        await transaction.business.update({
          where: { id: business.id },
          data: { ownerUserId: owner.id },
        });

        registerStep = "create-settings";
        console.info("[auth.register] step=create-settings", {
          businessId: business.businessId,
        });
        await transaction.setting.create({
          data: {
            businessId: business.businessId,
          },
        });

        registerStep = "create-activity-log";
        console.info("[auth.register] step=create-activity-log", {
          businessId: business.businessId,
          userId: owner.id,
        });
        await transaction.activityLog.create({
          data: {
            businessId: business.businessId,
            userId: owner.id,
            action: "AUTH_REGISTER",
            entity: "Business",
            entityId: business.id,
            metadata: {
              email: owner.email,
            },
          },
        });

        return owner;
      });

      registerStep = "send-email-verification";
      await this.sendEmailVerificationTokenSafely(user.id, user.businessId, user.email);

      registerStep = "issue-session-tokens";
      const session = await this.issueSessionTokens(user);

      registerStep = "serialize-response";
      return {
        user: this.serializeUser(user),
        business: user.business,
        tokens: this.toPublicTokens(session),
        refreshToken: session.refreshToken,
      };
    } catch (error) {
      console.error("[auth.register] failing step:", registerStep);
      console.error("[auth.register] full error:", error);

      if (error instanceof Error) {
        console.error("[auth.register] error stack:", error.stack);
        Object.assign(error, { failingStep: registerStep });
      } else {
        const wrapped = new Error(String(error));
        Object.assign(wrapped, { failingStep: registerStep, originalError: error });
        throw wrapped;
      }

      throw error;
    }
  }

  async login(input: LoginInput) {
    let loginStep = "load-user";

    try {
      const normalizedEmail = input.email.toLowerCase();
      console.info("[auth.login] step=load-user", { email: normalizedEmail });
      const user = await this.getUserByEmail(normalizedEmail);

      if (!user) {
        throw new AppError("Invalid email or password.", 401, "INVALID_CREDENTIALS");
      }

      loginStep = "verify-password";
      const passwordMatches = await compareHash(input.password, user.passwordHash);
      if (!passwordMatches) {
        throw new AppError("Invalid email or password.", 401, "INVALID_CREDENTIALS");
      }

      loginStep = "create-activity-log";
      await prisma.activityLog.create({
        data: {
          businessId: user.businessId,
          userId: user.id,
          action: "AUTH_LOGIN",
          entity: "User",
          entityId: user.id,
        },
      });

      loginStep = "issue-session";
      return {
        user: this.serializeUser(user),
        business: user.business,
        ...this.createSessionResponse(await this.issueSessionTokens(user)),
      };
    } catch (error) {
      console.error("[auth.login] failing step:", loginStep);
      console.error("[auth.login] full error:", error);

      if (error instanceof Error) {
        console.error("[auth.login] error stack:", error.stack);
      }

      throw error;
    }
  }

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) return;

    const payload = verifyRefreshToken(refreshToken);
    await prisma.refreshToken.deleteMany({
      where: {
        id: payload.tokenId,
        businessId: payload.businessId,
        userId: payload.sub,
      },
    });
  }

  async refreshSession(refreshToken: string | undefined) {
    if (!refreshToken) {
      throw new AppError("Refresh token is required.", 401, "REFRESH_TOKEN_REQUIRED");
    }

    const payload = verifyRefreshToken(refreshToken);
    const tokenRecord = await prisma.refreshToken.findFirst({
      where: {
        id: payload.tokenId,
        businessId: payload.businessId,
        userId: payload.sub,
      },
      include: {
        user: {
          include: {
            business: true,
            role: true,
          },
        },
      },
    });

    if (!tokenRecord) {
      throw new AppError("Refresh token is invalid.", 401, "INVALID_REFRESH_TOKEN");
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new AppError("Refresh token has expired.", 401, "EXPIRED_REFRESH_TOKEN");
    }

    const validHash = await compareHash(refreshToken, tokenRecord.tokenHash);
    if (!validHash) {
      throw new AppError("Refresh token is invalid.", 401, "INVALID_REFRESH_TOKEN");
    }

    await prisma.refreshToken.delete({
      where: { id: tokenRecord.id },
    });

    return {
      user: this.serializeUser(tokenRecord.user),
      business: tokenRecord.user.business,
      ...this.createSessionResponse(await this.issueSessionTokens(tokenRecord.user)),
    };
  }

  async forgotPassword(email: string) {
    const user = await this.getUserByEmail(email.toLowerCase());
    if (!user) {
      return { message: "If the account exists, a reset link has been sent." };
    }

    await emailService.ensureAvailable();

    const rawToken = randomUUID();
    const tokenHash = await hashValue(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await prisma.passwordResetToken.create({
      data: {
        businessId: user.businessId,
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    await emailService.sendEmail({
      to: user.email,
      subject: "Reset your LOGISTICSFLOW password",
      html: `Use this reset token: ${rawToken}`,
    });

    return {
      message: "If the account exists, a reset link has been sent.",
    };
  }

  async resetPassword(token: string, password: string) {
    const tokenRecords = await prisma.passwordResetToken.findMany({
      where: {
        usedAt: null,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const tokenRecord = await this.findMatchingToken(token, tokenRecords);
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new AppError("Reset token is invalid or expired.", 400, "INVALID_RESET_TOKEN");
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: tokenRecord.userId },
        data: {
          passwordHash: await hashValue(password),
        },
      }),
      prisma.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: {
          usedAt: new Date(),
        },
      }),
    ]);

    return { message: "Password reset successfully." };
  }

  async changePassword(userId: string, businessId: string, input: ChangePasswordInput) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        businessId,
      },
    });

    if (!user) {
      throw new AppError("User not found.", 404, "USER_NOT_FOUND");
    }

    const matches = await compareHash(input.currentPassword, user.passwordHash);
    if (!matches) {
      throw new AppError("Current password is incorrect.", 400, "INVALID_CURRENT_PASSWORD");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashValue(input.newPassword),
      },
    });

    return { message: "Password changed successfully." };
  }

  async verifyEmail(token: string) {
    const tokenRecords = await prisma.emailVerificationToken.findMany({
      where: {
        usedAt: null,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const tokenRecord = await this.findMatchingToken(token, tokenRecords);
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new AppError("Verification token is invalid or expired.", 400, "INVALID_VERIFICATION_TOKEN");
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: tokenRecord.userId },
        data: {
          isEmailVerified: true,
        },
      }),
      prisma.emailVerificationToken.update({
        where: { id: tokenRecord.id },
        data: {
          usedAt: new Date(),
        },
      }),
    ]);

    return { message: "Email verified successfully." };
  }

  private async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        business: true,
        role: true,
      },
    });
  }

  private async issueSessionTokens(user: AuthenticatedUser): Promise<PrivateSessionTokens> {
    const role = user.role?.name ?? "Viewer";
    const permissions = getPermissionsForRole(role);
    const tokenId = randomUUID();
    const accessToken = signAccessToken({
      sub: user.id,
      businessId: user.businessId,
      role,
      permissions,
    });
    const refreshToken = signRefreshToken({
      sub: user.id,
      businessId: user.businessId,
      tokenId,
    });

    await prisma.refreshToken.create({
      data: {
        id: tokenId,
        businessId: user.businessId,
        userId: user.id,
        tokenHash: await hashValue(refreshToken),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    };
  }

  private createSessionResponse(session: PrivateSessionTokens) {
    return {
      tokens: this.toPublicTokens(session),
      refreshToken: session.refreshToken,
    };
  }

  private toPublicTokens(session: PrivateSessionTokens): PublicSessionTokens {
    return {
      accessToken: session.accessToken,
      expiresIn: session.expiresIn,
    };
  }

  private serializeUser(user: AuthenticatedUser) {
    return {
      id: user.id,
      businessId: user.businessId,
      fullName: user.fullName,
      email: user.email,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      role: user.role?.name ?? "Viewer",
      permissions: getPermissionsForRole(user.role?.name),
      createdAt: user.createdAt,
    };
  }

  private async createEmailVerificationToken(userId: string, businessId: string, email: string) {
    const rawToken = randomUUID();
    await prisma.emailVerificationToken.create({
      data: {
        businessId,
        userId,
        tokenHash: await hashValue(rawToken),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });

    await emailService.sendEmail({
      to: email,
      subject: "Verify your LOGISTICSFLOW account",
      html: `Use this verification token: ${rawToken}`,
    });
  }

  private async sendEmailVerificationTokenSafely(userId: string, businessId: string, email: string) {
    try {
      await this.createEmailVerificationToken(userId, businessId, email);
    } catch (error) {
      console.error("Failed to send email verification token after registration:", error);
    }
  }

  private async createDefaultPermissions(transaction: Prisma.TransactionClient, businessId: string) {
    await transaction.permission.createMany({
      data: defaultPermissionKeys.map((key) => {
        const [resource, action] = key.split(":");
        return {
          businessId,
          key,
          resource,
          action,
          description: `${resource} ${action} permission`,
        };
      }),
    });
  }

  private async createDefaultRoles(transaction: Prisma.TransactionClient, businessId: string) {
    const permissions = await transaction.permission.findMany({
      where: { businessId },
    });
    const permissionMap = new Map(permissions.map((permission) => [permission.key, permission.id]));

    for (const [name, keys] of Object.entries(defaultRoleDefinitions)) {
      const role = await transaction.role.create({
        data: {
          businessId,
          name,
          description: `${name} role`,
          isSystem: true,
        },
      });

      await transaction.rolePermission.createMany({
        data: keys
          .map((key) => permissionMap.get(key))
          .filter((permissionId): permissionId is string => Boolean(permissionId))
          .map((permissionId) => ({
            businessId,
            roleId: role.id,
            permissionId,
          })),
      });
    }
  }

  private async findMatchingToken<T extends { tokenHash: string }>(rawToken: string, tokens: T[]) {
    for (const token of tokens) {
      const matches = await compareHash(rawToken, token.tokenHash);
      if (matches) {
        return token;
      }
    }

    return null;
  }
}

export const authService = new AuthService();

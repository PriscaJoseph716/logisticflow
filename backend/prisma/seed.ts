import { PrismaClient } from "@prisma/client";
import { defaultPermissionKeys, defaultRoleDefinitions } from "../src/utils/default-authz.js";
import { createBusinessIdentifier } from "../src/utils/business-id.js";
import { hashValue } from "../src/utils/hash.js";

const prisma = new PrismaClient();

async function main() {
  const businessName = "LOGISTICSFLOW Demo";
  const ownerEmail = "owner@logisticsflow.local";
  const ownerPassword = "ChangeMe123!";
  const { businessId, slug } = createBusinessIdentifier(businessName);

  const existingUser = await prisma.user.findUnique({
    where: { email: ownerEmail },
  });

  if (existingUser) {
    console.info("Seed already applied.");
    return;
  }

  const passwordHash = await hashValue(ownerPassword);

  await prisma.$transaction(async (transaction) => {
    const business = await transaction.business.create({
      data: {
        businessId,
        name: businessName,
        slug,
        email: ownerEmail,
      },
    });

    await transaction.permission.createMany({
      data: defaultPermissionKeys.map((key) => {
        const [resource, action] = key.split(":");
        return {
          businessId: business.businessId,
          key,
          resource,
          action,
          description: `${resource} ${action} permission`,
        };
      }),
    });

    const permissions = await transaction.permission.findMany({
      where: { businessId: business.businessId },
    });
    const permissionMap = new Map(permissions.map((permission) => [permission.key, permission.id]));

    for (const [name, keys] of Object.entries(defaultRoleDefinitions)) {
      const role = await transaction.role.create({
        data: {
          businessId: business.businessId,
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
            businessId: business.businessId,
            roleId: role.id,
            permissionId,
          })),
      });
    }

    const ownerRole = await transaction.role.findFirstOrThrow({
      where: { businessId: business.businessId, name: "Owner" },
    });

    const owner = await transaction.user.create({
      data: {
        businessId: business.businessId,
        roleId: ownerRole.id,
        fullName: "Demo Owner",
        email: ownerEmail,
        passwordHash,
        isEmailVerified: true,
      },
    });

    await transaction.business.update({
      where: { id: business.id },
      data: { ownerUserId: owner.id },
    });

    await transaction.setting.create({
      data: {
        businessId: business.businessId,
      },
    });
  });

  console.info(`Seed complete. Demo owner: ${ownerEmail} / ${ownerPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

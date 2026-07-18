import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private transporter: Transporter | null = null;

  private verificationPromise: Promise<void> | null = null;

  private hasConfiguration() {
    return Boolean(env.SMTP_HOST && (env.SMTP_FROM || env.SMTP_USER));
  }

  private getTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth:
          env.SMTP_USER && env.SMTP_PASS
            ? {
                user: env.SMTP_USER,
                pass: env.SMTP_PASS,
              }
            : undefined,
      });
    }

    return this.transporter;
  }

  async ensureAvailable() {
    if (!this.hasConfiguration()) {
      if (env.NODE_ENV === "production") {
        throw new AppError(
          "Email service is not configured for production. Set SMTP_HOST and SMTP_FROM or SMTP_USER.",
          503,
          "EMAIL_SERVICE_NOT_CONFIGURED",
        );
      }

      return;
    }

    if (!this.verificationPromise) {
      this.verificationPromise = this.getTransporter()
        .verify()
        .then(() => undefined)
        .catch((error: unknown) => {
          this.verificationPromise = null;
          throw new AppError("Email service configuration is invalid.", 503, "EMAIL_SERVICE_UNAVAILABLE", error);
        });
    }

    await this.verificationPromise;
  }

  async sendEmail(payload: EmailPayload) {
    if (!this.hasConfiguration()) {
      if (env.NODE_ENV === "production") {
        throw new AppError(
          "Email service is not configured for production. Set SMTP_HOST and SMTP_FROM or SMTP_USER.",
          503,
          "EMAIL_SERVICE_NOT_CONFIGURED",
        );
      }

      console.info(`[email] to=${payload.to} subject=${payload.subject}`);
      return;
    }

    await this.ensureAvailable();
    await this.getTransporter().sendMail({
      from: env.SMTP_FROM || env.SMTP_USER,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
  }
}

export const emailService = new EmailService();

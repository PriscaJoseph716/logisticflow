interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  async sendEmail(payload: EmailPayload) {
    // Placeholder for SMTP/Resend/SendGrid integration.
    console.info(`[email] to=${payload.to} subject=${payload.subject}`);
  }
}

export const emailService = new EmailService();

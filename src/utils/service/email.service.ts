
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/sendmail-transport';

@Injectable()
export class EmailService {
  private readonly applicationName: string;
  private readonly gmail: string;
  private readonly password: string;

  constructor(private readonly configService: ConfigService) {
    this.applicationName =
      this.configService.get<string>('APPLICATION_NAME') ?? 'Pharmacy System';

    this.gmail =
      this.configService.get<string>('GMAIL') ?? '';

    this.password =
      this.configService.get<string>('PASSWORD') ?? '';
  }

  async sendEmail({
    to,
    cc,
    bcc,
    subject,
    html,
    attachments = [],
  }: MailOptions): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.gmail,
        pass: this.password,
      },
    });

    try {
      const info = await transporter.sendMail({
        from: `"${this.applicationName}" <${this.gmail}>`,
        to,
        cc,
        bcc,
        subject,
        html,
        attachments,
      });

      console.log(`📧 Email sent successfully: ${info.messageId}`);
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw error;
    }
  }

 emailTemplate({
  code,
  title = 'Verify Your Pharmacy Account',
}: {
  code: number;
  title?: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>

  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f4f8f6;
      font-family: Arial, Helvetica, sans-serif;
    "
  >
    <div
      style="
        width: 100%;
        padding: 40px 0;
      "
    >
      <div
        style="
          max-width: 560px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        "
      >

        <!-- Header -->
        <div
          style="
            background-color: #0f766e;
            padding: 30px 25px;
            text-align: center;
          "
        >
          <div
            style="
              width: 55px;
              height: 55px;
              margin: 0 auto 15px;
              background-color: #ffffff;
              border-radius: 50%;
              line-height: 55px;
              font-size: 28px;
            "
          >
            +
          </div>

          <h1
            style="
              margin: 0;
              color: #ffffff;
              font-size: 24px;
              font-weight: 600;
            "
          >
            ${this.applicationName}
          </h1>

          <p
            style="
              margin: 8px 0 0;
              color: #d1fae5;
              font-size: 14px;
            "
          >
            Pharmacy Management System
          </p>
        </div>

        <!-- Content -->
        <div
          style="
            padding: 40px 35px;
            text-align: center;
          "
        >

          <h2
            style="
              margin: 0 0 15px;
              color: #1f2937;
              font-size: 22px;
            "
          >
            ${title}
          </h2>

          <p
            style="
              margin: 0;
              color: #6b7280;
              font-size: 15px;
              line-height: 1.7;
            "
          >
            Please use the verification code below to continue.
            This code will help us keep your pharmacy account secure.
          </p>

          <!-- OTP -->
          <div
            style="
              margin: 30px 0;
              padding: 22px;
              background-color: #ecfdf5;
              border: 1px solid #a7f3d0;
              border-radius: 12px;
            "
          >
            <p
              style="
                margin: 0 0 10px;
                color: #047857;
                font-size: 13px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
              "
            >
              Verification Code
            </p>

            <div
              style="
                color: #065f46;
                font-size: 34px;
                font-weight: 700;
                letter-spacing: 9px;
              "
            >
              ${code}
            </div>
          </div>

          <p
            style="
              margin: 0;
              color: #6b7280;
              font-size: 14px;
              line-height: 1.6;
            "
          >
            This verification code is valid for
            <strong style="color: #047857;">2 minutes</strong>.
          </p>

          <!-- Security Notice -->
          <div
            style="
              margin-top: 25px;
              padding: 15px;
              background-color: #f9fafb;
              border-radius: 8px;
            "
          >
            <p
              style="
                margin: 0;
                color: #6b7280;
                font-size: 13px;
                line-height: 1.6;
              "
            >
              🔒 For your security, never share this code with anyone.
              Our team will never ask you for your verification code.
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div
          style="
            padding: 22px 30px;
            background-color: #f9fafb;
            border-top: 1px solid #e5e7eb;
            text-align: center;
          "
        >
          <p
            style="
              margin: 0 0 6px;
              color: #374151;
              font-size: 14px;
              font-weight: 600;
            "
          >
            ${this.applicationName}
          </p>

          <p
            style="
              margin: 0;
              color: #9ca3af;
              font-size: 12px;
            "
          >
            Secure Pharmacy Management System
          </p>

          <p
            style="
              margin: 12px 0 0;
              color: #9ca3af;
              font-size: 11px;
            "
          >
            This is an automated email. Please do not reply.
          </p>
        </div>

      </div>
    </div>
  </body>
</html>
`;
}
}

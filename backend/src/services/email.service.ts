import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const ses = new SESClient({
  region: env.AWS_REGION,
  credentials: env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
        sessionToken: env.AWS_SESSION_TOKEN, // required for Learner Lab
      }
    : undefined, // falls back to IAM instance role on EC2
});

async function send(to: string, subject: string, html: string) {
  const command = new SendEmailCommand({
    Source: env.AWS_SES_FROM!,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject, Charset: 'UTF-8' },
      Body: { Html: { Data: html, Charset: 'UTF-8' } },
    },
  });

  try {
    await ses.send(command);
    logger.info(`Email sent to ${to} — ${subject}`);
  } catch (err) {
    logger.error(`Failed to send email to ${to}`, err);
    throw new Error('Email delivery failed');
  }
}

export const emailService = {
  sendVerification(to: string, token: string) {
    const link = `${env.CLIENT_URL}/verify-email?token=${token}`;
    return send(
      to,
      'Verify your CivicPulse account',
      `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2>Welcome to CivicPulse</h2>
        <p>Click the button below to verify your email address. This link expires in <strong>24 hours</strong>.</p>
        <a href="${link}" style="display:inline-block;padding:12px 24px;background:#d97706;color:#fff;border-radius:4px;text-decoration:none;font-weight:600">
          Verify Email
        </a>
        <p style="color:#6b7280;font-size:12px;margin-top:24px">
          If you didn't create an account, ignore this email.
        </p>
      </div>
      `,
    );
  },

  sendPasswordReset(to: string, token: string) {
    const link = `${env.CLIENT_URL}/reset-password?token=${token}`;
    return send(
      to,
      'Reset your CivicPulse password',
      `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2>Password Reset</h2>
        <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${link}" style="display:inline-block;padding:12px 24px;background:#d97706;color:#fff;border-radius:4px;text-decoration:none;font-weight:600">
          Reset Password
        </a>
        <p style="color:#6b7280;font-size:12px;margin-top:24px">
          If you didn't request this, ignore this email.
        </p>
      </div>
      `,
    );
  },

  sendStatusChange(to: string, issueTitle: string, newStatus: string) {
    return send(
      to,
      `Issue update: ${issueTitle}`,
      `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2>Issue Status Updated</h2>
        <p>Your issue <strong>${issueTitle}</strong> is now <strong>${newStatus.replace('_', ' ').toUpperCase()}</strong>.</p>
        <a href="${env.CLIENT_URL}/issues" style="display:inline-block;padding:12px 24px;background:#d97706;color:#fff;border-radius:4px;text-decoration:none;font-weight:600">
          View Issue
        </a>
      </div>
      `,
    );
  },
};


import "server-only";

import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import type { EmailDeliveryType } from "@prisma/client";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL =
  process.env.EMAIL_FROM || "6ixtem <info@6ixtem.com>";

const ADMIN_EMAIL = process.env.LEAD_NOTIFICATION_EMAIL;

export type EmailResult =
  | { success: true; id: string | null }
  | { success: false; error: string };

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

export function emailLayout(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;">
      <div style="padding:24px 30px;background:#0f172a;color:#ffffff;">
        <div style="font-size:24px;font-weight:800;letter-spacing:-1px;">
          6ixtem<span style="color:#60a5fa;">.</span>
        </div>
        <div style="margin-top:8px;color:#cbd5e1;font-size:12px;">
          Business systems. Built around your operations.
        </div>
      </div>
      <div style="padding:30px;line-height:1.7;">
        ${body}
      </div>
      <div style="padding:20px 30px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;line-height:1.6;">
        6ixtem · Custom business operating systems for growing service businesses.
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function emailText(value: string): string {
  return value;
}

export function getAdminNotificationEmail(): string | null {
  const email = ADMIN_EMAIL?.trim();

  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? email
    : null;
}

/**
 * Store an email before attempting delivery.
 * The unique key prevents duplicate queue records.
 */
export async function queue6ixtemEmail(input: {
  key: string;
  type: EmailDeliveryType;
  bookingId?: string | null;
  to: string;
  subject: string;
  html: string;
  text: string;
  scheduledFor?: Date;
}) {
  const to = input.to.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    throw new Error("A valid recipient email is required.");
  }

  return prisma.emailDelivery.upsert({
    where: {
      key: input.key,
    },
    create: {
      key: input.key,
      type: input.type,
      bookingId: input.bookingId ?? null,
      recipient: to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      scheduledFor: input.scheduledFor ?? new Date(),
      status: "PENDING",
    },
    update: {},
    select: {
      id: true,
      key: true,
      status: true,
    },
  });
}

/**
 * Send a single email.
 * Provider errors are returned rather than silently treated as success.
 */
export async function send6ixtemEmail(
  input: SendEmailInput,
): Promise<EmailResult> {
  if (!resend) {
    return {
      success: false,
      error: "Email provider is not configured.",
    };
  }

  if (
    !input.to ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.to.trim())
  ) {
    return {
      success: false,
      error: "A valid recipient email is required.",
    };
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: input.to.trim(),
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    if (result.error) {
      console.error("Resend email error:", result.error);

      return {
        success: false,
        error: result.error.message || "Resend rejected the email.",
      };
    }

    return {
      success: true,
      id: result.data?.id ?? null,
    };
  } catch (error) {
    console.error(
      "6ixtem email exception:",
      error instanceof Error ? error.message : String(error),
    );

    return {
      success: false,
      error: "The email could not be sent.",
    };
  }
}

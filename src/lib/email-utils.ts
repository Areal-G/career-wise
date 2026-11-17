"use server";

import { Resend } from "resend";
import { requireServerAuthenticatedUser, requireServerRole } from "@/lib/server-auth";

// Lazy initialization to avoid client-side errors
let resend: Resend | null = null;
export async function getResend(): Promise<Resend> {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export interface EmailInput {
  to: string;
  subject: string;
  body: string;
}

export interface EmailDeliveryStatus {
  messageId: string;
  status: "sent" | "delivered" | "opened" | "clicked" | "bounced" | "spam";
  timestamp: string;
}

export async function sendEmailDirect(
  _input: EmailInput
): Promise<{ success: boolean; messageId?: string }> {
  await requireServerAuthenticatedUser();
  // Portfolio demo build: email is off, so nothing ever reaches Resend.
  return { success: false };
}

export async function sendWelcomeEmailDirect(
  to: string,
  name: string
): Promise<boolean> {
  const subject = "Welcome to Career Wise!";
  const body = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Welcome to Career Wise!</h2>
      <p>Hi ${name},</p>
      <p>Welcome to Career Wise! We're thrilled to have you join our community.</p>
      <p>Get started by completing your profile to receive personalized job recommendations.</p>
      <p>Best,</p>
      <p>The Career Wise Team</p>
    </div>
  `;

  const result = await sendEmailDirect({ to, subject, body });
  return result.success;
}

export async function sendApplicationStatusEmailDirect(
  to: string,
  subject: string,
  body: string
): Promise<boolean> {
  await requireServerRole("employer");
  const result = await sendEmailDirect({ to, subject, body });
  return result.success;
}

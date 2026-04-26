import { db } from "@vireon/db";

import { sendEmail } from "./send-email";
import {
  creditsLowEmail,
  exportReadyEmail,
  generationFailedEmail,
  welcomeEmail
} from "./templates";

async function getUserEmailDetails(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      displayName: true,
      fullName: true
    }
  });
}

export async function sendWelcomeEmailNotification(params: {
  email?: string | null;
  name?: string | null;
}) {
  if (!params.email) {
    return;
  }

  await sendEmail({
    to: params.email,
    subject: "Welcome to Vireon AI",
    html: welcomeEmail(params.name ?? undefined)
  });
}

export async function sendLowCreditsEmailIfNeeded(params: {
  userId: string;
  balance: number;
}) {
  if (params.balance >= 20) {
    return;
  }

  const user = await getUserEmailDetails(params.userId);

  if (!user?.email) {
    return;
  }

  await sendEmail({
    to: user.email,
    subject: "Low credits warning",
    html: creditsLowEmail()
  });
}

export async function sendExportReadyEmailNotification(params: {
  userId: string;
  url: string;
}) {
  const user = await getUserEmailDetails(params.userId);

  if (!user?.email) {
    return;
  }

  await sendEmail({
    to: user.email,
    subject: "Your video is ready",
    html: exportReadyEmail(params.url)
  });
}

export async function sendGenerationFailedEmailNotification(userId: string) {
  const user = await getUserEmailDetails(userId);

  if (!user?.email) {
    return;
  }

  await sendEmail({
    to: user.email,
    subject: "Generation failed",
    html: generationFailedEmail()
  });
}

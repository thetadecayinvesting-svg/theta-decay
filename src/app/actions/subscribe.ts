"use server";

import { addSubscriber, hasBeehiiv } from "@/lib/beehiiv";

export type SubscribeState = { status: "idle" | "success" | "error"; message: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Handles the newsletter signup forms: checks the email, then adds it to beehiiv.
export async function subscribe(
  _previous: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  // Hidden "website" field: people never see it, spam bots fill it in.
  if (String(formData.get("website") ?? "")) {
    return { status: "success", message: "You're subscribed! Check your inbox." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const source = String(formData.get("source") ?? "website").slice(0, 40);

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return { status: "error", message: "Please enter a valid email address." };
  }
  if (!hasBeehiiv()) {
    return { status: "error", message: "Signups open soon. Please check back shortly." };
  }

  try {
    await addSubscriber(email, source);
    return {
      status: "success",
      message: "You're subscribed! Check your inbox for a welcome email.",
    };
  } catch {
    return {
      status: "error",
      message: "Something went wrong on our end. Please try again in a minute.",
    };
  }
}

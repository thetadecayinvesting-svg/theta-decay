"use server";

import { addSubscriber, BeehiivError, hasBeehiiv } from "@/lib/beehiiv";

// `email` is sent back on errors so the form can keep what the visitor typed.
export type SubscribeState = {
  status: "idle" | "success" | "error";
  message: string;
  email?: string;
};

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
    return { status: "error", message: "Please enter a valid email address.", email };
  }
  if (!hasBeehiiv()) {
    return { status: "error", message: "Signups open soon. Please check back shortly.", email };
  }

  try {
    await addSubscriber(email, source);
    return {
      status: "success",
      message: "You're subscribed! Check your inbox for a welcome email.",
    };
  } catch (err) {
    const status = err instanceof BeehiivError ? err.status : 0;
    // 400: beehiiv rejected the address. 401/403/404: our API key or
    // publication ID is wrong (check Vercel's environment variables).
    const message =
      status === 400
        ? "That email address couldn't be added. Please check it and try again."
        : status === 429
          ? "Lots of signups right now. Please try again in a minute."
          : status === 401 || status === 403 || status === 404
            ? "Signups are temporarily unavailable (setup issue). Please try again later."
            : "Something went wrong on our end. Please try again in a minute.";
    return { status: "error", message, email };
  }
}

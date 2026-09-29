// Server-only helper for the beehiiv newsletter API
// (https://developers.beehiiv.com/api-reference/subscriptions/create).
// Needs BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID in .env.local / Vercel.

import { SITE_URL } from "./site";

export class BeehiivError extends Error {
  constructor(public status: number) {
    super(`beehiiv ${status}`);
  }
}

export function hasBeehiiv() {
  return Boolean(
    process.env.BEEHIIV_API_KEY?.trim() && process.env.BEEHIIV_PUBLICATION_ID?.trim(),
  );
}

export async function addSubscriber(email: string, source: string) {
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID!.trim();
  const res = await fetch(
    `https://api.beehiiv.com/v2/publications/${encodeURIComponent(publicationId)}/subscriptions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.BEEHIIV_API_KEY!.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        reactivate_existing: true, // let people who unsubscribed come back
        send_welcome_email: true,
        utm_source: "thetadecayinvesting.com",
        utm_medium: "website",
        utm_campaign: source, // which signup form they used
        referring_site: SITE_URL,
      }),
      cache: "no-store",
    },
  );
  if (!res.ok) {
    // Log details for us, but never expose the API key or raw response to visitors.
    console.error(`beehiiv subscribe failed (${res.status}):`, await res.text().catch(() => ""));
    throw new BeehiivError(res.status);
  }
}

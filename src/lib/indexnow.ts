// IndexNow (https://www.indexnow.org): tells Bing and other participating search
// engines that pages changed, so they're re-crawled quickly. Google doesn't use it.
//
// The key is public by design: search engines confirm ownership by fetching
// https://thetadecayinvesting.com/<key>.txt (the file lives in /public).

import { SITE_URL } from "./site";

export const INDEXNOW_KEY = "01704eb2685a2131218e73292a0fa061";

export async function submitToIndexNow(urls: string[]) {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(SITE_URL).host,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    }),
    cache: "no-store",
  });
  // 200 = accepted, 202 = accepted while the key is being checked.
  return { ok: res.status === 200 || res.status === 202, status: res.status };
}

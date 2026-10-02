// Every public page address, used by the sitemap and IndexNow pings so the two
// always list the same pages.

import { PAGES } from "./pages";
import { SITE_URL } from "./site";

export const PUBLIC_PATHS = [...PAGES.map((p) => p.href), "/privacy"];

export const siteUrl = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;

export const PUBLIC_URLS = PUBLIC_PATHS.map(siteUrl);

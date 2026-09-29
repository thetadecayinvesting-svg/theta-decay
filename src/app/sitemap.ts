import type { MetadataRoute } from "next";
import { PAGES } from "@/lib/pages";
import { SITE_URL } from "@/lib/site";

// /sitemap.xml: every main page, so search engines can find them all.
export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((page) => ({
    url: `${SITE_URL}${page.href === "/" ? "" : page.href}`,
    lastModified: new Date(),
    changeFrequency: page.href === "/newsletter" || page.href === "/about" ? "monthly" : "daily",
    priority: page.href === "/" ? 1 : 0.8,
  }));
}

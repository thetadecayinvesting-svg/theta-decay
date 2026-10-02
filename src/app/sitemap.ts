import type { MetadataRoute } from "next";
import { PUBLIC_PATHS, siteUrl } from "@/lib/siteUrls";

// /sitemap.xml: every public page, so search engines can find them all.
export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({
    url: siteUrl(path),
    lastModified: new Date(),
    changeFrequency: ["/newsletter", "/about", "/privacy", "/learn"].includes(path) ? "monthly" : "daily",
    priority: path === "/" ? 1 : 0.8,
  }));
}

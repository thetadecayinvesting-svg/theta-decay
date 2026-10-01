import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// /robots.txt: search engines may crawl everything; here's the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

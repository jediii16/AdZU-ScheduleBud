import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "/",
    "/create",
    "/create/portal",
    "/create/curriculum",
    "/create/manual",
  ].map((path) => ({ url: `${SITE_URL}${path}` }));
}

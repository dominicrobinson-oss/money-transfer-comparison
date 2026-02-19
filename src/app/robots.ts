import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/analytics", "/api"],
      },
    ],
    sitemap: "https://compare.werx-health.com/sitemap.xml",
  };
}

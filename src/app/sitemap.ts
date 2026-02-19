import { MetadataRoute } from "next";

const BASE_URL = "https://compare.werx-health.com";

const corridors = [
  "/gbp-to-ngn",
  // Add other corridors here if needed, e.g. "/gbp-to-eur", "/gbp-to-usd", etc.
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date().toISOString(),
    },
    ...corridors.map((corridor) => ({
      url: `${BASE_URL}${corridor}`,
      lastModified: new Date().toISOString(),
    })),
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date().toISOString(),
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date().toISOString(),
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date().toISOString(),
    },
  ];
}

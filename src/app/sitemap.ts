import { MetadataRoute } from "next";
import { applications, resourceServices } from "@/config/nav";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://mechart3d.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, priority: 1.0, changeFrequency: "weekly" },
    { url: `${BASE_URL}/products`, lastModified: now, priority: 0.9, changeFrequency: "daily" },
    { url: `${BASE_URL}/custom-design`, lastModified: now, priority: 0.9, changeFrequency: "monthly" },
    { url: `${BASE_URL}/about`, lastModified: now, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE_URL}/contact`, lastModified: now, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE_URL}/blog`, lastModified: now, priority: 0.7, changeFrequency: "weekly" },
    { url: `${BASE_URL}/faq`, lastModified: now, priority: 0.6, changeFrequency: "monthly" },
    { url: `${BASE_URL}/cart`, lastModified: now, priority: 0.3, changeFrequency: "monthly" },
    // Applications
    { url: `${BASE_URL}/applications`, lastModified: now, priority: 0.9, changeFrequency: "monthly" },
    // Material Guide
    { url: `${BASE_URL}/material-guide`, lastModified: now, priority: 0.85, changeFrequency: "monthly" },
    { url: `${BASE_URL}/material-guide/metal`, lastModified: now, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE_URL}/material-guide/plastic`, lastModified: now, priority: 0.8, changeFrequency: "monthly" },
  ];

  // Application industry pages (×9)
  const applicationPages: MetadataRoute.Sitemap = applications.map((app) => ({
    url: `${BASE_URL}/applications/${app.slug}`,
    lastModified: now,
    priority: 0.85,
    changeFrequency: "monthly" as const,
  }));

  // Resource service pages (×3)
  const resourcePages: MetadataRoute.Sitemap = resourceServices.map((service) => ({
    url: `${BASE_URL}/resources/${service.slug}`,
    lastModified: now,
    priority: 0.75,
    changeFrequency: "monthly" as const,
  }));

  return [...staticPages, ...applicationPages, ...resourcePages];
}

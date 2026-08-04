import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nskitchen.io";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/pro", "/bookings"] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

import { MetadataRoute } from "next";
import { getTopCitiesForBuild, generateCitySlug } from "@/lib/cities";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sunscore.io";

// =============================================================================
// SITEMAP CONFIGURATION
// =============================================================================

// Sitemap includes top 1,000 cities by population for SEO reach
// Build limit (50) stays small for fast deploys - remaining cities built via ISR
// This balances national coverage with new-domain safety (avoids spam filter triggers)
const SITEMAP_CITY_LIMIT = 1000;

export default function sitemap(): MetadataRoute.Sitemap {
  const cities = getTopCitiesForBuild(SITEMAP_CITY_LIMIT);

  // Static pages (highest priority)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // City pages - sorted by population (higher priority for larger cities)
  // Top 100 cities: priority 0.9
  // Cities 101-500: priority 0.8
  // Cities 501-1000: priority 0.7
  const cityPages: MetadataRoute.Sitemap = cities.map((city, index) => {
    const slug = generateCitySlug(city.city_ascii, city.state_id);

    // Priority based on population rank
    let priority: number;
    if (index < 100) {
      priority = 0.9;
    } else if (index < 500) {
      priority = 0.8;
    } else {
      priority = 0.7;
    }

    return {
      url: `${BASE_URL}/calculator/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority,
    };
  });

  return [...staticPages, ...cityPages];
}

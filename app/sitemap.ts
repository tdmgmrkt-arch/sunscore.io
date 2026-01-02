import { MetadataRoute } from "next";
import {
  getTopCitiesForBuild,
  generateCitySlug,
  BUILD_TIME_CITY_LIMIT,
} from "@/lib/cities";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sunscore.io";

// =============================================================================
// SITEMAP CONFIGURATION
// =============================================================================

// Include the same top 5,000 cities that are pre-built at build time
// This ensures Google prioritizes indexing these high-traffic pages first
// Cities built via ISR (on-demand) are NOT included in sitemap to keep it manageable

export default function sitemap(): MetadataRoute.Sitemap {
  const cities = getTopCitiesForBuild(BUILD_TIME_CITY_LIMIT);

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
  // Cities 101-1000: priority 0.8
  // Cities 1001-5000: priority 0.7
  const cityPages: MetadataRoute.Sitemap = cities.map((city, index) => {
    const slug = generateCitySlug(city.city_ascii, city.state_id);

    // Priority based on population rank
    let priority: number;
    if (index < 100) {
      priority = 0.9;
    } else if (index < 1000) {
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

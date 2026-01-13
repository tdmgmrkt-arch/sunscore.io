import Papa from "papaparse";
import fs from "fs";
import path from "path";

export interface CityData {
  city: string;
  city_ascii: string;
  state_id: string;
  state_name: string;
  lat: string;
  lng: string;
  population: string;
  ranking: string;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

// Number of cities to pre-build at build time (sorted by population)
// The rest will be built on-demand via ISR
export const BUILD_TIME_CITY_LIMIT = 50;

// =============================================================================
// SLUG UTILITIES
// =============================================================================

// Generate URL-friendly slug from city name and state ID
export function generateCitySlug(city: string, stateId: string): string {
  return `${city.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}-${stateId.toLowerCase()}`;
}

// Parse slug back to city and state ID
export function parseSlug(slug: string): { citySlug: string; stateId: string } | null {
  const match = slug.match(/^(.+)-([a-z]{2})$/i);
  if (!match) return null;
  return { citySlug: match[1], stateId: match[2].toUpperCase() };
}

// =============================================================================
// DATA ACCESS (Server-side only)
// =============================================================================

// Cache for parsed CSV data (avoids re-parsing on every call)
let cachedCities: CityData[] | null = null;

// Read and parse CSV file (server-side only)
export function getCitiesData(): CityData[] {
  // Return cached data if available
  if (cachedCities) {
    return cachedCities;
  }

  const csvPath = path.join(process.cwd(), "public", "data", "uscities.csv");
  const csvContent = fs.readFileSync(csvPath, "utf-8");

  const result = Papa.parse<CityData>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  // Sort by population (descending) - largest cities first
  cachedCities = result.data.sort(
    (a, b) => parseInt(b.population || "0") - parseInt(a.population || "0")
  );

  return cachedCities;
}

// =============================================================================
// BUILD-TIME FUNCTIONS (for generateStaticParams & sitemap)
// =============================================================================

// Get top N cities by population for static generation at build time
// Default: Top 5,000 cities will be pre-built, rest via ISR
export function getTopCitiesForBuild(limit: number = BUILD_TIME_CITY_LIMIT): CityData[] {
  const cities = getCitiesData();
  return cities.slice(0, limit);
}

// Get all city slugs for static paths (build time)
export function getCitySlugsForBuild(limit: number = BUILD_TIME_CITY_LIMIT): string[] {
  const cities = getTopCitiesForBuild(limit);
  return cities.map((city) => generateCitySlug(city.city_ascii, city.state_id));
}

// =============================================================================
// RUNTIME FUNCTIONS (for ISR / on-demand page generation)
// =============================================================================

// Find ANY city by its slug (searches entire CSV, not just top N)
// Used for ISR - when a user visits a city page not in the top 5,000
export function getCityBySlug(slug: string): CityData | null {
  const parsed = parseSlug(slug);
  if (!parsed) return null;

  const cities = getCitiesData();

  // Find matching city (case-insensitive) - searches ALL cities
  const city = cities.find((c) => {
    const citySlug = c.city_ascii
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    return citySlug === parsed.citySlug && c.state_id.toUpperCase() === parsed.stateId;
  });

  return city || null;
}

// =============================================================================
// LEGACY EXPORTS (for backwards compatibility)
// =============================================================================

// Alias for backwards compatibility with existing code
export function getTopCities(limit?: number): CityData[] {
  return getTopCitiesForBuild(limit);
}

export function getAllCitySlugs(limit?: number): string[] {
  return getCitySlugsForBuild(limit);
}

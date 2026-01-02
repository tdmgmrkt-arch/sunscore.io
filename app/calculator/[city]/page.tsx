import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCityBySlug,
  getTopCitiesForBuild,
  generateCitySlug,
  BUILD_TIME_CITY_LIMIT,
} from "@/lib/cities";
import SolarCalculatorClient from "./SolarCalculatorClient";

// =============================================================================
// ISR CONFIGURATION
// =============================================================================

// Enable ISR: Allow cities not in generateStaticParams to be built on-demand
// When a user visits /calculator/small-town-wy (not in top 5,000), Next.js will:
// 1. Generate the page on first request
// 2. Cache it indefinitely (no revalidate = cache forever)
export const dynamicParams = true;

// DO NOT set revalidate - we want pages cached forever to minimize serverless costs
// export const revalidate = false; // This is the default, no need to set

// =============================================================================
// DYNAMIC YEAR (Auto-updates for SEO)
// =============================================================================

const currentYear = new Date().getFullYear();

// =============================================================================
// STATIC GENERATION (Build Time)
// =============================================================================

// Pre-build top 5,000 cities by population at build time
// Remaining ~25,000 cities will be built on-demand via ISR
export async function generateStaticParams() {
  const cities = getTopCitiesForBuild(BUILD_TIME_CITY_LIMIT);

  return cities.map((city) => ({
    city: generateCitySlug(city.city_ascii, city.state_id),
  }));
}

// =============================================================================
// METADATA
// =============================================================================

interface PageProps {
  params: Promise<{ city: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: slug } = await params;
  const cityData = getCityBySlug(slug);

  if (!cityData) {
    return {
      title: "City Not Found | SunScore",
    };
  }

  const title = `Solar Calculator for ${cityData.city}, ${cityData.state_id} | ${currentYear} Cost & Savings`;
  const description = `See exactly how much you can save with solar in ${cityData.city}, ${cityData.state_name}. Get your personalized estimate based on ${currentYear} electric rates, 30% Federal Tax Credit, and official NREL data. Free instant results.`;

  return {
    title,
    description,
    keywords: [
      `solar calculator ${cityData.city} ${currentYear}`,
      `${cityData.city} solar savings`,
      `solar panels ${cityData.city} ${cityData.state_id}`,
      `${cityData.state_name} solar incentives ${currentYear}`,
      "federal solar tax credit",
      "NREL solar calculator",
      `solar cost ${cityData.city}`,
    ],
    openGraph: {
      title: `Solar Calculator for ${cityData.city}, ${cityData.state_id} | ${currentYear} Cost & Savings`,
      description: `See how much you can save with solar in ${cityData.city}. Based on ${currentYear} rates with 30% Federal Tax Credit.`,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `Solar Calculator for ${cityData.city}, ${cityData.state_id} | ${currentYear}`,
      description: `Calculate your ${currentYear} solar savings in ${cityData.city}. Official NREL data.`,
    },
    alternates: {
      canonical: `/calculator/${slug}`,
    },
  };
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default async function CityCalculatorPage({ params }: PageProps) {
  const { city: slug } = await params;

  // getCityBySlug searches ALL cities in the CSV, not just top 5,000
  // This enables ISR for any valid city, even if not pre-built
  const cityData = getCityBySlug(slug);

  if (!cityData) {
    notFound();
  }

  // Prepare initial data for the calculator
  const initialData = {
    lat: parseFloat(cityData.lat),
    lng: parseFloat(cityData.lng),
    address: `${cityData.city}, ${cityData.state_name}`,
    cityName: cityData.city,
    stateName: cityData.state_name,
    stateId: cityData.state_id,
  };

  // JSON-LD Schema for Local Business/Service
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Solar Calculator for ${cityData.city}, ${cityData.state_name} | ${currentYear}`,
    description: `Calculate solar panel savings in ${cityData.city}, ${cityData.state_name} using official NREL government data. Updated for ${currentYear}.`,
    dateModified: new Date().toISOString(),
    mainEntity: {
      "@type": "SoftwareApplication",
      name: "SunScore Solar Calculator",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    areaServed: {
      "@type": "City",
      name: cityData.city,
      containedInPlace: {
        "@type": "State",
        name: cityData.state_name,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SolarCalculatorClient
        initialLat={initialData.lat}
        initialLng={initialData.lng}
        initialAddress={initialData.address}
        cityName={initialData.cityName}
        stateName={initialData.stateName}
        stateId={initialData.stateId}
        currentYear={currentYear}
      />
    </>
  );
}

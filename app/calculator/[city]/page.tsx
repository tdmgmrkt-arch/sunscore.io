import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import {
  getCityBySlug,
  getTopCitiesForBuild,
  generateCitySlug,
  getCitiesData,
  BUILD_TIME_CITY_LIMIT,
  CityData,
} from "@/lib/cities";
import { fetchNRELData, calculatePeakSunHours } from "@/utils/nrel";
import { getCityContentWithCache, GeneratedContent } from "@/utils/gemini";
import SolarCalculatorClient, { PreloadedSolarData } from "./SolarCalculatorClient";

// =============================================================================
// ISR CONFIGURATION
// =============================================================================

// Enable ISR: Allow cities not in generateStaticParams to be built on-demand
export const dynamicParams = true;

// =============================================================================
// DYNAMIC YEAR (Auto-updates for SEO)
// =============================================================================

const currentYear = new Date().getFullYear();

// =============================================================================
// STATIC GENERATION (Build Time)
// =============================================================================

// Pre-build top N cities by population at build time
// Remaining cities will be built on-demand via ISR
export async function generateStaticParams() {
  const cities = getTopCitiesForBuild(BUILD_TIME_CITY_LIMIT);

  return cities.map((city) => ({
    city: generateCitySlug(city.city_ascii, city.state_id),
  }));
}

// =============================================================================
// SERVER-SIDE DATA FETCHING
// =============================================================================

interface PageData {
  cityData: CityData;
  solarData: PreloadedSolarData | null;
  lifetimeSavings: number;
  peakSunHours: number;
  content: GeneratedContent;
  nearbyCities: CityData[];
  defaultBill: number; // Dynamic bill from NREL/climate data
}

async function getPageData(slug: string): Promise<PageData | null> {
  const cityData = getCityBySlug(slug);

  if (!cityData) {
    return null;
  }

  // Fetch NREL solar data server-side
  let solarData: PreloadedSolarData | null = null;
  let lifetimeSavings = 0;
  let peakSunHours = 5.0;

  // Default bill based on state + climate + variance
  let defaultBill = 150;

  try {
    const nrelResponse = await fetchNRELData(cityData.lat, cityData.lng, cityData.state_id, slug);
    solarData = {
      outputs: {
        ac_annual: nrelResponse.ac_annual,
        solrad_annual: nrelResponse.solrad_annual,
        ac_monthly: [], // Monthly data not returned by new API structure
      },
      station_distance_miles: nrelResponse.station_distance_miles,
    };
    lifetimeSavings = nrelResponse.estimates.twenty_five_year_savings;
    peakSunHours = calculatePeakSunHours(nrelResponse.solrad_annual);
    defaultBill = nrelResponse.estimates.default_bill;
  } catch (error) {
    console.error(`Failed to fetch NREL data for ${cityData.city}:`, error);
    // Use fallback values - the client will try to fetch if server-side fails
    lifetimeSavings = 40000; // Reasonable default
    peakSunHours = 5.0;
    defaultBill = 150;
  }

  // Generate AI content (with sun hours for climate-aware messaging)
  const content = await getCityContentWithCache(cityData, lifetimeSavings, currentYear, peakSunHours);

  // Get nearby cities (same state, sorted by population)
  const nearbyCities = getNearbyCities(cityData, 6);

  return {
    cityData,
    solarData,
    lifetimeSavings,
    peakSunHours,
    content,
    nearbyCities,
    defaultBill,
  };
}

// Helper: Calculate distance between two coordinates (Haversine formula)
function getDistanceInMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get the 6 physically closest cities in the same state
 */
function getNearbyCities(currentCity: CityData, limit: number): CityData[] {
  const allCities = getCitiesData();

  // 1. Filter by State (Performance optimization)
  const stateCities = allCities.filter(
    (c) => c.state_id === currentCity.state_id && c.city_ascii !== currentCity.city_ascii
  );

  // 2. Map cities to include their distance
  const citiesWithDistance = stateCities.map((c) => {
    const distance = getDistanceInMiles(
      parseFloat(currentCity.lat),
      parseFloat(currentCity.lng),
      parseFloat(c.lat),
      parseFloat(c.lng)
    );
    return { ...c, distance };
  });

  // 3. Sort by distance (ascending) and slice
  return citiesWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

// =============================================================================
// METADATA
// =============================================================================

interface PageProps {
  params: Promise<{ city: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: slug } = await params;
  const pageData = await getPageData(slug);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sunscore.io';

  if (!pageData) {
    return {
      title: "City Not Found | SunScore",
    };
  }

  const { cityData, content } = pageData;

  return {
    title: content.title,
    description: content.meta_description,
    keywords: [
      `solar panels ${cityData.city} ${currentYear}`,
      `${cityData.city} solar calculator`,
      `solar savings ${cityData.city} ${cityData.state_id}`,
      `${cityData.state_name} solar incentives ${currentYear}`,
      "solar energy savings",
      "NREL solar calculator",
      `solar cost ${cityData.city}`,
    ],
    openGraph: {
      title: content.title,
      description: content.meta_description,
      type: "website",
      locale: "en_US",
      url: `${baseUrl}/calculator/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: content.title,
      description: content.meta_description,
    },
    alternates: {
      canonical: `${baseUrl}/calculator/${slug}`,
    },
  };
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default async function CityCalculatorPage({ params }: PageProps) {
  const { city: slug } = await params;
  const pageData = await getPageData(slug);

  if (!pageData) {
    notFound();
  }

  const { cityData, solarData, lifetimeSavings, peakSunHours, content, nearbyCities, defaultBill } = pageData;

  // Prepare initial data for the calculator
  const initialData = {
    lat: parseFloat(cityData.lat),
    lng: parseFloat(cityData.lng),
    address: `${cityData.city}, ${cityData.state_name}`,
    cityName: cityData.city,
    stateName: cityData.state_name,
    stateId: cityData.state_id,
  };

  // JSON-LD Schema for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: content.title,
    description: content.meta_description,
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

  // Breadcrumb Schema for Rich Snippets
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sunscore.io';
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Locations",
        item: `${baseUrl}/locations`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: cityData.state_name,
        item: `${baseUrl}/locations/${cityData.state_id.toLowerCase()}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: cityData.city,
        item: `${baseUrl}/calculator/${slug}`,
      },
    ],
  };

  // FAQ Schema for Rich Snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How much can I save with solar in ${cityData.city}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Solar savings in ${cityData.city}, ${cityData.state_name} depend on your current electricity usage, roof orientation, and local utility rates. Our calculator uses official NREL satellite data specific to ${cityData.city}'s location to provide accurate estimates. Most homeowners save $15,000-$50,000 over 25 years.`,
        },
      },
      {
        "@type": "Question",
        name: "How long does it take for solar to pay for itself?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `The payback period for solar in ${cityData.city} depends on your electricity costs, system size, and local sun exposure. Most homeowners see their system pay for itself in 6-10 years through electricity savings. After that point, you're generating free electricity for the remaining life of your system.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the average SunScore in ${cityData.state_name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${cityData.state_name} generally has good solar potential. The SunScore is based on peak sun hours per day from NREL satellite data. Scores above 70 indicate good solar potential, while scores above 85 are excellent.`,
        },
      },
      {
        "@type": "Question",
        name: "What are my financing options?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You have several options: Cash Purchase (highest ROI), Solar Loans ($0 down available), Lease (lower savings, no upfront cost), or PPA (pay for power produced at a fixed rate).",
        },
      },
    ],
  };

  // ==========================================================================
  // NAMED SLOTS - Server-rendered content injected into client component
  // ==========================================================================

  // SLOT 0: Breadcrumb Navigation - Renders below header
  const BreadcrumbNav = (
    <nav
      aria-label="Breadcrumb"
      className="max-w-5xl mx-auto px-4 py-3 border-b border-gray-800/30"
    >
      <ol className="flex items-center gap-1 text-xs text-gray-500 flex-wrap">
        {/* Home */}
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only md:not-sr-only">Home</span>
          </Link>
        </li>
        <li>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
        </li>

        {/* Locations */}
        <li>
          <Link
            href="/locations"
            className="hover:text-emerald-400 transition-colors"
          >
            Locations
          </Link>
        </li>
        <li>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
        </li>

        {/* State */}
        <li>
          <Link
            href={`/locations/${cityData.state_id.toLowerCase()}`}
            className="hover:text-emerald-400 transition-colors"
          >
            {cityData.state_name}
          </Link>
        </li>
        <li>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
        </li>

        {/* Current City (not a link) */}
        <li>
          <span className="text-gray-400 font-medium">{cityData.city}</span>
        </li>
      </ol>
    </nav>
  );

  // SLOT 1: Intro Card (Glassmorphism Style) - Renders between Score & Chart
  const IntroCard = (
    <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
        <span className="text-emerald-400">⚡</span>
        Why Solar in {cityData.city}?
      </h3>
      <div
        className="prose prose-invert prose-sm prose-p:text-gray-300 prose-p:m-0 prose-strong:text-emerald-400"
        dangerouslySetInnerHTML={{ __html: content.intro_content }}
      />
    </div>
  );

  // SLOT 2: Detailed Analysis (Dashboard-matched styling) - Renders above FAQ
  const DetailedSection = (
    <section className="max-w-4xl mx-auto">
      {/* Section Header - Matching dashboard style */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Financial Deep Dive
        </h2>
        <p className="text-gray-400 mt-2 text-sm">
          Understanding your solar investment in {cityData.city}
        </p>
      </div>

      {/* Content Card - Dashboard gradient style */}
      <div
        className="p-6 md:p-8 bg-gradient-to-br from-gray-900/90 via-slate-950/95 to-gray-900/90 border border-cyan-500/20 rounded-2xl backdrop-blur-sm relative overflow-hidden"
        style={{
          boxShadow: '0 0 30px rgba(6, 182, 212, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 via-transparent to-transparent pointer-events-none" />

        {/* Formatted content */}
        <div
          className="relative z-10 space-y-6
            [&>h3]:text-lg [&>h3]:md:text-xl [&>h3]:font-bold [&>h3]:text-white [&>h3]:mb-3 [&>h3]:flex [&>h3]:items-center [&>h3]:gap-2
            [&>h3]:before:content-['💡'] [&>h3]:before:text-base
            [&>p]:text-gray-300 [&>p]:leading-relaxed [&>p]:text-sm [&>p]:md:text-base
            [&_strong]:text-emerald-400 [&_strong]:font-semibold"
          dangerouslySetInnerHTML={{ __html: content.detailed_content }}
        />
      </div>
    </section>
  );

  // SLOT 3: Nearby Cities (Footer navigation) - Renders below FAQ
  const NearbyCitiesSection = (
    <section className="mt-16 space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center">
          Solar Calculators for Cities Near {cityData.city}
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Compare solar savings across {cityData.state_name} with our city-specific calculators.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
        {nearbyCities.map((city) => {
          const citySlug = generateCitySlug(city.city_ascii, city.state_id);
          return (
            <Link
              key={citySlug}
              href={`/calculator/${citySlug}`}
              className="p-4 bg-gradient-to-br from-gray-900/90 via-slate-950/95 to-gray-900/90 border border-gray-800/50 rounded-xl hover:border-emerald-500/50 transition-all duration-300 text-center group"
            >
              <span className="text-gray-300 text-sm font-medium group-hover:text-emerald-400 transition-colors">
                {city.city}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="text-center mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
        >
          <span>View all cities</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <SolarCalculatorClient
        initialLat={initialData.lat}
        initialLng={initialData.lng}
        initialAddress={initialData.address}
        cityName={initialData.cityName}
        stateName={initialData.stateName}
        stateId={initialData.stateId}
        currentYear={currentYear}
        preloadedSolarData={solarData ?? undefined}
        initialMonthlyBill={defaultBill}
        // Named slots
        breadcrumbSlot={BreadcrumbNav}
        introSlot={IntroCard}
        detailedSlot={DetailedSection}
        nearbyCitiesSlot={NearbyCitiesSection}
      />
    </>
  );
}

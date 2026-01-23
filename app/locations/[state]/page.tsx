import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowLeft, ChevronRight } from "lucide-react";
import { getTopCitiesForBuild, generateCitySlug } from "@/lib/cities";

// =============================================================================
// STATE NAME MAPPING
// =============================================================================

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia",
  PR: "Puerto Rico",
};

// =============================================================================
// STATIC GENERATION
// =============================================================================

export async function generateStaticParams() {
  const cities = getTopCitiesForBuild(1000);

  // Extract unique states and return lowercase params
  const uniqueStates = [...new Set(cities.map((city) => city.state_id))];

  return uniqueStates.map((stateId) => ({
    state: stateId.toLowerCase(),
  }));
}

// =============================================================================
// METADATA
// =============================================================================

interface PageProps {
  params: Promise<{ state: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state } = await params;
  const stateUpper = state.toUpperCase();
  const stateName = STATE_NAMES[stateUpper] || stateUpper;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sunscore.io";

  return {
    title: `Solar Calculators in ${stateName} | SunScore`,
    description: `Find solar savings calculators for cities in ${stateName}. Get personalized 25-year savings estimates based on official NREL data.`,
    openGraph: {
      title: `Solar Calculators in ${stateName} | SunScore`,
      description: `Find solar savings calculators for cities in ${stateName}. Get personalized 25-year savings estimates based on official NREL data.`,
    },
    alternates: {
      canonical: `${baseUrl}/locations/${state}`,
    },
  };
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default async function StateCitiesPage({ params }: PageProps) {
  const { state } = await params;
  const stateUpper = state.toUpperCase();
  const stateName = STATE_NAMES[stateUpper];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sunscore.io";

  // Validate state exists
  if (!stateName) {
    notFound();
  }

  // Get cities for this state
  const allCities = getTopCitiesForBuild(1000);
  const stateCities = allCities
    .filter((city) => city.state_id.toUpperCase() === stateUpper)
    .sort((a, b) => a.city.localeCompare(b.city));

  // If no cities found for this state, show 404
  if (stateCities.length === 0) {
    notFound();
  }

  // BreadcrumbList Schema for SEO
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
        name: stateName,
        item: `${baseUrl}/locations/${state}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md">
        <nav className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/sunscore.logo.png"
              alt="SunScore - Official Solar Savings Calculator"
              width={200}
              height={48}
              className="h-8 w-auto md:h-12 max-w-[130px] md:max-w-[200px]"
              priority
            />
          </Link>
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Calculator
          </Link>
        </nav>
      </header>

      {/* Breadcrumb & Back Link */}
      <section className="max-w-5xl mx-auto px-5 md:px-4 pt-6">
        <Link
          href="/locations"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to All States
        </Link>
      </section>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-5 md:px-4 py-10 md:py-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm font-medium">
              <MapPin className="w-4 h-4" />
              <span>{stateCities.length} Cities</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Solar Calculators in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-300">
                {stateName}
              </span>
            </h1>
            <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto">
              Select a city to calculate your personalized solar savings based on
              local sun exposure and utility rates.
            </p>
          </div>
        </div>
      </section>

      {/* Cities Grid */}
      <section className="max-w-5xl mx-auto px-5 md:px-4 pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {stateCities.map((city) => {
            const slug = generateCitySlug(city.city_ascii, city.state_id);
            return (
              <Link
                key={slug}
                href={`/calculator/${slug}`}
                className="group p-4 bg-gradient-to-br from-gray-900/90 via-slate-950/95 to-gray-900/90 border border-gray-800/50 rounded-xl hover:border-emerald-500/50 transition-all duration-300 hover:scale-[1.02]"
                style={{
                  boxShadow:
                    "0 0 15px rgba(6, 182, 212, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-300 group-hover:text-emerald-400 transition-colors truncate">
                    {city.city}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-5 md:px-4 pb-16">
        <div className="p-6 md:p-8 bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/30 rounded-2xl text-center">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
            Don&apos;t see your city?
          </h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">
            Use our main calculator with your exact address for the most accurate
            solar savings estimate.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25"
          >
            <MapPin className="w-5 h-5" />
            Calculate by Address
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 bg-slate-950/80">
        <div className="max-w-5xl mx-auto px-4 md:px-5 py-8 md:py-12">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
            {/* Brand Column */}
            <div className="md:col-span-2">
              <Link href="/" className="inline-block mb-3">
                <Image
                  src="/sunscore.logo.png"
                  alt="SunScore"
                  width={150}
                  height={36}
                  className="h-8 w-auto"
                />
              </Link>
              <p className="text-xs md:text-sm text-gray-400 leading-relaxed max-w-md">
                Free solar savings calculator powered by official NREL data.
                Get accurate 25-year projections for your home.
              </p>
            </div>

            {/* Quick Links - Accordion on mobile, always visible on desktop */}
            <div className="md:block">
              <details open className="group [&:not([open])]:md:open">
                <summary className="flex items-center justify-between cursor-pointer md:cursor-default list-none py-2 md:py-0 border-b border-gray-800 md:border-0 [&::-webkit-details-marker]:hidden">
                  <h4 className="text-sm font-semibold text-white">Quick Links</h4>
                  <ChevronRight className="w-4 h-4 text-gray-500 transition-transform group-open:rotate-90 md:hidden" />
                </summary>
                <ul className="space-y-2 mt-3 md:mt-3">
                  <li>
                    <Link
                      href="/"
                      className="text-xs md:text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                    >
                      Solar Calculator
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/locations"
                      className="text-xs md:text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                    >
                      All Locations
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/quote"
                      className="text-xs md:text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                    >
                      Get Free Quote
                    </Link>
                  </li>
                </ul>
              </details>
            </div>

            {/* Legal - Accordion on mobile, always visible on desktop */}
            <div className="md:block">
              <details open className="group [&:not([open])]:md:open">
                <summary className="flex items-center justify-between cursor-pointer md:cursor-default list-none py-2 md:py-0 border-b border-gray-800 md:border-0 [&::-webkit-details-marker]:hidden">
                  <h4 className="text-sm font-semibold text-white">Legal</h4>
                  <ChevronRight className="w-4 h-4 text-gray-500 transition-transform group-open:rotate-90 md:hidden" />
                </summary>
                <ul className="space-y-2 mt-3 md:mt-3">
                  <li>
                    <Link
                      href="/privacy-policy"
                      className="text-xs md:text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms-of-service"
                      className="text-xs md:text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                    >
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/disclaimer"
                      className="text-xs md:text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                    >
                      Disclaimer
                    </Link>
                  </li>
                </ul>
              </details>
            </div>
          </div>

          {/* Disclaimers - Compact on mobile */}
          <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-800/50">
            <div className="space-y-3 md:space-y-4 text-[10px] md:text-xs text-gray-500 leading-relaxed">
              <p>
                <strong className="text-gray-400">Data Source:</strong> Solar
                estimates powered by the National Renewable Energy Laboratory
                (NREL) PVWatts® Calculator. Results are estimates based on
                typical meteorological year data and may vary.
              </p>
              <p>
                <strong className="text-gray-400">
                  Affiliate Disclosure:
                </strong>{" "}
                SunScore may receive compensation when you request quotes
                through our partners. This does not influence our calculations
                or recommendations. All solar data comes directly from NREL.
              </p>
              <p>
                <strong className="text-gray-400">Disclaimer:</strong> SunScore
                provides estimates for educational purposes only. Actual savings
                depend on system size, local incentives, installation costs, and
                energy usage patterns. Consult qualified solar installers for
                accurate quotes.
              </p>
            </div>
          </div>

          {/* FTC Affiliate Disclosure */}
          <div className="mt-4 md:mt-6 p-3 md:p-4 bg-slate-900/50 border border-slate-800/50 rounded-lg">
            <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed">
              <strong className="text-gray-400">FTC Disclosure:</strong> SunScore
              participates in affiliate programs with solar installation
              partners. When you request a quote through our site, we may receive
              a referral fee at no additional cost to you. This compensation
              helps us maintain our free calculator and does not affect your
              quote pricing or our NREL-based calculations. We recommend
              comparing multiple quotes before making any solar investment
              decision.
            </p>
          </div>

          {/* Copyright Bar */}
          <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-800/50 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
            <p className="text-[10px] md:text-xs text-gray-600 text-center md:text-left">
              © {new Date().getFullYear()} SunScore. All rights reserved.
              Not affiliated with NREL or the U.S. Department of Energy.
            </p>
            <p className="text-[10px] md:text-xs text-gray-600">
              Made with solar power in the USA
            </p>
          </div>
        </div>
      </footer>
    </main>
    </>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ChevronRight } from "lucide-react";
import { getTopCitiesForBuild } from "@/lib/cities";

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = {
  title: "Solar Calculators by State | SunScore",
  description:
    "Find solar savings calculators for every major city in your state. Get personalized 25-year savings estimates based on official NREL data.",
  openGraph: {
    title: "Solar Calculators by State | SunScore",
    description:
      "Find solar savings calculators for every major city in your state. Get personalized 25-year savings estimates based on official NREL data.",
  },
};

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
// PAGE COMPONENT
// =============================================================================

export default function LocationsPage() {
  // Get top 1000 cities and extract unique states
  const cities = getTopCitiesForBuild(1000);

  // Extract unique state IDs and sort alphabetically
  const uniqueStates = [...new Set(cities.map((city) => city.state_id))].sort();

  // Count cities per state for display
  const citiesPerState: Record<string, number> = {};
  cities.forEach((city) => {
    citiesPerState[city.state_id] = (citiesPerState[city.state_id] || 0) + 1;
  });

  return (
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

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-5 md:px-4 py-12 md:py-16">
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Solar Calculators by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-300">
                State
              </span>
            </h1>
            <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto">
              Select your state to find city-specific solar calculators with
              personalized savings estimates based on official NREL data.
            </p>
          </div>
        </div>
      </section>

      {/* States Grid */}
      <section className="max-w-5xl mx-auto px-5 md:px-4 pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {uniqueStates.map((stateId) => (
            <Link
              key={stateId}
              href={`/locations/${stateId.toLowerCase()}`}
              className="group p-4 bg-gradient-to-br from-gray-900/90 via-slate-950/95 to-gray-900/90 border border-gray-800/50 rounded-xl hover:border-emerald-500/50 transition-all duration-300 hover:scale-[1.02]"
              style={{
                boxShadow:
                  "0 0 20px rgba(6, 182, 212, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
              }}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                    {STATE_NAMES[stateId] || stateId}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {citiesPerState[stateId]} {citiesPerState[stateId] === 1 ? "city" : "cities"}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-5xl mx-auto px-5 md:px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} SunScore. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy-policy"
                className="text-xs text-gray-500 hover:text-emerald-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="text-xs text-gray-500 hover:text-emerald-400 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/disclaimer"
                className="text-xs text-gray-500 hover:text-emerald-400 transition-colors"
              >
                Disclaimer
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

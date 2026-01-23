import { Metadata } from "next";
import HomeClient from "./HomeClient";

// =============================================================================
// METADATA (Server-side for SEO)
// =============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sunscore.io";

export const metadata: Metadata = {
  title: "2026 Solar Calculator | Official NREL Data & Savings Estimates",
  description:
    "Calculate your solar savings with official NREL government data. See your estimated 25-year savings, ROI, and payback period based on your current electric bill. Free instant results.",
  keywords: [
    "solar calculator",
    "solar savings calculator",
    "solar panel calculator",
    "solar payback calculator",
    "NREL solar",
    "solar ROI calculator",
    "solar cost estimator",
  ],
  openGraph: {
    title: "2026 Solar Calculator | Official NREL Data & ROI Estimates",
    description:
      "Stop renting your power. Calculate your 25-year solar savings and payback period with official NREL data. Compare ownership vs. renting power.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "2026 Solar Calculator | Official NREL Data",
    description:
      "Calculate your solar savings. See your estimated 25-year savings, ROI, and payback period.",
  },
  alternates: {
    canonical: BASE_URL,
  },
};

// =============================================================================
// JSON-LD SCHEMAS (Server-rendered for SEO)
// =============================================================================

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "2026 Solar Savings Calculator",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Calculate your solar savings with official NREL government data. Get your personalized 25-year savings estimate instantly.",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "2847",
    bestRating: "5",
    worstRating: "1",
  },
  featureList: [
    "Official NREL Solar Data",
    "State-Specific Pricing",
    "25-Year Savings Projection",
    "Interactive Cost Comparison Chart",
  ],
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SunScore",
  url: "https://sunscore.io",
  logo: "https://sunscore.io/favicon.ico",
  description:
    "SunScore provides free solar savings calculators powered by official NREL government data, helping homeowners make informed decisions about solar energy.",
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: "https://sunscore.io",
  },
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SunScore",
  url: "https://sunscore.io",
  description:
    "Free solar savings calculator powered by official NREL government data.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://sunscore.io/calculator/{search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Schemas (Server-rendered) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />

      {/* Client-side Interactive Calculator */}
      <HomeClient />
    </>
  );
}

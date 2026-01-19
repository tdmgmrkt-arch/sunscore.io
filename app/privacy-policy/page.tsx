import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | SunScore",
  description: "Learn how SunScore collects, uses, and protects your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-300">
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

      <div className="max-w-3xl mx-auto py-12 px-6">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Calculator
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-50">
            Privacy Policy
          </h1>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-slate max-w-none space-y-8">
          <p className="text-slate-400 text-sm">Last Updated: January 2026</p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-50">
              1. Introduction
            </h2>
            <p className="leading-relaxed">
              At SunScore (sunscore.io) (&quot;we&quot;, &quot;us&quot;), we
              respect your privacy. This policy explains how we collect and use
              data.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-50">
              2. Data Collection
            </h2>
            <p className="leading-relaxed">
              We collect address data and utility usage estimates to provide
              solar calculations. This information is used solely to generate
              your personalized solar savings estimate. We do not sell your
              personal data to third-party data brokers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-50">
              3. Third-Party Tracking & Cookies (Awin)
            </h2>
            <ul className="list-disc list-inside space-y-3 text-slate-400">
              <li>
                We use third-party tracking technology provided by Awin Ltd
                (&quot;Awin&quot;).
              </li>
              <li>
                When you click on a link to our partners (e.g., SunPower), a
                cookie is placed on your browser to track the referral. This
                allows us to be credited if you complete a request.
              </li>
              <li>
                We may share non-personally identifiable information (such as
                click data and timestamps) with Awin for the purpose of tracking
                transactions and calculating commissions.
              </li>
              <li>
                For more information on how Awin processes data, please visit
                the{" "}
                <a
                  href="https://www.awin.com/us/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 underline"
                >
                  Awin Privacy Policy
                </a>
                .
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-50">
              4. Your Rights
            </h2>
            <p className="leading-relaxed">
              You may disable cookies in your browser settings, though this may
              prevent us from crediting your referral. You have the right to
              request information about the data we hold about you and to
              request its deletion.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-50">
              5. Contact Us
            </h2>
            <p className="leading-relaxed">
              If you have questions about this privacy policy, please contact us
              through our website.
            </p>
          </section>
        </div>

      </div>

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
  );
}
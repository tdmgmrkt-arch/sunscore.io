import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sun, Database, Shield, ChevronRight, Zap, Target } from "lucide-react";

export const metadata = {
  title: "About SunScore | Free Solar Savings Calculator",
  description:
    "SunScore is a free solar savings calculator powered by official NREL government data. Learn about our mission to make solar information accessible to every homeowner.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL || "https://sunscore.io"}/about`,
  },
};

export default function AboutPage() {
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

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto py-12 px-6 md:py-20">
        
        {/* Back Link */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Calculator
          </Link>
        </div>

        {/* Hero Section */}
        <div className="max-w-2xl mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
            Building a better way to explore solar.
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            SunScore is a free solar analytics tool built to give homeowners a clear, honest picture of their energy potential—before they ever have to talk to a salesperson.
          </p>
        </div>

        {/* Premium Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: The Story (Spans 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Mission Card */}
            <div className="bg-slate-900/30 border border-slate-800/50 rounded-3xl p-8 lg:p-10 h-full">
              <div className="flex items-center gap-3 mb-8">
                <Target className="w-6 h-6 text-emerald-400" />
                <h2 className="text-2xl font-semibold text-white">Why We Built This</h2>
              </div>
              
              <div className="space-y-6 text-slate-400 leading-relaxed">
                <p>
                  Shopping for solar can be overwhelming. The industry is filled with aggressive sales tactics and opaque pricing.
                </p>
                <p>
                  Most online &quot;calculators&quot; are thinly disguised lead-generation forms. They force you to hand over your phone number and email address, only to sell that data to a dozen installers before you ever see a single number.
                </p>
                <p>
                  We wanted to build something completely different: a <strong>&quot;Glass Box&quot; tool</strong>.
                </p>
                <p>
                  SunScore gives you the real math, upfront, with absolutely no strings attached. You get a personalized 25-year financial projection in seconds, completely anonymously.
                </p>
              </div>

              {/* Transparency Callout */}
              <div className="mt-10 pt-8 border-t border-slate-800/80">
                <h3 className="text-lg font-semibold text-white mb-3">Transparency & Revenue</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  SunScore is free to use because we earn referral fees if you choose to request a quote from our certified installation partners. 
                </p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  This never affects your calculator results. All data logic remains strictly independent. You can read our full <Link href="/disclaimer" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4">Affiliate Disclosure</Link> for complete transparency.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Features & Tech (Spans 5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Feature 1: NREL */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-8 hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Database className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-3">Powered by Official Data</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                We pull hyper-local solar irradiance data directly from the National Renewable Energy Laboratory&apos;s (NREL) PVWatts API. It&apos;s the exact same baseline data source used by professional engineers and installers nationwide.
              </p>
            </div>

            {/* Feature 2: Privacy */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-8 hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-3">Privacy by Default</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your initial estimate is completely anonymous. We never require a phone number or email to show you the math. When you are ready to take the next step and talk to a pro, that is entirely your choice.
              </p>
            </div>

            {/* CTA Box */}
            <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-3xl p-8">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                <Sun className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Ready to see your numbers?</h3>
              <p className="text-sm text-emerald-200/80 leading-relaxed mb-6">
                Calculate your home&apos;s 25-year solar potential in seconds.
              </p>
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all"
              >
                Launch Calculator
              </Link>
            </div>

          </div>
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
                  <li>
                    <Link
                      href="/about"
                      className="text-xs md:text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-xs md:text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                    >
                      Contact
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
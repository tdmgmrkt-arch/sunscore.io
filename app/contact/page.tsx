import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, ChevronRight, MapPin, MessageSquare, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Contact Us | SunScore",
  description:
    "Get in touch with the SunScore team. Questions about your solar estimate, partnerships, or general inquiries.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL || "https://sunscore.io"}/contact`,
  },
};

export default function ContactPage() {
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
            Get in touch
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Have a question about your solar estimate, interested in partnering
            with us, or just want to say hello? Our team is here to help.
          </p>
        </div>

        {/* Premium Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Direct Contact Cards (Spans 5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Email Card */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-8 hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Mail className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Email Us</h2>
              <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                The fastest way to reach us. We typically respond within 1–2 business days.
              </p>
              <a
                href="mailto:hello@sunscore.io"
                className="inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all"
              >
                hello@sunscore.io
              </a>
            </div>

            {/* Address Card */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-8 hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Mailing Address</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                SunScore<br />
                PO Box 614<br />
                Folsom, CA 95630
              </p>
            </div>
          </div>

          {/* Right Column: Informational Cards (Spans 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Common Inquiries Card */}
            <div className="bg-slate-900/30 border border-slate-800/50 rounded-3xl p-8 lg:p-10 h-full">
              <div className="flex items-center gap-3 mb-8">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-semibold text-white">How can we help?</h2>
              </div>

              <div className="space-y-8">
                {/* Item 1 */}
                <div>
                  <h3 className="text-slate-200 font-medium mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                    Solar Estimate Questions
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed pl-3.5 border-l border-slate-800 ml-[3px]">
                    Need help understanding your SunScore results or savings estimate? Include your city and state in your email so we can pull up the correct local data.
                  </p>
                </div>

                {/* Item 2 */}
                <div>
                  <h3 className="text-slate-200 font-medium mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                    Partnerships & Affiliates
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed pl-3.5 border-l border-slate-800 ml-[3px]">
                    Interested in working with SunScore? We actively partner with verified solar installers, local energy companies, and content creators.
                  </p>
                </div>

                {/* Item 3 */}
                <div>
                  <h3 className="text-slate-200 font-medium mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                    Press & Media
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed pl-3.5 border-l border-slate-800 ml-[3px]">
                    For media inquiries or data requests regarding local solar trends, please reach out with &quot;Press&quot; in the subject line.
                  </p>
                </div>
              </div>

              {/* Disclaimer Box inside the right column */}
              <div className="mt-10 p-5 bg-emerald-950/30 border border-emerald-900/50 rounded-2xl flex gap-4">
                <AlertCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-200/80 leading-relaxed">
                  SunScore is an educational solar analytics platform. We do not install solar panels. To get actual installation pricing, use our{" "}
                  <Link href="/quote" className="text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-4">
                    Get a Quote
                  </Link>{" "}
                  page to connect with local professionals.
                </p>
              </div>

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
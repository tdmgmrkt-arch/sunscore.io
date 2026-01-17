import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { Shield, Bell, CheckCircle2, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Get Your Solar Quote | SunScore",
  description:
    "Get personalized solar installation quotes from certified local installers in your area.",
};

export default function QuotePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md">
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
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Calculator</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12">
        <div className="max-w-lg w-full">
          {/* Card */}
          <div
            className="bg-gradient-to-br from-gray-900/95 via-slate-950/95 to-gray-900/95 border border-cyan-500/20 rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-sm relative overflow-hidden"
            style={{
              boxShadow:
                "0 0 60px rgba(6, 182, 212, 0.1), 0 0 100px rgba(16, 185, 129, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
            }}
          >
            {/* Subtle corner accents */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl" />

            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-2xl">
                <Bell className="w-8 h-8 text-emerald-400" />
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                Coming Q1 2026
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Installer Network{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  Coming Soon
                </span>
              </h1>

              <p className="text-gray-400 mb-8 leading-relaxed">
                We&apos;re partnering with top-rated solar installers across the
                country. Be the first to get matched with certified
                professionals in your area.
              </p>

              {/* Benefits */}
              <div className="flex flex-col gap-3 mb-8 text-left">
                {[
                  "Pre-vetted, licensed installers only",
                  "Competitive quotes from multiple providers",
                  "No spam - one notification when we launch",
                ].map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-3 text-sm text-gray-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {benefit}
                  </div>
                ))}
              </div>

              {/* Form */}
              <form className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full bg-gray-950/80 border border-gray-700 hover:border-gray-600 text-white px-4 py-4 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-500"
                    required
                  />
                </div>
                <button
                  type="button"
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Notify Me When Available
                </button>
              </form>

              {/* Trust indicator */}
              <div className="flex items-center justify-center gap-2 mt-6 text-xs text-gray-500">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>We respect your privacy. Unsubscribe anytime.</span>
              </div>
            </div>
          </div>

          {/* Secondary CTA */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm mb-3">
              Want to explore your solar potential now?
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              <span>Calculate your savings</span>
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800/50 py-6">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
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
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

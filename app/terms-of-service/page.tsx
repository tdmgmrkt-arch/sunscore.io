import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service | SunScore",
  description: "Terms and conditions for using the SunScore solar calculator.",
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-300">
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
            <FileText className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-50">
            Terms of Service
          </h1>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-slate max-w-none space-y-8">
          <p className="text-slate-400 text-sm">Last Updated: January 2026</p>

          <p className="text-lg leading-relaxed">
            Please read these terms carefully before using the SunScore
            (sunscore.io) solar savings calculator.
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-50">
              1. Age Requirement
            </h2>
            <p className="leading-relaxed">
              By using this site, you represent that you are at least 18 years
              of age. If you are under 18, you may only use this site with the
              involvement of a parent or guardian.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-50">
              2. Educational Use Only
            </h2>
            <p className="leading-relaxed">
              SunScore is a calculation tool designed for educational and
              informational purposes. We are not a solar installer, contractor,
              or licensed energy consultant. Our calculator provides estimates
              to help you understand potential solar savings.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-50">
              3. No Financial Advice
            </h2>
            <p className="leading-relaxed">
              The savings figures displayed are estimates based on NREL
              (National Renewable Energy Laboratory) data and are not
              guaranteed. Actual results may vary significantly based on:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li>Your specific roof condition and orientation</li>
              <li>Local shading from trees or buildings</li>
              <li>Actual utility rates and rate changes</li>
              <li>Equipment choices and installation quality</li>
              <li>Local incentives and rebates</li>
            </ul>
            <p className="leading-relaxed">
              We strongly recommend consulting with qualified solar
              professionals and financial advisors before making any investment
              decisions.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-50">
              4. Limitation of Liability
            </h2>
            <p className="leading-relaxed">
              SunScore and its operators shall not be liable for any direct,
              indirect, incidental, special, or consequential damages resulting
              from your use of the service. We are not responsible for financial
              decisions made based on these estimates.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-50">
              5. Changes to Terms
            </h2>
            <p className="leading-relaxed">
              We reserve the right to modify these terms at any time. Continued
              use of the service after changes constitutes acceptance of the new
              terms.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} SunScore. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}
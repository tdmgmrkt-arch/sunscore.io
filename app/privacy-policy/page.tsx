import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | SunScore",
  description: "Learn how SunScore collects, uses, and protects your data.",
};

export default function PrivacyPolicyPage() {
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
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-50">
            Privacy Policy
          </h1>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-slate max-w-none space-y-8">
          <p className="text-slate-400 text-sm">Last Updated: January 2025</p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-50">
              1. Introduction
            </h2>
            <p className="leading-relaxed">
              At SunScore (&quot;we&quot;, &quot;us&quot;), we respect your
              privacy. This policy explains how we collect and use data.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-50">
              2. Data Collection
            </h2>
            <p className="leading-relaxed">
              We collect address data and utility usage estimates to provide
              solar calculations. This information is used solely to generate
              your personalized solar savings estimate.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-50">
              3. Third-Party Tracking & Cookies (CJ Affiliate)
            </h2>
            <ul className="list-disc list-inside space-y-3 text-slate-400">
              <li>
                We use third-party tracking technology provided by Commission
                Junction LLC (&quot;CJ Affiliate&quot;).
              </li>
              <li>
                When you click on a link to our partners (e.g., SunPower), a
                cookie is placed on your browser to track the referral.
              </li>
              <li>
                We may share non-personally identifiable information (such as
                click data and timestamps) with CJ Affiliate for the purpose of
                tracking transactions and calculating commissions.
              </li>
              <li>
                For more information on how CJ Affiliate processes data, please
                visit the{" "}
                <a
                  href="https://www.cj.com/legal/privacy-policy-services"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 underline"
                >
                  CJ Services Privacy Policy
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

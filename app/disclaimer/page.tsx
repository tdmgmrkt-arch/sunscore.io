import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Disclaimer | SunScore",
  description:
    "Important disclaimers about SunScore solar estimates and affiliate relationships.",
};

export default function DisclaimerPage() {
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
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-50">
            Affiliate Disclosure & Disclaimer
          </h1>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-slate max-w-none space-y-8">
          <p className="text-lg leading-relaxed">
            Please read the following important disclosures before using
            SunScore or making any decisions based on our estimates.
          </p>

          {/* Affiliate Disclosure - Highlighted */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-50">
              1. Affiliate Disclosure
            </h2>
            <div className="p-5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <p className="leading-relaxed text-yellow-200/90">
                <strong>Important:</strong> SunScore is a participant in the CJ
                Affiliate (Commission Junction) program. This means we have
                commercial relationships with solar installation partners.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-50">
              2. How We Earn Money
            </h2>
            <p className="leading-relaxed">
              If you click on a &quot;Get Quote&quot; link and submit your
              information to a partner (such as SunPower), we may receive a
              commission. This referral fee is how we keep SunScore free for
              everyone to use.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-50">
              3. No Extra Cost to You
            </h2>
            <p className="leading-relaxed">
              This commission comes at no additional cost to you. The price you
              pay for solar installation is the same whether you come through
              SunScore or go directly to the installer. Our affiliate
              relationship does not affect the quotes you receive.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-50">
              4. Our Honesty Pledge
            </h2>
            <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <p className="leading-relaxed text-emerald-200/90">
                We only recommend partners that we have verified for quality and
                customer service. Our &quot;SunScore&quot; algorithm is based
                entirely on official NREL satellite data—not on which partner
                pays us the most.
              </p>
            </div>
            <p className="leading-relaxed">
              Your solar potential score is calculated using the same
              government data that professional installers use. We believe in
              transparency and providing accurate information to help you make
              informed decisions.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-50">
              5. Estimate Disclaimer
            </h2>
            <p className="leading-relaxed">
              All savings estimates, production figures, and financial
              projections are estimates only. Actual results depend on many
              factors including your specific roof, local weather, equipment
              choices, and utility rates. These estimates should not be relied
              upon as guarantees.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-50">
              6. Tax Credit Disclaimer
            </h2>
            <p className="leading-relaxed">
              The 30% Federal Investment Tax Credit (ITC) information is for
              educational purposes only. Tax credits are subject to eligibility
              requirements, and your actual benefit depends on your individual
              tax situation. Consult a qualified tax professional for advice
              specific to your circumstances.
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

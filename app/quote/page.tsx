"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Shield, CheckCircle2, ArrowLeft, User, Phone, Mail, MapPin, CheckCircle, Home, DollarSign, Share2 } from "lucide-react";

// Inner component that uses useSearchParams
function QuoteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Pre-fill address from URL params if available
  const prefilledAddress = searchParams.get("address") || "";

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: prefilledAddress,
    isHomeowner: "",
    monthlyBill: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sunscore.io';
    const shareData = {
      title: 'SunScore - Solar Savings Calculator',
      text: 'Check out how much you could save with solar panels!',
      url: shareUrl,
    };

    // Try native share API first (mobile)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or share failed, fall through to clipboard
      }
    }

    // Fallback: copy to clipboard (desktop)
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShowCopiedToast(true);
        setTimeout(() => setShowCopiedToast(false), 2000);
      } catch {
        // Clipboard failed silently
      }
    }
  };

  // Format phone number as (XXX) XXX-XXXX
  const formatPhoneNumber = (value: string): string => {
    // Strip all non-digits
    const digits = value.replace(/\D/g, '');

    // Format based on length
    if (digits.length === 0) return '';
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Apply phone formatting for phone field
    if (name === 'phone') {
      setFormData((prev) => ({
        ...prev,
        phone: formatPhoneNumber(value),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSuccess(true);
  };

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
        <div className="max-w-4xl w-full">
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
            <div className="relative z-10">
              {!isSuccess ? (
                <>
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                      Get Your{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                        Official Solar Quote
                      </span>
                    </h1>
                    <p className="text-gray-400 leading-relaxed">
                      Connect with top-rated installers in your area for a custom
                      savings analysis. Compare competitive quotes from pre-vetted
                      pros.
                    </p>
                  </div>

                  {/* Benefits */}
                  <div className="flex flex-col gap-2 mb-6 text-left">
                    {[
                      "Pre-vetted, licensed installers only",
                      "Competitive quotes from multiple providers",
                      "No obligation - 100% free estimate",
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
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Full Name"
                        className="w-full bg-gray-950/80 border border-gray-700 hover:border-gray-600 text-white pl-12 pr-4 py-4 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-500"
                        required
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="w-5 h-5 text-gray-500" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(555) 555-5555"
                        className="w-full bg-gray-950/80 border border-gray-700 hover:border-gray-600 text-white pl-12 pr-4 py-4 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-500"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-gray-500" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email Address"
                        className="w-full bg-gray-950/80 border border-gray-700 hover:border-gray-600 text-white pl-12 pr-4 py-4 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-500"
                        required
                      />
                    </div>

                    {/* Home Address */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="w-5 h-5 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Home Address"
                        className="w-full bg-gray-950/80 border border-gray-700 hover:border-gray-600 text-white pl-12 pr-4 py-4 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-500"
                        required
                      />
                    </div>

                    {/* Two-column row for qualifiers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Homeowner Status */}
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Home className="w-5 h-5 text-gray-500" />
                        </div>
                        <select
                          name="isHomeowner"
                          value={formData.isHomeowner}
                          onChange={handleChange}
                          className="w-full bg-gray-950/80 border border-gray-700 hover:border-gray-600 text-white pl-12 pr-4 py-4 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                          required
                        >
                          <option value="" disabled className="text-gray-500">Do you own your home?</option>
                          <option value="yes" className="bg-gray-900">Yes</option>
                          <option value="no" className="bg-gray-900">No</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* Monthly Bill */}
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <DollarSign className="w-5 h-5 text-gray-500" />
                        </div>
                        <select
                          name="monthlyBill"
                          value={formData.monthlyBill}
                          onChange={handleChange}
                          className="w-full bg-gray-950/80 border border-gray-700 hover:border-gray-600 text-white pl-12 pr-4 py-4 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                          required
                        >
                          <option value="" disabled className="text-gray-500">Monthly Electric Bill</option>
                          <option value="under-100" className="bg-gray-900">Under $100</option>
                          <option value="100-200" className="bg-gray-900">$100 - $200</option>
                          <option value="200-300" className="bg-gray-900">$200 - $300</option>
                          <option value="300-plus" className="bg-gray-900">$300+</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Legal Consent Text */}
                    <p className="text-xs text-gray-500 leading-relaxed px-1">
                      By clicking &quot;Get My Free Quote&quot;, I consent to receive calls,
                      texts, and emails from SunScore and its partners at the number
                      provided, including through automated technology. I understand
                      consent is not a condition of purchase.
                    </p>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        "Get My Free Quote"
                      )}
                    </button>
                  </form>

                  {/* Trust indicator - Updated for compliance */}
                  <div className="flex items-center justify-center gap-2 mt-6 text-xs text-gray-500">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Your information is secure and only shared with vetted installers.</span>
                  </div>
                </>
              ) : (
                /* Success State */
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-24 h-24 mb-6 bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-full">
                    <CheckCircle className="w-12 h-12 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Request Received
                  </h2>
                  <p className="text-gray-400 leading-relaxed mb-8 max-w-md mx-auto">
                    Your details have been securely processed. A certified
                    installer will contact you shortly to review your official
                    savings options.
                  </p>
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.history.length > 1) {
                        router.back();
                      } else {
                        router.push('/');
                      }
                    }}
                    className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Return to My Estimate
                  </button>

                  {/* Share CTA */}
                  <div className="mt-6 relative flex justify-center">
                    <button
                      onClick={handleShare}
                      className="w-full max-w-sm flex items-center justify-center gap-3 px-5 py-3 bg-white/5 border border-white/10 rounded-full text-base text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                    >
                      <Share2 className="w-5 h-5 shrink-0" />
                      <span className="leading-none">Share with a neighbor?</span>
                      <Image
                        src="/sunscore.logo.png"
                        alt="SunScore"
                        width={100}
                        height={26}
                        className="pb-1.5 h-8 w-auto shrink-0"
                      />
                    </button>

                    {/* Copied Toast */}
                    {showCopiedToast && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-xs text-emerald-400 whitespace-nowrap animate-fade-in">
                        Link Copied!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Secondary CTA */}
          {!isSuccess && (
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm mb-3">
                Want to recalculate your savings first?
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Calculator</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800/50 py-6">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-3">
          {/* FTC Affiliate Disclosure */}
          <p className="text-[10px] text-gray-600 text-center">
            SunScore is an independent consumer service. We may earn a commission when you connect with our partners.
          </p>
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
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
        </div>
      </footer>
    </main>
  );
}

// Main export with Suspense boundary for useSearchParams
export default function QuotePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>}>
      <QuoteContent />
    </Suspense>
  );
}

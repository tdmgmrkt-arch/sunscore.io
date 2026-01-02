"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      // Small delay before showing banner for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-slate-900 border-t border-slate-800"
        >
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400 text-center sm:text-left">
              We use cookies to ensure you get the best experience and to track
              referral accuracy. By using SunScore, you agree to our{" "}
              <Link
                href="/privacy-policy"
                className="text-emerald-400 hover:text-emerald-300 underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
            <button
              onClick={handleAccept}
              className="flex-shrink-0 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-semibold text-sm rounded-full transition-all duration-200 shadow-lg shadow-emerald-500/20"
            >
              Accept
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

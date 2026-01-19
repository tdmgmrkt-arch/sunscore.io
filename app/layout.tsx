import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // metadataBase ensures OG images and relative links resolve correctly
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://sunscore.io"),

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
  robots: {
    index: true,
    follow: true,
  },
  // NOTE: Do NOT add alternates.canonical here - sub-pages define their own canonicals
  // Adding canonical: "/" here would tell Google ALL pages are the homepage (de-indexing risk)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950`}
      >
        {children}
        <CookieConsent />
        <GoogleAnalytics gaId="G-ER6S3BV018" />
      </body>
    </html>
  );
}
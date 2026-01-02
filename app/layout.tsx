import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "2025 Solar Calculator | Official NREL Data & Federal Tax Credit",
  description:
    "Calculate your solar savings with official NREL government data. See your 30% Federal Tax Credit ($5,400+), 25-year savings estimate, and payback period. Free instant results.",
  keywords: [
    "solar calculator",
    "solar savings calculator",
    "solar panel calculator",
    "federal solar tax credit",
    "ITC calculator",
    "NREL solar",
    "solar ROI calculator",
    "2025 solar incentives",
  ],
  openGraph: {
    title: "2025 Solar Calculator | See Your $5,400+ Federal Tax Credit",
    description:
      "Stop renting your power. Calculate your 25-year solar savings with official NREL data. Includes 30% Federal Tax Credit.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "2025 Solar Calculator | Official NREL Data",
    description:
      "Calculate your solar savings. See your 30% Federal Tax Credit and 25-year savings.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
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
      </body>
    </html>
  );
}

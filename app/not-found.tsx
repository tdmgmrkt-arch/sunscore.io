import Link from "next/link";
import { Sun, Home } from "lucide-react";

export const metadata = {
  title: "404 - Sun Not Found | SunScore",
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative text-center max-w-md">
      {/* Sun icon with "eclipse" effect */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* Changed text-gray-700 -> text-gray-600 for better visibility */}
            <Sun className="w-24 h-24 text-gray-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-gray-950 rounded-full" />
            </div>
          </div>
        </div>

        {/* 404 Header */}
        <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-300 mb-4">
          404
        </h1>

        {/* Playful message */}
        <p className="text-xl text-gray-400 mb-8">
          Looks like the sun doesn&apos;t shine on this page.
        </p>

        {/* CTA Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25"
        >
          <Home className="w-5 h-5" />
          Return to Home
        </Link>

        {/* Subtle helper text */}
        <p className="mt-8 text-sm text-gray-600">
          The page you&apos;re looking for may have moved or doesn&apos;t exist.
        </p>
      </div>
    </main>
  );
}

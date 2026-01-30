"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { getPricePerWatt } from "@/utils/solar-pricing";
import { getElectricityRate } from "@/utils/electricity-rates";
import {
  Sun,
  Zap,
  DollarSign,
  TrendingUp,
  Shield,
  ShieldCheck,
  ChevronDown,
  MapPin,
  Calculator,
  Leaf,
  Award,
  ArrowRight,
  Clock,
  AlertCircle,
  Share2,
  Check,
  Database,
  Home,
} from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================
interface SolarData {
  outputs: {
    ac_annual: number;
    solrad_annual: number;
    ac_monthly: number[];
  };
}

interface CalculationResults {
  annualProduction: number;
  systemCost: number;
  firstYearSavings: number;
  twentyFiveYearSavings: number;
  twentyFiveYearUtilityCost: number;
  twentyFiveYearSolarCost: number;
  paybackYears: number;
  monthlyPayment: number;
  co2Offset: number;
  treesEquivalent: number;
  locationName: string;
  yearlyData: { year: number; utilityCost: number; solarCost: number }[];
  sunScore: number;
  sunHours: number;
  zipCode: string;
  homeValueIncrease: number;
  billOffset: number;
}

// Preloaded solar data from server-side NREL fetch
export interface PreloadedSolarData {
  outputs: {
    ac_annual: number;
    solrad_annual: number;
    ac_monthly: number[];
  };
  station_distance_miles: number;
}

interface SolarCalculatorClientProps {
  initialLat: number;
  initialLng: number;
  initialAddress: string;
  cityName: string;
  stateName: string;
  stateId: string;
  currentYear: number;
  preloadedSolarData?: PreloadedSolarData;
  initialMonthlyBill?: number; // Dynamic bill from NREL/climate data
  // Named slots for server-rendered content
  breadcrumbSlot?: React.ReactNode; // For breadcrumb navigation (below header)
  introSlot?: React.ReactNode; // For "Why Solar" text (between Score & Chart)
  detailedSlot?: React.ReactNode; // For "Financial Deep Dive" (above FAQ)
  nearbyCitiesSlot?: React.ReactNode; // For nearby city links (below FAQ, above footer)
}

// =============================================================================
// CONSTANTS
// =============================================================================
const SYSTEM_SIZE_WATTS = 6000;
const UTILITY_INFLATION_RATE = 0.04;
const YEARS_ANALYSIS = 25;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// =============================================================================
// SKELETON COMPONENTS (for CLS prevention)
// =============================================================================

function ChartSkeleton() {
  return (
    <div className="w-full min-h-[200px] animate-pulse">
      <div className="h-4 w-40 bg-gray-700/50 rounded mx-auto mb-4" />
      <div className="h-[140px] bg-gray-800/30 rounded-lg" />
      <div className="flex justify-between mt-3 px-4">
        <div className="h-3 w-12 bg-gray-700/50 rounded" />
        <div className="h-3 w-12 bg-gray-700/50 rounded" />
        <div className="h-3 w-12 bg-gray-700/50 rounded" />
      </div>
    </div>
  );
}

function IntroSlotSkeleton() {
  return (
    <div className="w-full min-h-[120px] bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-6 animate-pulse">
      <div className="h-5 w-48 bg-gray-700/50 rounded mb-3" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-700/30 rounded" />
        <div className="h-3 w-4/5 bg-gray-700/30 rounded" />
        <div className="h-3 w-3/4 bg-gray-700/30 rounded" />
      </div>
    </div>
  );
}

function DetailedSlotSkeleton() {
  return (
    <div className="max-w-4xl mx-auto min-h-[300px] animate-pulse">
      <div className="text-center mb-8">
        <div className="h-8 w-64 bg-gray-700/50 rounded mx-auto mb-3" />
        <div className="h-4 w-80 bg-gray-700/30 rounded mx-auto" />
      </div>
      <div className="p-6 md:p-8 bg-gradient-to-br from-gray-900/90 via-slate-950/95 to-gray-900/90 border border-cyan-500/20 rounded-2xl">
        <div className="space-y-6">
          <div className="h-5 w-56 bg-gray-700/50 rounded" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-gray-700/30 rounded" />
            <div className="h-3 w-11/12 bg-gray-700/30 rounded" />
            <div className="h-3 w-4/5 bg-gray-700/30 rounded" />
          </div>
          <div className="h-5 w-48 bg-gray-700/50 rounded mt-6" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-gray-700/30 rounded" />
            <div className="h-3 w-10/12 bg-gray-700/30 rounded" />
            <div className="h-3 w-3/4 bg-gray-700/30 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// LAZY-LOADED COMPONENTS (Performance optimization)
// =============================================================================

// Dynamically import the chart to reduce initial bundle size
const SavingsChart = dynamic(() => import("./SavingsChart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

// =============================================================================
// COMPONENTS (Inlined)
// =============================================================================

function CountUp({
  value,
  duration = 2000,
}: {
  value: number;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    startTime.current = null;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [value, duration]);

  return <span>{formatCurrency(displayValue)}</span>;
}

function StatCard({
  icon: Icon,
  label,
  value,
  highlight = false,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
  iconColor?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 rounded-xl text-center transition-all duration-300 hover:scale-[1.02] relative overflow-hidden ${
        highlight
          ? "bg-gradient-to-br from-gray-900/90 via-slate-950/95 to-gray-900/90 border border-emerald-500/30"
          : "bg-gradient-to-br from-gray-900/90 via-slate-950/95 to-gray-900/90 border border-cyan-500/30"
      }`}
      style={{
        boxShadow: highlight
          ? '0 0 20px rgba(52, 211, 153, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          : '0 0 20px rgba(6, 182, 212, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      }}
    >
      <Icon
        className={`w-5 h-5 mx-auto mb-2 ${
          iconColor || (highlight ? "text-emerald-400" : "text-cyan-400")
        }`}
      />
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p
        className={`text-lg font-bold ${
          highlight ? "text-emerald-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </motion.div>
  );
}

// SunScore Circular Gauge Component
function SunScoreGauge({
  score,
  sunHours,
}: {
  score: number;
  sunHours: number;
}) {
  // Responsive size: smaller on mobile, larger on desktop
  const size = 180; // Base size for calculations (SVG viewBox)
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const getScoreInfo = () => {
    if (score >= 90) return { label: "Excellent Solar Potential", color: "#34d399" };
    if (score >= 80) return { label: "Great Solar Potential", color: "#22d3ee" };
    if (score >= 70) return { label: "Good Solar Potential", color: "#fbbf24" };
    if (score >= 60) return { label: "Moderate Solar Potential", color: "#f59e0b" };
    return { label: "Limited Solar Potential", color: "#f87171" };
  };

  const scoreInfo = getScoreInfo();

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center gap-1 relative z-10"
    >
      {/* TOP: The Gauge (Circle + Score) - Responsive sizing */}
      <div className="relative flex items-center justify-center w-[180px] h-[180px] md:w-[200px] md:h-[200px]">
        {/* SVG Full Circle Gauge - Overflow Visible ensures NO clipping of the glow */}
        <svg
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)' }}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="scoreGradientCity" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1e293b" // Dark slate
            strokeWidth={strokeWidth}
            opacity="0.5"
          />

          {/* Progress Circle with Gradient */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#scoreGradientCity)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            style={{
              // THIS IS THE FIX: Apply the glow filter directly to the SVG element, not the container div
              filter: 'drop-shadow(0 0 10px rgba(52, 211, 153, 0.6)) drop-shadow(0 0 20px rgba(6, 182, 212, 0.4))',
            }}
          />
        </svg>

        {/* Center Content (Score) with Dial Watermark */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Dial Watermark - Rectangular aspect ratio (160x80) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none select-none">
             <Image
              src="/sunscore.dial.png"
              alt=""
              width={160} // Wider than height to match dial shape
              height={80} // Half height
              className="object-contain"
              priority
            />
          </div>

          {/* Score Content */}
          <div className="relative z-10 flex flex-col items-center top-1 md:top-2">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.25em] text-cyan-400 mb-1 md:mb-2"
              style={{ textShadow: '0 0 10px rgba(34, 211, 238, 0.5)' }}
            >
              SunScore
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="text-6xl md:text-7xl font-bold text-white leading-none tracking-tight"
              style={{ textShadow: '0 0 40px rgba(255, 255, 255, 0.3)' }}
            >
              {score}
            </motion.span>
            <span className="text-gray-500 text-[10px] md:text-xs font-medium mt-1 md:mt-2">/100</span>
          </div>
        </div>
      </div>

      {/* Text Label */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-center mt-1 md:mt-2"
      >
        <p
          className="text-lg md:text-xl font-bold"
          style={{ color: scoreInfo.color, textShadow: `0 0 20px ${scoreInfo.color}44` }}
        >
          {scoreInfo.label}
        </p>
        {/* Mini Peak Sun Badge */}
        <div className="mt-2 inline-flex items-center gap-3 bg-gray-950/50 border border-gray-800 rounded-lg px-16 py-2 backdrop-blur-sm">
          <div className="text-left">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold leading-none mb-0.5">
            ☀️ Peak Sun
            </div>
            <div className="text-[12px] mt-2 font-bold text-white leading-none">
              {sunHours.toFixed(1)} Hours/Day
            </div>
          </div>
        </div>
      </motion.div>

      {/* NREL Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-4 bg-slate-950/50 border border-white/10 rounded-full px-3 py-1 flex items-center gap-2"
      >
        <Database className="w-3 h-3 text-cyan-500" />
        <span className="text-slate-400 text-[10px] uppercase tracking-wide font-semibold">Official NREL® Data</span>
      </motion.div>
    </motion.div>
  );
}

function SkeletonLoader() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sun className="w-10 h-10 text-emerald-400" />
          </motion.div>
          <span className="text-xl text-gray-200 font-medium">Scanning Roof...</span>
        </div>
        <p className="text-sm text-gray-500">
          Analyzing solar potential with official NREL satellite data
        </p>
      </div>
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-28 rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
          >
            <motion.div
              className="h-full w-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: "200% 100%" }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Toast({
  message,
  isVisible,
  onClose,
}: {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 bg-gray-800/95 backdrop-blur-lg border border-gray-700 rounded-full shadow-xl flex items-center gap-2"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Check className="w-3 h-3 text-emerald-400" />
          </div>
          <span className="text-sm font-medium text-white">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
  index,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-xl overflow-hidden"
    >
      {/* Question - Dashboard styled */}
      <button
        onClick={onClick}
        className="w-full px-6 py-5 flex items-center justify-between text-left bg-gradient-to-br from-gray-900/90 via-slate-950/95 to-gray-900/90 border border-cyan-500/20 rounded-xl transition-all duration-300 hover:border-cyan-500/40"
        style={{
          boxShadow: '0 0 15px rgba(6, 182, 212, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          borderRadius: isOpen ? '0.75rem 0.75rem 0 0' : '0.75rem'
        }}
        aria-expanded={isOpen}
      >
        <span className="font-medium text-gray-200 pr-4">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-cyan-400 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {/* Answer - Original darker style */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-gray-900/60 border-x border-b border-gray-800 rounded-b-xl"
          >
            <p className="px-6 py-5 text-gray-400 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


// =============================================================================
// MAIN COMPONENT
// =============================================================================
export default function SolarCalculatorClient({
  initialLat,
  initialLng,
  initialAddress,
  cityName,
  stateName,
  stateId,
  currentYear,
  preloadedSolarData,
  initialMonthlyBill,
  breadcrumbSlot,
  introSlot,
  detailedSlot,
  nearbyCitiesSlot,
}: SolarCalculatorClientProps) {
  const router = useRouter();
  const [address, setAddress] = useState(initialAddress);
  const [selectedLat, setSelectedLat] = useState<number>(initialLat);
  const [selectedLng, setSelectedLng] = useState<number>(initialLng);
  const [monthlyBill, setMonthlyBill] = useState(initialMonthlyBill || 150);
  const [billInputValue, setBillInputValue] = useState(String(initialMonthlyBill || 150));
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [footerQuickLinksOpen, setFooterQuickLinksOpen] = useState(false);
  const [footerLegalOpen, setFooterLegalOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [neighborCount, setNeighborCount] = useState(0);
  const [autoLoaded, setAutoLoaded] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);
  const cachedSolarData = useRef<SolarData | null>(null);

  const debouncedMonthlyBill = useDebounce(monthlyBill, 300);

  const calculateResults = useCallback(
    (solarData: SolarData, currentMonthlyBill: number, locationName: string, zip: string, currentStateId: string): CalculationResults => {
      const annualProduction = solarData.outputs.ac_annual;
      const pricePerWatt = getPricePerWatt(currentStateId);
      const systemCost = SYSTEM_SIZE_WATTS * pricePerWatt;

      const sunHours = solarData.outputs.solrad_annual || 5.0;

      let sunScore: number;
      if (sunHours >= 5.5) {
        sunScore = Math.min(100, Math.round(90 + ((sunHours - 5.5) / 1.5) * 10));
      } else if (sunHours >= 5.0) {
        sunScore = Math.round(80 + ((sunHours - 5.0) / 0.5) * 10);
      } else if (sunHours >= 4.5) {
        sunScore = Math.round(70 + ((sunHours - 4.5) / 0.5) * 10);
      } else if (sunHours >= 4.0) {
        sunScore = Math.round(60 + ((sunHours - 4.0) / 0.5) * 10);
      } else {
        sunScore = Math.max(40, Math.round(50 + ((sunHours - 3.5) / 0.5) * 10));
      }

      const yearlyData: { year: number; utilityCost: number; solarCost: number }[] = [];
      let cumulativeUtilityCost = 0;
      const annualBill = currentMonthlyBill * 12;

      for (let year = 0; year <= YEARS_ANALYSIS; year++) {
        if (year > 0) {
          const inflatedBill = annualBill * Math.pow(1 + UTILITY_INFLATION_RATE, year - 1);
          cumulativeUtilityCost += inflatedBill;
        }
        yearlyData.push({ year, utilityCost: cumulativeUtilityCost, solarCost: systemCost });
      }

      const twentyFiveYearUtilityCost = cumulativeUtilityCost;
      const twentyFiveYearSavings = twentyFiveYearUtilityCost - systemCost;
      const firstYearSavings = annualBill;
      const paybackYears = systemCost / annualBill;
      const co2Offset = (annualProduction * 0.0007) * YEARS_ANALYSIS;
      const treesEquivalent = Math.round(co2Offset * 16.5);

      // Home value increase: ~$4k per kW of solar (Zillow data)
      const systemSizeInKw = SYSTEM_SIZE_WATTS / 1000;
      const homeValueIncrease = systemSizeInKw * 4000;

      // Bill offset: percentage of electricity bill covered by solar
      const electricityRate = getElectricityRate(currentStateId);
      const yearlyConsumption = annualBill / electricityRate; // kWh consumed per year
      const billOffset = Math.min(100, Math.round((annualProduction / yearlyConsumption) * 100));

      return {
        annualProduction,
        systemCost,
        firstYearSavings,
        twentyFiveYearSavings,
        twentyFiveYearUtilityCost,
        twentyFiveYearSolarCost: systemCost,
        paybackYears: Math.round(paybackYears * 10) / 10,
        monthlyPayment: Math.round(systemCost / (YEARS_ANALYSIS * 12)),
        co2Offset: Math.round(co2Offset),
        treesEquivalent,
        locationName,
        yearlyData,
        sunScore,
        sunHours,
        zipCode: zip,
        homeValueIncrease,
        billOffset,
      };
    },
    []
  );

  useEffect(() => {
    if (cachedSolarData.current && results && hasInteracted) {
      const newResults = calculateResults(
        cachedSolarData.current,
        debouncedMonthlyBill,
        results.locationName,
        results.zipCode,
        stateId
      );
      setResults(newResults);
    }
  }, [debouncedMonthlyBill, calculateResults, hasInteracted, stateId]);

  // Daily Reset + Hourly Growth: Feels "live" while being consistent for all users
  useEffect(() => {
    // 1. Get Time Factors for "Real-Time" simulation
    const now = new Date();
    const dateStr = now.toLocaleDateString(); // e.g., "1/19/2026"
    const hour = now.getHours();
    const minute = now.getMinutes();

    // 2. Create Stable Hash (City + Date)
    // This ensures the baseline number is consistent for everyone in this city, on this specific date.
    const seedString = cityName + dateStr;
    const baseHash = seedString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // 3. Calculate Today's Count
    // Baseline: 40-140 (derived from hash)
    // Growth: Increases by ~3 per hour + extra every 10 mins
    const baseline = 40 + (baseHash % 100);
    const growth = (hour * 3) + Math.floor(minute / 10);

    setNeighborCount(baseline + growth);
  }, [cityName]);

  // Restore calculator session from localStorage (for "Return to Estimate" flow)
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('sunscore_session');
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);

        // Only restore if returning to the same city page
        const currentCitySlug = `${cityName.toLowerCase().replace(/\s+/g, '-')}-${stateId.toLowerCase()}`;
        if (sessionData.citySlug === currentCitySlug) {
          // Restore state
          if (sessionData.monthlyBill) setMonthlyBill(sessionData.monthlyBill);
          if (sessionData.billInputValue) setBillInputValue(sessionData.billInputValue);
          if (sessionData.address) setAddress(sessionData.address);
          if (sessionData.selectedLat) setSelectedLat(sessionData.selectedLat);
          if (sessionData.selectedLng) setSelectedLng(sessionData.selectedLng);
          if (sessionData.results) setResults(sessionData.results);
          if (sessionData.hasInteracted) setHasInteracted(sessionData.hasInteracted);

          // Scroll to results after state renders
          if (sessionData.results) {
            setTimeout(() => {
              resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
          }
        }

        // Clear session after restore (one-time use)
        localStorage.removeItem('sunscore_session');
      }
    } catch {
      // Ignore localStorage errors (e.g., private browsing)
    }
  }, [cityName, stateId]);

  useEffect(() => {
    setBillInputValue(monthlyBill.toLocaleString());
  }, [monthlyBill]);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyCTA(window.scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!autoLoaded && initialLat && initialLng) {
      setAutoLoaded(true);

      // If we have preloaded solar data from server, use it immediately
      if (preloadedSolarData) {
        const solarData: SolarData = {
          outputs: preloadedSolarData.outputs,
        };
        cachedSolarData.current = solarData;
        const calculatedResults = calculateResults(
          solarData,
          monthlyBill,
          initialAddress,
          stateId,
          stateId
        );
        setResults(calculatedResults);
        setHasInteracted(true);
      } else {
        // Fallback to fetching if no preloaded data
        fetchSolarDataWithCoords(initialLat, initialLng, initialAddress);
      }
    }
  }, [initialLat, initialLng, initialAddress, autoLoaded, preloadedSolarData, calculateResults, monthlyBill, stateId]);

  const fetchSolarDataWithCoords = async (lat: number, lng: number, locationName: string) => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    setHasInteracted(true);

    try {
      const response = await fetch(`/api/solar?lat=${lat}&lon=${lng}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Unable to fetch solar data. Please try again later.");
      }

      const solarData: SolarData = await response.json();

      if (!solarData.outputs || !solarData.outputs.ac_annual) {
        throw new Error("Invalid solar data received.");
      }

      cachedSolarData.current = solarData;

      const calculatedResults = calculateResults(solarData, monthlyBill, locationName, stateId, stateId);
      setResults(calculatedResults);

    } catch (err) {
      // Handle network errors with user-friendly messages
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      if (errorMessage === "Load failed" || errorMessage === "Failed to fetch" || errorMessage.includes("network")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSolarData = async () => {
    if (!address.trim()) {
      setError("Please enter your address");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);
    setHasInteracted(true);

    try {
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: { "User-Agent": "SolarSavingsCalculator/1.0 (contact@example.com)" },
        }
      );

      if (!geoResponse.ok) {
        throw new Error("Unable to connect to geocoding service.");
      }

      const geoData = await geoResponse.json();

      if (!geoData || geoData.length === 0) {
        throw new Error("Address not found. Please enter a more specific address.");
      }

      const { lat, lon, display_name } = geoData[0];
      await fetchSolarDataWithCoords(parseFloat(lat), parseFloat(lon), display_name);

    } catch (err) {
      // Handle network errors with user-friendly messages
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      if (errorMessage === "Load failed" || errorMessage === "Failed to fetch" || errorMessage.includes("network")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(errorMessage);
      }
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSolarData();
  };

  const handleShareScore = async () => {
    if (!results) return;
    const shareText = `My house in ${cityName} has a SunScore of ${results.sunScore}/100! Check yours at SunScore.io`;
    try {
      await navigator.clipboard.writeText(shareText);
      setToastMessage("Copied to clipboard!");
      setShowToast(true);
    } catch {
      setToastMessage("Share: " + shareText);
      setShowToast(true);
    }
  };

  const handleGetQuote = () => {
    // CASE 1: No results yet? Scroll to calculator and prompt user.
    if (!results) {
      const calculatorSection = document.getElementById("calculator");
      if (calculatorSection) {
        calculatorSection.scrollIntoView({ behavior: "smooth" });
        const addressInput = document.querySelector('input[type="text"]');
        if (addressInput instanceof HTMLElement) addressInput.focus();
      }
      setToastMessage("Please calculate your savings first!");
      setShowToast(true);
      return;
    }

    // Save calculator state to localStorage for session restore
    const sessionData = {
      monthlyBill,
      billInputValue,
      address,
      selectedLat,
      selectedLng,
      results,
      hasInteracted,
      citySlug: `${cityName.toLowerCase().replace(/\s+/g, '-')}-${stateId.toLowerCase()}`,
    };
    localStorage.setItem('sunscore_session', JSON.stringify(sessionData));

    // CASE 2: We have results. Navigate to the Quote Bridge Page.
    const queryParams = new URLSearchParams({
      zip: results.zipCode,
      bill: monthlyBill.toString(),
      score: results.sunScore.toString(),
      city: cityName,
      state: stateId
    }).toString();

    router.push(`/quote?${queryParams}`);
  };

  const faqs = [
    {
      question: `How much can I save with solar in ${cityName}?`,
      answer: `Solar savings in ${cityName}, ${stateName} depend on your current electricity usage, roof orientation, and local utility rates. Our calculator uses official NREL satellite data specific to ${cityName}'s location to provide accurate estimates. Most homeowners save $15,000-$50,000 over 25 years.`,
    },
    {
      question: "How long does it take for solar to pay for itself?",
      answer: `The payback period for solar in ${cityName} depends on your electricity costs, system size, and local sun exposure. Most homeowners see their system pay for itself in 6-10 years through electricity savings. After that point, you're generating free electricity for the remaining life of your system.`,
    },
    {
      question: `What is the average SunScore in ${stateName}?`,
      answer: `${stateName} generally has good solar potential. The SunScore is based on peak sun hours per day from NREL satellite data. Scores above 70 indicate good solar potential, while scores above 85 are excellent.`,
    },
    {
      question: "What are my financing options?",
      answer: "You have several options: Cash Purchase (highest ROI), Solar Loans ($0 down available), Lease (lower savings, no upfront cost), or PPA (pay for power produced at a fixed rate).",
    },
  ];

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md">
        <nav className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/sunscore.logo.png"
              alt="SunScore"
              width={230}
              height={50}
              className="h-8 w-auto md:h-12"
              priority
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "How it Works", href: "#how-it-works" },
              { label: "FAQ", href: "#faq" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGetQuote}
            className="min-h-[44px] px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-gray-900 text-sm font-semibold rounded-full shadow-lg shadow-yellow-500/20 transition-all"
          >
            Get Quote
          </motion.button>
        </nav>
      </header>

      {/* Breadcrumb Navigation */}
      {breadcrumbSlot}

      {/* Hero - City Specific */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-5 md:px-4 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center space-y-4 md:space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs md:text-sm font-medium"
            >
              <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span>{cityName}, {stateId} • Official NREL Data</span>
            </motion.div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
              Solar Calculator for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-300">
                {cityName}
              </span>
            </h1>

            <p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              See how much you could save with solar in {cityName}, {stateName} based on {currentYear} electric rates.
              <span className="text-emerald-400 font-semibold"> 25-year savings estimate</span> for your location.
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-x-4 md:gap-x-6 gap-y-2 md:gap-y-3 pt-2 md:pt-4"
            >
              {[
                { icon: Shield, text: "Official NREL Data" },
                { icon: Award, text: "25-Year Savings" },
                { icon: Leaf, text: "Clean Energy" },
                { icon: Clock, text: "Instant Results" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 md:gap-2 text-gray-400 text-xs md:text-sm">
                  <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-500" />
                  <span>{text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Calculator Section */}
      <section id="calculator" className="max-w-4xl mx-auto px-5 md:px-4 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/20"
        >
          {/* Trust Header */}
          <div className="text-center mb-6 pb-6 border-b border-gray-800/50">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
              Calculate Your SunScore
            </h2>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Estimates based on NREL PVWatts® Data</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="address"
                className="flex items-center gap-2 text-sm font-medium text-gray-300"
              >
                <MapPin className="w-4 h-4 text-emerald-500" />
                Your Address in {cityName}
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <AddressAutocomplete
                  onSelect={(addr, details) => {
                    setAddress(addr);
                    setSelectedLat(details.lat);
                    setSelectedLng(details.lng);
                  }}
                  defaultValue={initialAddress}
                  placeholder={`Enter your address in ${cityName}, ${stateId}`}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto min-h-[44px] px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 disabled:shadow-none sm:min-w-[140px]"
                >
                  {isLoading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Sun className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5" />
                      <span>Recalculate</span>
                    </>
                  )}
                </button>
              </div>

              {/* Social Proof - Below Address Input */}
              {neighborCount > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-left text-sm text-gray-500 mt-3"
                >
                  🔥 <span className="text-gray-400 font-medium">{neighborCount}</span> homeowners in {cityName} checked their score today.
                </motion.p>
              )}
            </div>

            {/* Monthly Bill Slider */}
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="monthlyBill"
                  className="flex items-center gap-2 text-sm font-medium text-gray-300"
                >
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  Current Monthly Electric Bill
                </label>
                <div className="flex items-center gap-1 group cursor-text" onClick={() => document.getElementById('billInputCity')?.focus()}>
                  <span className="text-emerald-400 text-2xl font-bold">$</span>
                  <input
                    id="billInputCity"
                    type="text"
                    inputMode="numeric"
                    aria-label="Monthly Bill Amount"
                    value={billInputValue}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      setBillInputValue(raw);
                    }}
                    onBlur={() => {
                      const num = Number(billInputValue.replace(/[^0-9]/g, '')) || 50;
                      const val = Math.max(50, num);
                      setMonthlyBill(val);
                    }}
                    className="w-24 bg-slate-800/50 group-hover:bg-slate-700/50 text-2xl font-bold text-emerald-400 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg px-2 py-1 transition-colors border border-transparent focus:border-emerald-500/50"
                  />
                  <span className="text-gray-500 text-xs ml-1 opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
                </div>
              </div>
              <div className="relative">
                <input
                  id="monthlyBill"
                  type="range"
                  min="50"
                  max="1200"
                  step="10"
                  aria-label="Monthly Electricity Bill Slider"
                  aria-valuemin={50}
                  aria-valuemax={1200}
                  aria-valuenow={Math.min(monthlyBill, 1200)}
                  value={Math.min(monthlyBill, 1200)}
                  onChange={(e) => setMonthlyBill(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div
                  className="absolute top-0 left-0 h-2 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg pointer-events-none"
                  style={{ width: `${Math.min(((monthlyBill - 50) / 1150) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>$50/mo</span>
                <span className="text-gray-600">Average: $150/mo</span>
                <span>$1,200+</span>
              </div>
            </div>
          </form>

          {/* Results Area - min-height prevents CLS while content loads */}
          <div className="mt-8 min-h-[400px]" ref={resultsRef}>
            <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <SkeletonLoader />
                </motion.div>
              )}

              {error && !isLoading && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-medium">Unable to calculate savings</p>
                    <p className="text-red-400/80 text-sm mt-1">{error}</p>
                  </div>
                </motion.div>
              )}

              {results && !isLoading && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2 text-sm text-gray-400"
                  >
                    <span className="relative flex items-center justify-center">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-50" />
                      <MapPin className="relative w-4 h-4 text-red-500" />
                    </span>
                    <span className="truncate max-w-md">
                      Results for: {address !== initialAddress ? address : `${cityName}, ${stateName}`}
                    </span>
                  </motion.div>

                  {/* Solar Report Card - Unified Bento Grid Dashboard */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 md:p-6 bg-gradient-to-br from-gray-900/90 via-slate-950/95 to-gray-900/90 border border-cyan-500/30 rounded-2xl backdrop-blur-sm relative overflow-hidden"
                    style={{
                      boxShadow: '0 0 30px rgba(6, 182, 212, 0.15), 0 0 60px rgba(6, 182, 212, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    {/* Subtle corner accents */}
                    <div className="absolute top-0 left-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />

                    {/* Share Button - Positioned top-right */}
                    <button
                      onClick={handleShareScore}
                      className="absolute top-4 right-4 p-2 bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors duration-200 group"
                      aria-label="Share your SunScore"
                    >
                      <Share2 className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-0 relative">
                      {/* Left Column - SunScore Gauge */}
                      <div className="flex items-center justify-center md:pr-6">
                        <SunScoreGauge score={results.sunScore} sunHours={results.sunHours} />
                      </div>

                      {/* Glowing Vertical Divider - Desktop only */}
                      <div
                        className="hidden md:block absolute left-1/2 top-8 bottom-8 w-px -translate-x-1/2"
                        style={{
                          background: 'linear-gradient(to bottom, transparent 0%, rgba(6, 182, 212, 0.4) 20%, rgba(16, 185, 129, 0.4) 80%, transparent 100%)',
                          boxShadow: '0 0 6px rgba(6, 182, 212, 0.3)'
                        }}
                      />

                      {/* Right Column - Financial Stack (aligned with gauge) */}
                      <div className="flex flex-col gap-3 md:pl-6 md:py-2">
                        {/* 25-Year Savings - Glass Card */}
                        <div
                          className="p-5 rounded-2xl border border-emerald-500/20 bg-slate-900/60 backdrop-blur-sm relative overflow-hidden flex-1 flex flex-col justify-center"
                          style={{ boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)' }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
                          <div className="relative flex flex-col items-center text-center">
                            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-emerald-400/70 mb-2">
                              Estimated 25-Year Savings
                            </p>
                            <div
                              className="text-4xl sm:text-5xl font-bold text-emerald-400 tracking-tight"
                              style={{ textShadow: '0 0 30px rgba(52, 211, 153, 0.4)' }}
                            >
                              <CountUp value={results.twentyFiveYearSavings} />
                            </div>
                            <p className="text-[11px] text-gray-500 mt-2">
                              vs. utility rates (4% inflation)
                            </p>
                            {/* Bridge CTA - Check Eligibility Link */}
                            <button
                              onClick={handleGetQuote}
                              className="mt-3 text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors border-b border-emerald-500/30 hover:border-emerald-400 pb-0.5"
                            >
                              Unlock Your 25-Year Savings Report
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Environmental Impact Card */}
                        <div
                          className="p-4 rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-950/30 via-slate-900/50 to-green-950/20 relative overflow-hidden transition-all duration-300 hover:border-green-500/50 hover:scale-[1.02]"
                          style={{ boxShadow: 'inset 0 1px 0 rgba(34, 197, 94, 0.1), 0 0 15px rgba(34, 197, 94, 0.05)' }}
                        >
                          <div className="relative flex flex-col items-center text-center">
                            <div className="flex items-center gap-2 mb-1">
                              <Leaf className="w-3.5 h-3.5 text-green-400/70" />
                              <p className="text-[10px] text-white/60 uppercase tracking-[0.15em] font-medium">
                                Environmental Impact
                              </p>
                            </div>
                            <p
                              className="text-2xl font-bold text-white"
                              style={{ textShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}
                            >
                              {results.co2Offset} tons
                            </p>
                            <p className="text-[10px] text-green-400/60 mt-1">
                              CO₂ offset over 25 years
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* INTRO SLOT - Server-rendered "Why Solar" content */}
                  <div className="w-full min-h-[120px]">
                    {introSlot || <IntroSlotSkeleton />}
                  </div>

                  {/* Savings Chart - Styled to match Dashboard */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 min-h-[220px] bg-gradient-to-br from-gray-900/90 via-slate-950/95 to-gray-900/90 border border-cyan-500/30 rounded-2xl backdrop-blur-sm relative overflow-hidden"
                    style={{
                      boxShadow: '0 0 30px rgba(6, 182, 212, 0.15), 0 0 60px rgba(6, 182, 212, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    {/* Subtle corner accents - Match Dashboard */}
                    <div className="absolute top-0 left-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10">
                      {results ? <SavingsChart yearlyData={results.yearlyData} /> : <ChartSkeleton />}
                    </div>
                  </motion.div>

                  {/* Stats Grid */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
                  >
                    <StatCard
                      icon={TrendingUp}
                      label="Est. Home Value Increase"
                      value={formatCurrency(results.homeValueIncrease)}
                      iconColor="text-emerald-400"
                    />
                    <StatCard
                      icon={ShieldCheck}
                      label="Bill Offset"
                      value={`${results.billOffset}%`}
                      highlight
                      iconColor="text-emerald-400"
                    />
                    <StatCard
                      icon={Zap}
                      label="First Year Savings"
                      value={formatCurrency(results.firstYearSavings)}
                      iconColor="text-emerald-400"
                    />
                    <StatCard
                      icon={Leaf}
                      label="Trees Equivalent"
                      value={`${formatNumber(results.treesEquivalent)} trees`}
                      iconColor="text-green-400"
                    />
                  </motion.div>

                  {/* Annual Production */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center p-4 bg-gradient-to-br from-gray-900/90 via-slate-950/95 to-gray-900/90 rounded-xl border border-cyan-500/30 transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      boxShadow: '0 0 20px rgba(6, 182, 212, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <p className="text-xs text-[#DC600] uppercase tracking-wider mb-1">
                      Estimated Annual Production
                    </p>
                    <p className="text-xl font-semibold text-white">
                      {formatNumber(results.annualProduction)}{" "}
                      <span className="text-gray-400 font-normal">kWh/year</span>
                    </p>
                  </motion.div>

                  {/* Gold "Closer" CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="pt-4"
                  >
                    <button
                      onClick={handleGetQuote}
                      className="w-full py-5 px-6 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 hover:from-yellow-400 hover:via-amber-400 hover:to-yellow-400 text-gray-900 font-bold text-lg rounded-2xl shadow-xl shadow-yellow-500/30 hover:shadow-yellow-500/40 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
                    >
                      <span>Get My Official Quote & Savings Analysis</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-3">
                      Free quote from certified local installers • No obligation
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* How it Works Section */}
        <section id="how-it-works" className="mt-16 space-y-8 scroll-mt-20">
          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white">How It Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our calculator uses government satellite data to estimate solar potential in {cityName}.
            </p>
          </div>

          {/* Steps with connecting line */}
          <div className="relative pt-4">
            {/* Connecting line - Desktop only */}
            <div className="hidden md:block absolute top-20 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-cyan-500/30 via-emerald-500/30 to-cyan-500/30" />

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: "1", title: "Location Analysis", description: `We use NREL satellite data for ${cityName}, ${stateId} to analyze solar irradiance at your exact location.`, icon: MapPin, color: "cyan" },
                { step: "2", title: "Production Calculation", description: `Using the PVWatts® model, we calculate estimated annual production based on ${stateName}'s weather patterns.`, icon: Sun, color: "emerald" },
                { step: "3", title: "Savings Projection", description: "We compare your current utility costs (based on historical utility rate trends) against owning solar to show your 25-year savings.", icon: TrendingUp, color: "cyan" },
              ].map(({ step, title, description, icon: Icon, color }) => (
                <div key={step} className="relative pt-4 pl-4">
                  {/* Step number badge - Positioned outside card */}
                  <div className="absolute top-0 left-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-sm font-bold text-gray-900 shadow-lg shadow-emerald-500/30 z-10">
                    {step}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: Number(step) * 0.15 }}
                    className="relative p-6 bg-gradient-to-br from-gray-900/90 via-slate-950/95 to-gray-900/90 border border-cyan-500/20 rounded-2xl transition-all duration-300 hover:border-cyan-500/40 hover:scale-[1.02] overflow-hidden group h-full"
                    style={{
                      boxShadow: '0 0 20px rgba(6, 182, 212, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    {/* Subtle glow on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* Icon - Simple style */}
                    <Icon className={`relative z-10 w-8 h-8 mb-4 ${color === 'emerald' ? 'text-emerald-400' : 'text-cyan-400'}`} />

                    <h3 className="relative z-10 text-lg font-semibold text-white mb-2">{title}</h3>
                    <p className="relative z-10 text-sm text-gray-400 leading-relaxed">{description}</p>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DETAILED SLOT - Server-rendered financial analysis */}
        <div className="mt-8 min-h-[300px]">
          {detailedSlot || <DetailedSlotSkeleton />}
        </div>

        {/* FAQ */}
        <section id="faq" className="mt-16 space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center">
            Frequently Asked Questions About Solar in {cityName}
          </h2>
          <div className="space-y-3 mt-8">
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === i}
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                index={i}
              />
            ))}
          </div>
        </section>

        {/* NEARBY CITIES SLOT - Server-rendered city links (below FAQ) */}
        {nearbyCitiesSlot && (
          <div className="mt-16">
            {nearbyCitiesSlot}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-10 md:mt-20 pt-8 md:pt-12 border-t border-gray-800">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-10">
            <div className="space-y-3 md:space-y-4 text-center md:text-left flex flex-col items-center md:items-start">
              <Image src="/sunscore.logo.png" alt="SunScore" width={230} height={50} className="h-8 w-auto opacity-80" />
              <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
                Helping homeowners in {cityName} make informed solar decisions with official government data.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield className="w-3 h-3 text-emerald-500" />
                <span>Estimates based on NREL PVWatts®</span>
              </div>
            </div>

            {/* Quick Links Column - Accordion on Mobile */}
            <div className="space-y-2 md:space-y-4 text-center md:text-left">
              <button
                onClick={() => setFooterQuickLinksOpen(!footerQuickLinksOpen)}
                className="w-full flex items-center justify-center md:justify-start gap-2 text-sm font-semibold text-white md:cursor-default"
              >
                <span>Quick Links</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 md:hidden transition-transform ${footerQuickLinksOpen ? 'rotate-180' : ''}`} />
              </button>
              <nav className={`flex-col items-center md:items-start gap-2 ${footerQuickLinksOpen ? 'flex' : 'hidden'} md:flex`}>
                <Link href="/" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">Home</Link>
                <a href="#calculator" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">Calculator</a>
                <a href="#how-it-works" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">How it Works</a>
                <a href="#faq" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">FAQ</a>
              </nav>
            </div>

            {/* Legal Column - Accordion on Mobile */}
            <div className="space-y-2 md:space-y-4 text-center md:text-left">
              <button
                onClick={() => setFooterLegalOpen(!footerLegalOpen)}
                className="w-full flex items-center justify-center md:justify-start gap-2 text-sm font-semibold text-white md:cursor-default"
              >
                <span>Legal</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 md:hidden transition-transform ${footerLegalOpen ? 'rotate-180' : ''}`} />
              </button>
              <nav className={`flex-col items-center md:items-start gap-2 ${footerLegalOpen ? 'flex' : 'hidden'} md:flex`}>
                <Link href="/privacy-policy" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">Privacy Policy</Link>
                <Link href="/terms-of-service" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">Terms of Service</Link>
                <Link href="/disclaimer" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">Disclaimer</Link>
              </nav>
            </div>
          </div>

          {/* Disclaimers - Compact on Mobile */}
          <div className="py-3 md:py-6 border-t border-gray-800/50 space-y-2 md:space-y-4">
            <p className="text-[10px] md:text-xs text-gray-500 leading-tight md:leading-relaxed">
              <strong className="text-gray-400">Solar Estimates:</strong> Production estimates powered by the NREL PVWatts® Calculator. This tool provides estimates only and does not guarantee actual savings. Actual results may vary based on roof condition, shading, local utility rates, and other factors.
            </p>
            <p className="text-[10px] md:text-xs text-gray-500 leading-tight md:leading-relaxed">
              <strong className="text-gray-400">Pricing:</strong> System costs are based on {stateName} average installation prices and may vary based on installer, equipment choices, roof complexity, and local permitting requirements. Get quotes from local installers for accurate pricing.
            </p>
          </div>

          {/* FTC Affiliate Disclosure */}
          <p className="text-[10px] text-gray-600 text-center py-4 border-t border-gray-800/50">
            SunScore is an independent consumer service. We may earn a commission when you connect with our partners.
          </p>

          {/* Copyright Bar */}
          <div className="py-6 border-t border-gray-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} SunScore. All rights reserved.
            </p>
            <div className="text-xs text-gray-600 text-center md:text-right space-y-1">
              <p>Not affiliated with NREL, the U.S. Department of Energy, or any government agency.</p>
              <p>
                City data provided by{" "}
                <a
                  href="https://simplemaps.com/data/us-cities"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-500 hover:text-emerald-400"
                >
                  SimpleMaps
                </a>
                .
              </p>
            </div>
          </div>
        </footer>
      </section>

      {/* Sticky Mobile CTA - Hidden until user scrolls past calculator */}
      <AnimatePresence>
        {showStickyCTA && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-gray-950/90 backdrop-blur-xl border-t border-yellow-500/20 md:hidden z-50"
          >
            <button
              onClick={handleGetQuote}
              className={`w-full min-h-[48px] py-4 font-bold text-lg rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-200 ${
                results
                  ? "bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 text-gray-900 shadow-yellow-500/30"
                  : "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-emerald-500/30"
              }`}
            >
              {results ? "Get Quote" : "Calculating..."}
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />
    </main>
    </>
  );
}
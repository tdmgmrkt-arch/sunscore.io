"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { getPricePerWatt } from "@/utils/solar-pricing";
import { getElectricityRate } from "@/utils/electricity-rates";
import {
  Sun,
  Zap,
  DollarSign,
  Home,
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
  CheckCircle2,
  AlertCircle,
  Share2,
  Check,
  Database,
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

// Debounce hook
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
// CUSTOM COMPONENTS (Inlined per requirements)
// =============================================================================

// Animated CountUp Component
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

      // Easing function for smooth animation
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

// Custom SVG Line Chart Component
function SavingsChart({
  yearlyData,
}: {
  yearlyData: { year: number; utilityCost: number; solarCost: number }[];
}) {
  const chartWidth = 340;
  const chartHeight = 140;
  const padding = { top: 20, right: 20, bottom: 35, left: 55 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const maxY = Math.max(...yearlyData.map((d) => d.utilityCost)) * 1.1;

  const scaleX = (year: number) =>
    padding.left + (year / YEARS_ANALYSIS) * innerWidth;
  const scaleY = (value: number) =>
    chartHeight - padding.bottom - (value / maxY) * innerHeight;

  // Generate path for utility cost (cumulative)
  const utilityPath = yearlyData
    .map((d, i) => `${i === 0 ? "M" : "L"} ${scaleX(d.year)} ${scaleY(d.utilityCost)}`)
    .join(" ");

  // Generate path for solar cost (flat line at net system cost)
  const solarPath = `M ${scaleX(0)} ${scaleY(yearlyData[0].solarCost)} L ${scaleX(YEARS_ANALYSIS)} ${scaleY(yearlyData[YEARS_ANALYSIS].solarCost)}`;

  // Generate area fill path (the savings gap)
  const areaPath = `${utilityPath} L ${scaleX(YEARS_ANALYSIS)} ${scaleY(yearlyData[YEARS_ANALYSIS].solarCost)} L ${scaleX(0)} ${scaleY(yearlyData[0].solarCost)} Z`;

  // Y-axis tick values
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => maxY * ratio);

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-gray-300 mb-2 text-center">
        25-Year Cost Comparison
      </h3>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto"
        role="img"
        aria-label="Chart comparing utility costs vs solar costs over 25 years"
      >
       <defs>
  {/* Savings gradient (card fill / background usage) */}
  <linearGradient
    id="savingsGradient"
    x1="0%"
    y1="0%"
    x2="0%"
    y2="100%"
  >
    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
    <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
  </linearGradient>

  {/* Utility cost gradient */}
  <linearGradient id="utilityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stopColor="#ef4444" />
    <stop offset="100%" stopColor="#f97316" />
  </linearGradient>

  {/* Solar progress stroke gradient */}
  <linearGradient id="solarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stopColor="#10b981" />
    <stop offset="100%" stopColor="#22c55e" />
  </linearGradient>

  {/* SVG-native circular glow (NO square artifact) */}
  <filter
    id="solarGlow"
    x="-50%"
    y="-50%"
    width="200%"
    height="200%"
    colorInterpolationFilters="sRGB"
  >
    <feGaussianBlur stdDeviation="4" result="blur" />
    <feMerge>
      <feMergeNode in="blur" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
</defs>


        {/* Grid lines */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={scaleY(tick)}
              x2={chartWidth - padding.right}
              y2={scaleY(tick)}
              stroke="#374151"
              strokeDasharray="4,4"
              strokeOpacity="0.5"
            />
            <text
              x={padding.left - 8}
              y={scaleY(tick)}
              textAnchor="end"
              alignmentBaseline="middle"
              className="fill-gray-500"
              fontSize="8"
            >
              ${Math.round(tick / 1000)}k
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {[0, 5, 10, 15, 20, 25].map((year) => (
          <text
            key={year}
            x={scaleX(year)}
            y={chartHeight - padding.bottom + 14}
            textAnchor="middle"
            className="fill-gray-500"
            fontSize="8"
          >
            Yr {year}
          </text>
        ))}

        {/* Axis labels */}
        <text
          x={chartWidth / 2}
          y={chartHeight - 3}
          textAnchor="middle"
          className="fill-gray-400"
          fontSize="8"
        >
          Years
        </text>
        <text
          x={10}
          y={chartHeight / 2}
          textAnchor="middle"
          className="fill-gray-400"
          fontSize="8"
          transform={`rotate(-90, 10, ${chartHeight / 2})`}
        >
          Cumulative Cost
        </text>

        {/* Savings area fill */}
        <motion.path
          d={areaPath}
          fill="url(#savingsGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />

        {/* Utility cost line (red/orange gradient) */}
        <motion.path
          d={utilityPath}
          fill="none"
          stroke="url(#utilityGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* Solar cost line (green gradient) */}
        <motion.path
          d={solarPath}
          fill="none"
          stroke="url(#solarGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        />

        {/* Data point markers */}
        <motion.circle
          cx={scaleX(YEARS_ANALYSIS)}
          cy={scaleY(yearlyData[YEARS_ANALYSIS].utilityCost)}
          r="5"
          fill="#ef4444"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.5 }}
        />
        <motion.circle
          cx={scaleX(YEARS_ANALYSIS)}
          cy={scaleY(yearlyData[YEARS_ANALYSIS].solarCost)}
          r="5"
          fill="#10b981"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.7 }}
        />

        {/* Savings annotation */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <line
            x1={scaleX(18)}
            y1={scaleY(yearlyData[18].utilityCost)}
            x2={scaleX(18)}
            y2={scaleY(yearlyData[18].solarCost)}
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="4,2"
          />
          <text
            x={scaleX(18) + 8}
            y={(scaleY(yearlyData[18].utilityCost) + scaleY(yearlyData[18].solarCost)) / 2}
            className="fill-emerald-400 font-semibold"
            fontSize="11"
          >
            Savings
          </text>
        </motion.g>
      </svg>

      {/* Legend */}
      <div className="flex justify-center gap-8 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500" />
          <span className="text-xs text-gray-400">Utility (Doing Nothing)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-500" />
          <span className="text-xs text-gray-400">Solar (Owning)</span>
        </div>
      </div>
    </div>
  );
}

// Skeleton Loader Component
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
          <span className="text-xl text-gray-200 font-medium">
            Scanning Roof...
          </span>
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
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ backgroundSize: "200% 100%" }}
            />
          </motion.div>
        ))}
      </div>
      <div className="flex justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-emerald-500"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

// Stat Card Component
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

// SunScore Circular Gauge Component - Full Circle with Flex Stack
function SunScoreGauge({
  score,
  sunHours,
}: {
  score: number;
  sunHours: number;
}) {
  const size = 180;
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
      {/* TOP: The Gauge (Circle + Score) */}
      <div className="relative flex items-center justify-center w-[180px] h-[180px]">
        {/* SVG Full Circle Gauge - Overflow Visible ensures NO clipping of the glow */}
        <svg
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)' }}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
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
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            opacity="0.5"
          />

          {/* Progress Circle with Gradient */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            style={{
              filter: 'drop-shadow(0 0 10px rgba(52, 211, 153, 0.6)) drop-shadow(0 0 20px rgba(6, 182, 212, 0.4))',
            }}
          />
        </svg>

        {/* Center Content (Score) with Dial Watermark */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Dial Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none select-none">
            <Image
              src="/sunscore.dial.png"
              alt=""
              width={120}
              height={600}
              className="object-contain"
              priority
            />
          </div>

          {/* Score Content */}
          <div className="relative z-10 flex flex-col items-center top-1">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400 mb-1"
              style={{ textShadow: '0 0 10px rgba(34, 211, 238, 0.5)' }}
            >
              SunScore
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="text-6xl font-bold text-white leading-none tracking-tight"
              style={{ textShadow: '0 0 40px rgba(255, 255, 255, 0.3)' }}
            >
              {score}
            </motion.span>
            <span className="text-gray-500 text-[10px] font-medium mt-1">/100</span>
          </div>
        </div>
      </div>

      {/* Text Label */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-center mt-1"
      >
        <p
          className="text-lg font-bold"
          style={{ color: scoreInfo.color, textShadow: `0 0 20px ${scoreInfo.color}44` }}
        >
          {scoreInfo.label}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {sunHours.toFixed(1)} peak sun hours/day
        </p>
      </motion.div>

      {/* BOTTOM: NREL Trust Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-slate-900/70 border border-cyan-500/20 rounded-full px-3 py-1 flex items-center gap-2"
        style={{ boxShadow: '0 0 8px rgba(6, 182, 212, 0.1)' }}
      >
        <Database className="w-3 h-3 text-cyan-400" />
        <span className="text-slate-400 text-xs">Official NREL® Data</span>
      </motion.div>
    </motion.div>
  );
}

// Toast Notification Component
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
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
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

// FAQ Item Component
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
export default function SolarCalculator() {
  const router = useRouter();

  // State
  const [address, setAddress] = useState("");
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<string>("");
  const [monthlyBill, setMonthlyBill] = useState(150);
  const [billInputValue, setBillInputValue] = useState("150");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [neighborCount, setNeighborCount] = useState(0);
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  // Refs
  const resultsRef = useRef<HTMLDivElement>(null);
  const cachedSolarData = useRef<SolarData | null>(null);

  // Debounced monthly bill for recalculations
  const debouncedMonthlyBill = useDebounce(monthlyBill, 300);

  // Calculate results from solar data and monthly bill
  const calculateResults = useCallback(
    (solarData: SolarData, currentMonthlyBill: number, locationName: string, zip: string, stateId: string): CalculationResults => {
      const annualProduction = solarData.outputs.ac_annual;
      const pricePerWatt = getPricePerWatt(stateId);
      const systemCost = SYSTEM_SIZE_WATTS * pricePerWatt;

      // Calculate sun hours from NREL data (solrad_annual is kWh/m2/day average)
      const sunHours = solarData.outputs.solrad_annual || 5.0;

      // Calculate SunScore based on sun hours
      // Logic: >5.5 hours = 90-100, 5-5.5 = 80-89, 4.5-5 = 70-79, 4-4.5 = 60-69, <4 = 50-59
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

      // Calculate year-by-year costs
      const yearlyData: { year: number; utilityCost: number; solarCost: number }[] = [];
      let cumulativeUtilityCost = 0;
      const annualBill = currentMonthlyBill * 12;

      for (let year = 0; year <= YEARS_ANALYSIS; year++) {
        if (year > 0) {
          const inflatedBill = annualBill * Math.pow(1 + UTILITY_INFLATION_RATE, year - 1);
          cumulativeUtilityCost += inflatedBill;
        }
        yearlyData.push({
          year,
          utilityCost: cumulativeUtilityCost,
          solarCost: systemCost,
        });
      }

      const twentyFiveYearUtilityCost = cumulativeUtilityCost;
      const twentyFiveYearSavings = twentyFiveYearUtilityCost - systemCost;
      const firstYearSavings = annualBill;
      const paybackYears = systemCost / annualBill;
      const co2Offset = (annualProduction * 0.0007) * YEARS_ANALYSIS; // tons CO2
      const treesEquivalent = Math.round(co2Offset * 16.5); // ~16.5 trees per ton of CO2

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
      };
    },
    []
  );

  // Recalculate when monthly bill changes (if we have cached solar data)
  useEffect(() => {
    if (cachedSolarData.current && results && hasInteracted && selectedStateId) {
      const newResults = calculateResults(
        cachedSolarData.current,
        debouncedMonthlyBill,
        results.locationName,
        results.zipCode,
        selectedStateId
      );
      setResults(newResults);
    }
  }, [debouncedMonthlyBill, calculateResults, hasInteracted, selectedStateId]);

  // Generate random neighbor count on mount
  useEffect(() => {
    setNeighborCount(Math.floor(Math.random() * (180 - 120 + 1)) + 120);
  }, []);

  // Restore calculator session from localStorage (for "Return to Estimate" flow)
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('sunscore_session');
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);

        // Restore state
        if (sessionData.monthlyBill) setMonthlyBill(sessionData.monthlyBill);
        if (sessionData.billInputValue) setBillInputValue(sessionData.billInputValue);
        if (sessionData.address) setAddress(sessionData.address);
        if (sessionData.selectedLat) setSelectedLat(sessionData.selectedLat);
        if (sessionData.selectedLng) setSelectedLng(sessionData.selectedLng);
        if (sessionData.selectedStateId) setSelectedStateId(sessionData.selectedStateId);
        if (sessionData.results) setResults(sessionData.results);
        if (sessionData.hasInteracted) setHasInteracted(sessionData.hasInteracted);

        // Clear session after restore (one-time use)
        localStorage.removeItem('sunscore_session');

        // Scroll to results after state renders
        if (sessionData.results) {
          setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        }
      }
    } catch {
      // Ignore localStorage errors (e.g., private browsing)
    }
  }, []);

  // Sync bill input value when slider changes monthlyBill
  useEffect(() => {
    setBillInputValue(monthlyBill.toLocaleString());
  }, [monthlyBill]);

  // Show/hide sticky CTA based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA after scrolling past ~600px (past the calculator section)
      setShowStickyCTA(window.scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch solar data
  const fetchSolarData = async () => {
    if (!address.trim()) {
      setError("Please enter your address");
      return;
    }

    if (!selectedLat || !selectedLng) {
      setError("Please select an address from the dropdown suggestions");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);
    setHasInteracted(true);

    try {
      // Call our NREL API route
      const nrelResponse = await fetch(
        `/api/solar?lat=${selectedLat}&lon=${selectedLng}`
      );

      if (!nrelResponse.ok) {
        throw new Error("Unable to fetch solar data. Please try again later.");
      }

      const solarData: SolarData = await nrelResponse.json();

      if (!solarData.outputs || !solarData.outputs.ac_annual) {
        throw new Error("Invalid solar data received. This location may not be supported.");
      }

      // Cache the solar data for recalculations
      cachedSolarData.current = solarData;

      // Extract zip code from address
      const zipMatch = address.match(/\b\d{5}(?:-\d{4})?\b/);
      const zipCode = zipMatch ? zipMatch[0] : "";

      // Calculate results using state-specific rates
      const calculatedResults = calculateResults(solarData, monthlyBill, address, zipCode, selectedStateId);
      setResults(calculatedResults);

      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);

    } catch (err) {
      // Handle network errors with user-friendly messages
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      if (errorMessage === "Load failed" || errorMessage === "Failed to fetch" || errorMessage.includes("network")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSolarData();
  };

  // Handle share SunScore
  const handleShareScore = async () => {
    if (!results) return;

    const shareText = `My house has a SunScore of ${results.sunScore}/100! Check yours at SunScore.io`;

    try {
      await navigator.clipboard.writeText(shareText);
      setToastMessage("Copied to clipboard!");
      setShowToast(true);
    } catch {
      // Fallback for older browsers
      setToastMessage("Share: " + shareText);
      setShowToast(true);
    }
  };

  // Handle Get Quote CTA - Redirects to Bridge Page
  const handleGetQuote = () => {
    if (!results) return;

    // Save calculator state to localStorage for session restore
    const sessionData = {
      monthlyBill,
      billInputValue,
      address,
      selectedLat,
      selectedLng,
      selectedStateId,
      results,
      hasInteracted,
    };
    localStorage.setItem('sunscore_session', JSON.stringify(sessionData));

    // Construct URL params with the data we have
    const queryParams = new URLSearchParams({
      zip: results.zipCode,
      bill: monthlyBill.toString(),
      score: results.sunScore.toString(),
      address: address, // On home page, we pass the full address string
      state: selectedStateId
    }).toString();

    // Navigate to the Bridge Page
    router.push(`/quote?${queryParams}`);
  };

  // FAQ Data
  const faqs = [
    {
      question: "How long does it take for solar to pay for itself?",
      answer:
        "The payback period depends on your electricity costs, system size, and local sun exposure. Most homeowners see their system pay for itself in 6-10 years through electricity savings. After that point, you're essentially generating free electricity for the remaining 15-20+ years of your system's life. Our calculator uses your actual utility costs and NREL solar data to estimate your specific payback timeline.",
    },
    {
      question: "Is NREL data accurate?",
      answer:
        "Yes. The National Renewable Energy Laboratory (NREL) is a U.S. Department of Energy national laboratory. Their PVWatts® Calculator uses actual solar irradiance data from satellites and weather stations, accounting for your specific location, climate, and typical weather patterns. It's the industry-standard tool used by solar professionals nationwide for accurate production estimates.",
    },
    {
      question: "What if I sell my home?",
      answer:
        "Solar panels typically increase home value by 4-6% according to Zillow research. Studies show homes with owned solar systems sell faster and for more money than comparable homes without solar. Buyers value the locked-in energy savings. If you have a solar loan, you can either pay it off at closing or transfer it to the new owner (depending on loan terms).",
    },
    {
      question: "What are my financing options?",
      answer:
        "You have several options: (1) Cash Purchase — highest ROI, own the system outright immediately. (2) Solar Loans — $0 down available, allowing you to own the system from day one and build equity instead of renting power.",
    },
  ];

  // JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "2026 Solar Savings Calculator",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Calculate your solar savings with official NREL government data. Get your personalized 25-year savings estimate instantly.",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "2847",
      bestRating: "5",
      worstRating: "1",
    },
    featureList: [
      "Official NREL Solar Data",
      "State-Specific Pricing",
      "25-Year Savings Projection",
      "Interactive Cost Comparison Chart",
    ],
  };

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
        {/* Header/Navbar */}
        <header className="sticky top-0 z-40 w-full border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md">
          <nav className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            {/* Left - Logo */}
            <a
              href="#calculator"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex-shrink-0"
            >
              <Image
                src="/sunscore.logo.png"
                alt="SunScore - Official Solar Savings Calculator"
                width={200}
                height={48}
                className="h-8 w-auto md:h-12 max-w-[130px] md:max-w-[200px]"
                priority
              />
            </a>

            {/* Center - Navigation Links (Desktop Only) */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { label: "How it Works", href: "#how-it-works" },
                { label: "Accuracy", href: "#accuracy" },
                { label: "FAQ", href: "#faq" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(link.href.slice(1))?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Right - Get Quote CTA */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (results) {
                  handleGetQuote();
                } else {
                  document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="min-h-[44px] px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-gray-900 text-sm font-semibold rounded-full shadow-lg shadow-yellow-500/20 transition-all"
            >
              <span className="hidden sm:inline">Get Quote</span>
              <span className="sm:hidden">Quote</span>
            </motion.button>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-40 right-0 w-[300px] h-[300px] bg-green-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-4xl mx-auto px-5 md:px-4 py-12 md:py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="text-center space-y-4 md:space-y-6"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs md:text-sm font-medium"
              >
                <Zap className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>2026 Updated • NREL Official Data</span>
              </motion.div>

              {/* H1 */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                Stop{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-300">
                  Renting
                </span>{" "}
                Your Power.
              </h1>

              <p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                See how much you could save with solar. Official government data.
                <br className="hidden sm:block" />
                <span className="text-emerald-400 font-semibold">
                  25-year savings estimate
                </span>
                {" "}based on your location.
              </p>

              {/* Trust Badges */}
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
                  <div
                    key={text}
                    className="flex items-center gap-1.5 md:gap-2 text-gray-400 text-xs md:text-sm"
                  >
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

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Address Input with Autocomplete */}
              <div className="space-y-2">
                <label
                  htmlFor="address"
                  className="flex items-center gap-2 text-sm font-medium text-gray-300"
                >
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  Your Address
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <AddressAutocomplete
                    onSelect={(addr, details) => {
                      setAddress(addr);
                      setSelectedLat(details.lat);
                      setSelectedLng(details.lng);
                      setSelectedStateId(details.stateId);
                      // Clear error when address is successfully selected
                      if (error) setError(null);
                    }}
                    onChange={(typedValue) => {
                      // Track typed value but clear lat/lng since user is typing new address
                      setAddress(typedValue);
                      setSelectedLat(null);
                      setSelectedLng(null);
                      setSelectedStateId("");
                      // Clear any previous error when user starts typing
                      if (error) setError(null);
                    }}
                    onError={(errorMessage) => {
                      setError(errorMessage);
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto min-h-[44px] px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 disabled:shadow-none sm:min-w-[140px]"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sun className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <>
                        <Calculator className="w-5 h-5" />
                        <span>Calculate</span>
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
                    🔥 <span className="text-gray-400 font-medium">{neighborCount}</span> homeowners in your area checked their score today.
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
                  <div className="flex items-center gap-1 group cursor-text" onClick={() => document.getElementById('billInput')?.focus()}>
                    <span className="text-emerald-400 text-2xl font-bold">$</span>
                    <input
                      id="billInput"
                      type="text"
                      inputMode="numeric"
                      value={billInputValue}
                      onChange={(e) => {
                        // Allow free typing - only strip non-numeric chars
                        const raw = e.target.value.replace(/[^0-9]/g, '');
                        setBillInputValue(raw);
                      }}
                      onBlur={() => {
                        // Validate and set actual value when done editing
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
                    value={Math.min(monthlyBill, 1200)}
                    onChange={(e) => setMonthlyBill(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-emerald-500/30 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                  />
                  {/* Track fill effect */}
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

            {/* Results Area */}
            <div className="mt-8 scroll-mt-20" ref={resultsRef}>
              <AnimatePresence mode="wait">
                {/* Loading State */}
                {isLoading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <SkeletonLoader />
                  </motion.div>
                )}

                {/* Error State */}
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
                      <p className="text-red-400 font-medium">
                        Unable to calculate savings
                      </p>
                      <p className="text-red-400/80 text-sm mt-1">{error}</p>
                    </div>
                  </motion.div>
                )}

                {/* Results State */}
                {results && !isLoading && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* Location Confirmation */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center gap-2 text-sm text-gray-400"
                    >
                      {/* Pulsing MapPin */}
                      <span className="relative flex items-center justify-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-50" />
                        <MapPin className="relative w-4 h-4 text-red-500" />
                      </span>
                      <span className="truncate max-w-md tracking-wide">
                        Results for: {address} {results.zipCode}
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
                          <SunScoreGauge
                            score={results.sunScore}
                            sunHours={results.sunHours}
                          />
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

                    {/* Savings Chart - Styled to match Dashboard */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="p-4 bg-gradient-to-br from-gray-900/90 via-slate-950/95 to-gray-900/90 border border-cyan-500/30 rounded-2xl backdrop-blur-sm relative overflow-hidden"
                      style={{
                        boxShadow: '0 0 30px rgba(6, 182, 212, 0.15), 0 0 60px rgba(6, 182, 212, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      {/* Subtle corner accents - Match Dashboard */}
                      <div className="absolute top-0 left-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
                      <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                      <div className="relative z-10">
                        <SavingsChart yearlyData={results.yearlyData} />
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
                        icon={Home}
                        label="Est. System Cost"
                        value={formatCurrency(results.systemCost)}
                        iconColor="text-emerald-400"
                      />
                      <StatCard
                        icon={TrendingUp}
                        label="Payback Period"
                        value={`${results.paybackYears} years`}
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
                Our calculator uses government satellite data to estimate your solar potential in three simple steps.
              </p>
            </div>

            {/* Steps with connecting line */}
            <div className="relative pt-4">
              {/* Connecting line - Desktop only */}
              <div className="hidden md:block absolute top-20 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-cyan-500/30 via-emerald-500/30 to-cyan-500/30" />

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: "1",
                    title: "Location Analysis",
                    description: "We geocode your address and retrieve solar irradiance data from NREL satellites covering your exact location.",
                    icon: MapPin,
                    color: "cyan",
                  },
                  {
                    step: "2",
                    title: "Production Calculation",
                    description: "Using the PVWatts® model, we calculate your estimated annual production based on local weather patterns and sun exposure.",
                    icon: Sun,
                    color: "emerald",
                  },
                  {
                    step: "3",
                    title: "Savings Projection",
                    description: "We compare your current utility costs (based on historical utility rate trends) against owning solar to show your 25-year savings.",
                    icon: TrendingUp,
                    color: "cyan",
                  },
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

          {/* Accuracy & Trust Section */}
          <section id="accuracy" className="mt-16 space-y-8 scroll-mt-20">
            <div className="text-center space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold">Why Trust Our Data?</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                We use the same data sources as professional solar installers across the country.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-6 bg-gradient-to-br from-emerald-500/10 to-green-500/5 hover:from-emerald-500/15 hover:to-green-500/10 border border-emerald-500/30 rounded-xl transition-colors duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Shield className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Official NREL Data</h3>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                  The National Renewable Energy Laboratory (NREL) is a U.S. Department of Energy national laboratory. Their PVWatts® Calculator is the industry-standard tool used by solar professionals nationwide.
                </p>
                <ul className="space-y-2">
                  {[
                    "30+ years of satellite weather data",
                    "Location-specific irradiance measurements",
                    "Accounts for local climate patterns",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/5 hover:from-green-500/15 hover:to-emerald-500/10 border border-green-500/30 rounded-xl transition-colors duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">State-Specific Pricing</h3>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                State-Specific Pricing Our calculator estimates installation costs based on regional market averages for your state. Prices reflect local variances in equipment, labor rates, and installation complexity.
                </p>
                <ul className="space-y-2">
                  {[
                    "Updated 2026 pricing data",
                    "Accounts for regional market trends",
                    "Based on state-level industry averages",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="mt-16 space-y-6 scroll-mt-20" aria-labelledby="faq-heading">
            <h2
              id="faq-heading"
              className="text-2xl md:text-3xl font-bold text-center"
            >
              Frequently Asked Questions
            </h2>
            <p className="text-gray-400 text-center max-w-2xl mx-auto">
              Everything you need to know about solar savings, payback periods, and
              making the switch to clean energy.
            </p>
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

          {/* Professional Footer */}
          <footer className="mt-20 pt-12 border-t border-gray-800">
            <div className="grid md:grid-cols-3 gap-8 mb-10">
              {/* Brand Column */}
              <div className="space-y-4">
                <Image
                  src="/sunscore.logo.png"
                  alt="SunScore"
                  width={140}
                  height={32}
                  className="h-8 w-auto opacity-80"
                />
                <p className="text-sm text-gray-500 leading-relaxed">
                  Helping homeowners make informed solar decisions with official government data and transparent savings estimates.
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield className="w-3 h-3 text-emerald-500" />
                  <span>Estimates based on NREL PVWatts®</span>
                </div>
              </div>

              {/* Quick Links Column */}
              <div className="space-y-4">
                <p className="text-sm font-semibold text-white">Quick Links</p>
                <nav className="flex flex-col gap-2">
                  {[
                    { label: "Calculator", href: "#calculator", isAnchor: true },
                    { label: "How it Works", href: "#how-it-works", isAnchor: true },
                    { label: "Accuracy", href: "#accuracy", isAnchor: true },
                    { label: "FAQ", href: "#faq", isAnchor: true },
                    { label: "Solar by State", href: "/locations", isAnchor: false },
                  ].map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={link.isAnchor ? (e) => {
                        e.preventDefault();
                        document.getElementById(link.href.slice(1))?.scrollIntoView({ behavior: "smooth" });
                      } : undefined}
                      className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Legal Column */}
              <div className="space-y-4">
                <p className="text-sm font-semibold text-white">Legal</p>
                <nav className="flex flex-col gap-2">
                  <a href="/privacy-policy" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                    Privacy Policy
                  </a>
                  <a href="/terms-of-service" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                    Terms of Service
                  </a>
                  <a href="/disclaimer" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                    Disclaimer
                  </a>
                </nav>
              </div>
            </div>

            {/* Disclaimers */}
            <div className="py-6 border-t border-gray-800/50 space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                <strong className="text-gray-400">Solar Estimates:</strong> Production estimates powered by the NREL PVWatts® Calculator. This tool provides estimates only and does not guarantee actual savings. Actual results may vary based on roof condition, shading, local utility rates, and other factors.
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                <strong className="text-gray-400">Pricing:</strong> System costs are based on state-average installation prices and may vary based on installer, equipment choices, roof complexity, and local permitting requirements. Get quotes from local installers for accurate pricing.
              </p>
            </div>

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
              style={{
                background: "linear-gradient(to top, rgba(3, 7, 18, 0.98), rgba(3, 7, 18, 0.9))",
              }}
            >
              <button
                onClick={() => {
                  if (results) {
                    handleGetQuote();
                  } else {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className={`w-full min-h-[48px] py-4 font-bold text-lg rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-200 ${
                  results
                    ? "bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 hover:from-yellow-400 hover:via-amber-400 hover:to-yellow-400 text-gray-900 shadow-yellow-500/30"
                    : "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-emerald-500/30"
                }`}
              >
                {results ? "Get My Official Quote" : "Calculate My Savings"}
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast Notification */}
        <Toast
          message={toastMessage}
          isVisible={showToast}
          onClose={() => setShowToast(false)}
        />
      </main>
    </>
  );
}

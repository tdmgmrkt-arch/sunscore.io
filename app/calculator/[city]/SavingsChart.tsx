"use client";

import { motion } from "framer-motion";

const YEARS_ANALYSIS = 25;

interface SavingsChartProps {
  yearlyData: { year: number; utilityCost: number; solarCost: number }[];
}

export default function SavingsChart({ yearlyData }: SavingsChartProps) {
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
            id="savingsGradientCity"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
          </linearGradient>

          {/* Utility cost gradient */}
          <linearGradient id="utilityGradientCity" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>

          {/* Solar progress stroke gradient */}
          <linearGradient id="solarGradientCity" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
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
          fill="url(#savingsGradientCity)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />

        {/* Utility cost line (red/orange gradient) */}
        <motion.path
          d={utilityPath}
          fill="none"
          stroke="url(#utilityGradientCity)"
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
          stroke="url(#solarGradientCity)"
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

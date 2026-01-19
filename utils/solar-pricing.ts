// utils/solar-pricing.ts
// Data based on average Solar Price Per Watt (PPW) by State (2025/2026 Estimates)
export const STATE_SOLAR_PRICING: Record<string, number> = {
  AL: 3.42, AK: 3.52, AZ: 2.79, AR: 2.63,
  CA: 3.33, CO: 3.41, CT: 2.93, DE: 2.94,
  DC: 3.53, FL: 2.61, GA: 3.17, HI: 3.13,
  ID: 3.08, IL: 3.14, IN: 3.14, IA: 2.77,
  KS: 2.97, KY: 2.74, LA: 3.37, ME: 3.10,
  MD: 2.91, MA: 3.12, MI: 3.44, MN: 2.96,
  MS: 3.14, MO: 2.68, MT: 2.91, NE: 2.79,
  NV: 2.85, NH: 2.97, NJ: 3.12, NM: 3.12,
  NY: 3.33, NC: 3.10, ND: 3.13, OH: 2.90,
  OK: 2.64, OR: 3.18, PA: 3.10, RI: 3.04,
  SC: 3.06, SD: 2.78, TN: 2.97, TX: 2.85,
  UT: 3.19, VT: 2.79, VA: 3.05, WA: 3.20,
  WV: 2.83, WI: 3.01, WY: 3.18,
  // Fallback National Avg
  US_AVG: 3.00
};

export function getPricePerWatt(stateId: string): number {
  const code = stateId.toUpperCase().trim();
  return STATE_SOLAR_PRICING[code] || STATE_SOLAR_PRICING.US_AVG;
}

// utils/electricity-rates.ts
// Data based on EIA 2024/2025 Average Residential Prices
export const STATE_ELECTRICITY_RATES: Record<string, number> = {
  AL: 0.16, AK: 0.26, AZ: 0.15, AR: 0.13,
  CA: 0.32, CO: 0.16, CT: 0.29, DE: 0.17,
  DC: 0.19, FL: 0.15, GA: 0.15, HI: 0.42,
  ID: 0.12, IL: 0.18, IN: 0.17, IA: 0.14,
  KS: 0.15, KY: 0.13, LA: 0.12, ME: 0.28,
  MD: 0.19, MA: 0.31, MI: 0.20, MN: 0.16,
  MS: 0.14, MO: 0.13, MT: 0.14, NE: 0.12,
  NV: 0.16, NH: 0.26, NJ: 0.21, NM: 0.15,
  NY: 0.25, NC: 0.15, ND: 0.12, OH: 0.17,
  OK: 0.14, OR: 0.15, PA: 0.19, RI: 0.30,
  SC: 0.15, SD: 0.14, TN: 0.13, TX: 0.15,
  UT: 0.12, VT: 0.22, VA: 0.15, WA: 0.13,
  WV: 0.16, WI: 0.18, WY: 0.14,
  // Fallback
  US_AVG: 0.18
};

export function getElectricityRate(stateId: string): number {
  const code = stateId.toUpperCase().trim();
  return STATE_ELECTRICITY_RATES[code] || STATE_ELECTRICITY_RATES.US_AVG;
}

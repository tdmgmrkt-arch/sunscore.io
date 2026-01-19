// utils/nrel.ts
import { getElectricityRate } from './electricity-rates';
import { getPricePerWatt } from './solar-pricing';
import { getLocalVariance } from './variance';
import { getStateAvgBill } from './state-bills';

const SYSTEM_CAPACITY_KW = 6;
const US_AVERAGE_SUN_HOURS = 4.5;

export interface NRELStationInfo {
  lat: number;
  lon: number;
  elev: number;
  tz: number;
  location: string;
  city: string;
  state: string;
  solar_resource_file: string;
  distance: number;
}

export interface NRELEstimates {
  system_size_kw: number;
  gross_cost: number;
  net_cost: number;
  electricity_rate_used: number;
  price_per_watt_used: number;
  first_year_savings: number;
  twenty_five_year_savings: number;
  default_bill: number; // Dynamic bill based on climate + variance
}

export interface NRELData {
  ac_annual: number;
  solrad_annual: number;
  capacity_factor: number;
  station_info: NRELStationInfo;
  station_distance_miles: number;
  estimates: NRELEstimates;
}

// Updated signature with citySlug for dynamic variance
export async function fetchNRELData(
  lat: string,
  lng: string,
  state_id: string,
  citySlug: string = ''
): Promise<NRELData> {
  const apiKey = process.env.NREL_API_KEY;

  if (!apiKey) {
    throw new Error('NREL_API_KEY environment variable is not set');
  }

  const url = `https://developer.nrel.gov/api/pvwatts/v8.json?api_key=${apiKey}&lat=${lat}&lon=${lng}&system_capacity=${SYSTEM_CAPACITY_KW}&module_type=1&losses=14&array_type=1&tilt=20&azimuth=180`;

  const res = await fetch(url, {
    next: { revalidate: 86400 * 30 }, // Cache for 30 days
  });

  if (!res.ok) throw new Error('Failed to fetch NREL data');

  const data = await res.json();
  const outputs = data.outputs;

  // 1. Get Base State Data
  let electricityRate = getElectricityRate(state_id);
  let pricePerWatt = getPricePerWatt(state_id);
  let avgMonthlyBill = getStateAvgBill(state_id);

  // 2. CLIMATE SCALING (The "AC Factor")
  // Sunnier areas = higher cooling costs = higher bills
  const sunHours = outputs.solrad_annual;
  const sunRatio = sunHours / US_AVERAGE_SUN_HOURS;
  // Mix 50% "Climate Impact" with 50% "Base Average"
  const climateMultiplier = 1 + (sunRatio - 1) * 0.5;
  avgMonthlyBill = avgMonthlyBill * climateMultiplier;

  // 3. APPLY VARIANCE (Uniqueness per city)
  if (citySlug) {
    const { costMultiplier, rateMultiplier } = getLocalVariance(citySlug);
    electricityRate = electricityRate * rateMultiplier;
    pricePerWatt = pricePerWatt * costMultiplier;
    avgMonthlyBill = avgMonthlyBill * rateMultiplier;
  }

  // 4. Financial Math
  const annualProduction = outputs.ac_annual;
  const annualSavings = annualProduction * electricityRate;
  const twentyFiveYearSavings = annualSavings * 25;

  // 5. Calculate Cost (NO Federal Tax Credit applied)
  const grossCost = SYSTEM_CAPACITY_KW * 1000 * pricePerWatt;
  const netCost = grossCost; // No incentive subtraction

  // Convert station distance from km to miles
  const stationDistanceMiles = data.station_info.distance * 0.621371;

  return {
    ac_annual: annualProduction,
    solrad_annual: outputs.solrad_annual,
    capacity_factor: outputs.capacity_factor,
    station_info: data.station_info,
    station_distance_miles: Math.round(stationDistanceMiles * 10) / 10,
    estimates: {
      system_size_kw: SYSTEM_CAPACITY_KW,
      gross_cost: Number(grossCost.toFixed(0)),
      net_cost: Number(netCost.toFixed(0)),
      electricity_rate_used: Number(electricityRate.toFixed(3)),
      price_per_watt_used: Number(pricePerWatt.toFixed(2)),
      first_year_savings: Number(annualSavings.toFixed(0)),
      twenty_five_year_savings: Number(twentyFiveYearSavings.toFixed(0)),
      default_bill: Math.round(avgMonthlyBill),
    },
  };
}

/**
 * Calculate peak sun hours from solar radiation data
 */
export function calculatePeakSunHours(solradAnnual: number): number {
  // solrad_annual is kWh/m2/day average
  return Math.round(solradAnnual * 10) / 10;
}

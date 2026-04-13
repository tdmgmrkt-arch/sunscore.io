// =============================================================================
// State Solar Policy & Incentive Data
// =============================================================================
// Hand-curated factual data per state. Used to feed AI content generation
// and to render a factual incentive summary box on state pages.
//
// Data reflects general policy status as of early 2026. Always link out to
// DSIRE (dsireusa.org) as the authoritative source for users who want
// current details.
// =============================================================================

export interface StateIncentiveData {
  // Net metering status
  netMetering: "full" | "partial" | "net-billing" | "none";
  netMeteringNote: string;

  // SREC market (Solar Renewable Energy Certificates)
  srecMarket: boolean;
  srecNote?: string;

  // State-level tax credit or rebate (on top of federal ITC)
  stateIncentive: boolean;
  stateIncentiveNote?: string;

  // Property tax exemption for solar
  propertyTaxExemption: boolean;

  // Sales tax exemption on solar equipment
  salesTaxExemption: boolean;

  // General climate/solar potential descriptor
  solarClimate: "excellent" | "strong" | "good" | "moderate";
}

export const STATE_INCENTIVES: Record<string, StateIncentiveData> = {
  AL: { netMetering: "none", netMeteringNote: "No statewide net metering; utilities offer limited buyback programs at reduced rates.", srecMarket: false, stateIncentive: false, propertyTaxExemption: false, salesTaxExemption: false, solarClimate: "strong" },
  AK: { netMetering: "partial", netMeteringNote: "Net metering available for systems under 25 kW.", srecMarket: false, stateIncentive: false, propertyTaxExemption: false, salesTaxExemption: true, solarClimate: "moderate" },
  AZ: { netMetering: "net-billing", netMeteringNote: "Replaced full net metering with net billing; excess generation credited at a reduced 'export rate'.", srecMarket: false, stateIncentive: true, stateIncentiveNote: "Residential solar tax credit up to $1,000.", propertyTaxExemption: true, salesTaxExemption: true, solarClimate: "excellent" },
  AR: { netMetering: "full", netMeteringNote: "1-for-1 net metering available through 2024 grandfathering; newer rules phase toward net billing.", srecMarket: false, stateIncentive: false, propertyTaxExemption: false, salesTaxExemption: false, solarClimate: "strong" },
  CA: { netMetering: "net-billing", netMeteringNote: "NEM 3.0 replaced traditional net metering; exports compensated at avoided-cost rates, reducing payback for export-only systems. Pairing with battery storage is strongly recommended.", srecMarket: false, stateIncentive: true, stateIncentiveNote: "SGIP battery incentive available for qualifying homes.", propertyTaxExemption: true, salesTaxExemption: false, solarClimate: "excellent" },
  CO: { netMetering: "full", netMeteringNote: "Full retail-rate net metering for most investor-owned utilities.", srecMarket: false, stateIncentive: false, propertyTaxExemption: true, salesTaxExemption: true, solarClimate: "excellent" },
  CT: { netMetering: "net-billing", netMeteringNote: "Transitioned to a 'Residential Renewable Energy Solutions' tariff with netting and buyback options.", srecMarket: false, stateIncentive: false, propertyTaxExemption: true, salesTaxExemption: true, solarClimate: "moderate" },
  DE: { netMetering: "full", netMeteringNote: "1-for-1 retail-rate net metering available.", srecMarket: true, srecNote: "Delaware has an active SREC market.", stateIncentive: true, stateIncentiveNote: "Green Energy Program grants available.", propertyTaxExemption: false, salesTaxExemption: false, solarClimate: "strong" },
  DC: { netMetering: "full", netMeteringNote: "Full retail net metering for systems up to 1 MW.", srecMarket: true, srecNote: "DC has one of the most lucrative SREC markets in the country.", stateIncentive: true, stateIncentiveNote: "Solar for All program provides free or subsidized solar for income-qualified residents.", propertyTaxExemption: true, salesTaxExemption: false, solarClimate: "strong" },
  FL: { netMetering: "full", netMeteringNote: "Full retail-rate net metering currently available, though legislative changes have been proposed.", srecMarket: false, stateIncentive: false, propertyTaxExemption: true, salesTaxExemption: true, solarClimate: "excellent" },
  GA: { netMetering: "partial", netMeteringNote: "Monthly netting available; excess exports credited at avoided-cost rates rather than retail.", srecMarket: false, stateIncentive: false, propertyTaxExemption: false, salesTaxExemption: false, solarClimate: "strong" },
  HI: { netMetering: "net-billing", netMeteringNote: "Closed traditional net metering; newer programs include 'Customer Self-Supply' and 'Smart Export' with time-of-use export rates.", srecMarket: false, stateIncentive: true, stateIncentiveNote: "35% state tax credit up to $5,000 per system.", propertyTaxExemption: false, salesTaxExemption: false, solarClimate: "excellent" },
  ID: { netMetering: "partial", netMeteringNote: "Utility-specific net metering programs; terms vary by provider.", srecMarket: false, stateIncentive: true, stateIncentiveNote: "State tax deduction for residential solar.", propertyTaxExemption: false, salesTaxExemption: false, solarClimate: "good" },
  IL: { netMetering: "full", netMeteringNote: "Full retail-rate net metering available.", srecMarket: true, srecNote: "Illinois Shines program provides SREC-like payments through the Adjustable Block Program.", stateIncentive: true, stateIncentiveNote: "Illinois Shines program offers upfront incentives based on expected system production.", propertyTaxExemption: true, salesTaxExemption: false, solarClimate: "moderate" },
  IN: { netMetering: "none", netMeteringNote: "Net metering phased out for new customers; replaced with excess distributed generation credits at wholesale rates.", srecMarket: false, stateIncentive: false, propertyTaxExemption: true, salesTaxExemption: true, solarClimate: "moderate" },
  IA: { netMetering: "full", netMeteringNote: "Investor-owned utilities required to offer net metering; terms vary for co-ops.", srecMarket: false, stateIncentive: false, propertyTaxExemption: true, salesTaxExemption: true, solarClimate: "good" },
  KS: { netMetering: "partial", netMeteringNote: "Net metering available but with demand charges in some utility territories.", srecMarket: false, stateIncentive: false, propertyTaxExemption: true, salesTaxExemption: false, solarClimate: "strong" },
  KY: { netMetering: "partial", netMeteringNote: "Transitioned away from 1-for-1 net metering; exports now credited at a reduced rate.", srecMarket: false, stateIncentive: false, propertyTaxExemption: false, salesTaxExemption: false, solarClimate: "good" },
  LA: { netMetering: "net-billing", netMeteringNote: "Closed traditional net metering; newer systems use net billing with avoided-cost credits.", srecMarket: false, stateIncentive: false, propertyTaxExemption: true, salesTaxExemption: false, solarClimate: "strong" },
  ME: { netMetering: "full", netMeteringNote: "Net energy billing with 1-for-1 credits for most residential systems.", srecMarket: false, stateIncentive: false, propertyTaxExemption: true, salesTaxExemption: true, solarClimate: "moderate" },
  MD: { netMetering: "full", netMeteringNote: "Full retail-rate net metering for systems up to 2 MW.", srecMarket: true, srecNote: "Maryland has an active SREC market.", stateIncentive: true, stateIncentiveNote: "Residential Clean Energy Grant Program offers $1,000 rebate.", propertyTaxExemption: true, salesTaxExemption: true, solarClimate: "strong" },
  MA: { netMetering: "full", netMeteringNote: "Net metering available through the SMART program tariffs.", srecMarket: false, stateIncentive: true, stateIncentiveNote: "SMART program provides monthly incentive payments; state tax credit up to $1,000.", propertyTaxExemption: true, salesTaxExemption: true, solarClimate: "moderate" },
  MI: { netMetering: "partial", netMeteringNote: "Replaced net metering with 'distributed generation' tariff; exports credited below retail rate.", srecMarket: false, stateIncentive: false, propertyTaxExemption: false, salesTaxExemption: false, solarClimate: "moderate" },
  MN: { netMetering: "full", netMeteringNote: "Full retail-rate net metering for systems up to 40 kW.", srecMarket: false, stateIncentive: false, propertyTaxExemption: true, salesTaxExemption: true, solarClimate: "moderate" },
  MS: { netMetering: "partial", netMeteringNote: "Net metering available but with export credits below retail rates.", srecMarket: false, stateIncentive: false, propertyTaxExemption: false, salesTaxExemption: false, solarClimate: "strong" },
  MO: { netMetering: "full", netMeteringNote: "Full retail-rate net metering for systems up to 100 kW.", srecMarket: false, stateIncentive: false, propertyTaxExemption: true, salesTaxExemption: false, solarClimate: "good" },
  MT: { netMetering: "full", netMeteringNote: "1-for-1 net metering available for systems up to 50 kW.", srecMarket: false, stateIncentive: true, stateIncentiveNote: "State tax credit available for residential solar installations.", propertyTaxExemption: true, salesTaxExemption: false, solarClimate: "good" },
  NE: { netMetering: "partial", netMeteringNote: "Net metering available but limited to systems under 25 kW.", srecMarket: false, stateIncentive: false, propertyTaxExemption: false, salesTaxExemption: false, solarClimate: "strong" },
  NV: { netMetering: "partial", netMeteringNote: "Tiered net metering program with export rates declining as more customers enroll.", srecMarket: false, stateIncentive: false, propertyTaxExemption: true, salesTaxExemption: false, solarClimate: "excellent" },
  NH: { netMetering: "partial", netMeteringNote: "Net metering available with a 'net energy' tariff; residential exports credited at roughly 75% of retail.", srecMarket: false, stateIncentive: true, stateIncentiveNote: "Residential rebate program available through NH PUC.", propertyTaxExemption: true, salesTaxExemption: false, solarClimate: "moderate" },
  NJ: { netMetering: "full", netMeteringNote: "Full retail-rate net metering available.", srecMarket: true, srecNote: "New Jersey's SuSI program provides SREC-II certificates for ongoing payments.", stateIncentive: true, stateIncentiveNote: "Sales and property tax exemptions plus ongoing SuSI program payments.", propertyTaxExemption: true, salesTaxExemption: true, solarClimate: "moderate" },
  NM: { netMetering: "full", netMeteringNote: "Full retail-rate net metering for systems up to 80 MW.", srecMarket: false, stateIncentive: true, stateIncentiveNote: "10% state tax credit up to $6,000 for residential solar.", propertyTaxExemption: true, salesTaxExemption: false, solarClimate: "excellent" },
  NY: { netMetering: "full", netMeteringNote: "Net metering available with a 'Customer Benefit Contribution' fee added to solar bills.", srecMarket: false, stateIncentive: true, stateIncentiveNote: "25% state tax credit up to $5,000; NY-Sun program provides upfront rebates.", propertyTaxExemption: true, salesTaxExemption: true, solarClimate: "moderate" },
  NC: { netMetering: "partial", netMeteringNote: "Net metering replaced with 'bridge rate' structure; terms evolving with Duke Energy programs.", srecMarket: false, stateIncentive: false, propertyTaxExemption: true, salesTaxExemption: false, solarClimate: "strong" },
  ND: { netMetering: "partial", netMeteringNote: "Net metering available but with limits; check with your specific utility.", srecMarket: false, stateIncentive: false, propertyTaxExemption: true, salesTaxExemption: false, solarClimate: "good" },
  OH: { netMetering: "full", netMeteringNote: "Net metering available through investor-owned utilities.", srecMarket: true, srecNote: "Ohio has an SREC market though prices are modest.", stateIncentive: false, propertyTaxExemption: false, salesTaxExemption: false, solarClimate: "moderate" },
  OK: { netMetering: "partial", netMeteringNote: "Net metering available but without 1-for-1 credits; excess exported at avoided cost.", srecMarket: false, stateIncentive: false, propertyTaxExemption: false, salesTaxExemption: false, solarClimate: "strong" },
  OR: { netMetering: "full", netMeteringNote: "Full retail-rate net metering for residential systems.", srecMarket: false, stateIncentive: true, stateIncentiveNote: "Oregon Solar + Storage Rebate Program offers upfront rebates.", propertyTaxExemption: true, salesTaxExemption: false, solarClimate: "good" },
  PA: { netMetering: "full", netMeteringNote: "Full retail-rate net metering available.", srecMarket: true, srecNote: "Pennsylvania has an SREC market though prices have declined.", stateIncentive: false, propertyTaxExemption: false, salesTaxExemption: false, solarClimate: "moderate" },
  RI: { netMetering: "full", netMeteringNote: "Net metering available through the Renewable Energy Growth program.", srecMarket: false, stateIncentive: true, stateIncentiveNote: "REG program provides fixed performance-based incentives.", propertyTaxExemption: true, salesTaxExemption: true, solarClimate: "moderate" },
  SC: { netMetering: "partial", netMeteringNote: "Transitioned to a 'solar choice' tariff with export rates below retail.", srecMarket: false, stateIncentive: true, stateIncentiveNote: "25% state tax credit up to $3,500 per year.", propertyTaxExemption: false, salesTaxExemption: false, solarClimate: "strong" },
  SD: { netMetering: "none", netMeteringNote: "No statewide net metering mandate; check directly with your utility.", srecMarket: false, stateIncentive: false, propertyTaxExemption: true, salesTaxExemption: false, solarClimate: "good" },
  TN: { netMetering: "partial", netMeteringNote: "TVA's Green Connect program replaces traditional net metering with buyback at wholesale rates.", srecMarket: false, stateIncentive: false, propertyTaxExemption: false, salesTaxExemption: false, solarClimate: "strong" },
  TX: { netMetering: "partial", netMeteringNote: "No statewide mandate; many retail electric providers offer solar buyback plans with varying export rates.", srecMarket: false, stateIncentive: false, propertyTaxExemption: true, salesTaxExemption: false, solarClimate: "excellent" },
  UT: { netMetering: "partial", netMeteringNote: "Export credits reduced below retail under Rocky Mountain Power's 'export credit rate'.", srecMarket: false, stateIncentive: true, stateIncentiveNote: "State tax credit up to $400 for residential solar.", propertyTaxExemption: false, salesTaxExemption: false, solarClimate: "excellent" },
  VT: { netMetering: "full", netMeteringNote: "Full net metering with adjusters based on system size and siting.", srecMarket: false, stateIncentive: false, propertyTaxExemption: true, salesTaxExemption: true, solarClimate: "moderate" },
  VA: { netMetering: "full", netMeteringNote: "Full retail-rate net metering for systems up to 25 kW.", srecMarket: false, stateIncentive: false, propertyTaxExemption: true, salesTaxExemption: false, solarClimate: "strong" },
  WA: { netMetering: "full", netMeteringNote: "Full retail-rate net metering available.", srecMarket: false, stateIncentive: false, propertyTaxExemption: false, salesTaxExemption: true, solarClimate: "moderate" },
  WV: { netMetering: "full", netMeteringNote: "Net metering available for systems up to 25 kW residential.", srecMarket: false, stateIncentive: false, propertyTaxExemption: false, salesTaxExemption: false, solarClimate: "moderate" },
  WI: { netMetering: "partial", netMeteringNote: "Utility-specific net metering programs; terms vary significantly by provider.", srecMarket: false, stateIncentive: false, propertyTaxExemption: true, salesTaxExemption: false, solarClimate: "moderate" },
  WY: { netMetering: "full", netMeteringNote: "1-for-1 net metering available for systems up to 25 kW.", srecMarket: false, stateIncentive: false, propertyTaxExemption: false, salesTaxExemption: false, solarClimate: "good" },
  PR: { netMetering: "full", netMeteringNote: "Full net metering available through PREPA.", srecMarket: false, stateIncentive: false, propertyTaxExemption: false, salesTaxExemption: false, solarClimate: "excellent" },
};

export function getStateIncentives(stateId: string): StateIncentiveData | null {
  const code = stateId.toUpperCase().trim();
  return STATE_INCENTIVES[code] || null;
}

export function getNetMeteringLabel(status: StateIncentiveData["netMetering"]): string {
  switch (status) {
    case "full":
      return "Full Retail-Rate Net Metering";
    case "partial":
      return "Partial Net Metering";
    case "net-billing":
      return "Net Billing (Reduced Export Rates)";
    case "none":
      return "No Statewide Net Metering";
  }
}

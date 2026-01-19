// utils/variance.ts
// Generates consistent random numbers based on a text string (city slug)
// This ensures the same city always gets the same variance values

function getHashForString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getLocalVariance(citySlug: string): {
  costMultiplier: number; // For system cost
  rateMultiplier: number; // For electricity rate/bill
} {
  const hash = getHashForString(citySlug);
  const baseVariance = (hash % 100) / 100; // 0.00 to 0.99

  // +/- 8% Variance for costs
  const costMultiplier = 0.92 + baseVariance * 0.16;
  // +/- 5% Variance for rates (inverse correlation for realism)
  const rateMultiplier = 0.95 + (1 - baseVariance) * 0.1;

  return { costMultiplier, rateMultiplier };
}

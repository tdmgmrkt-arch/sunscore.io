// =============================================================================
// Google Gemini AI Content Generator for Programmatic SEO
// =============================================================================

import { CityData } from "@/lib/cities";

export interface GeneratedContent {
  title: string;
  meta_description: string;
  h1: string;
  intro_content: string; // For top of page (above calculator)
  detailed_content: string; // For bottom of page (below stats)
}

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}

// Helper to calculate savings range based on typical bill variations
function calculateSavingsRange(baseSavings: number): { low: number; high: number; lowFormatted: string; highFormatted: string } {
  // Base savings is calculated at ~$150/mo bill
  // Low estimate: ~$100/mo bill (67% of base)
  // High estimate: ~$300/mo bill (200% of base)
  const lowSavings = Math.round((baseSavings * 0.67) / 5000) * 5000; // Round to nearest $5k
  const highSavings = Math.round((baseSavings * 2.0) / 5000) * 5000;

  return {
    low: lowSavings,
    high: highSavings,
    lowFormatted: lowSavings.toLocaleString(),
    highFormatted: highSavings.toLocaleString(),
  };
}

export async function generateCityContent(
  cityData: CityData,
  lifetimeSavings: number,
  currentYear: number,
  sunHours: number
): Promise<GeneratedContent> {
  const API_KEY = process.env.GEMINI_API_KEY;
  const savingsRange = calculateSavingsRange(lifetimeSavings);

  if (!API_KEY) {
    console.warn("GEMINI_API_KEY not set, using fallback content");
    return getFallbackContent(cityData, lifetimeSavings, currentYear, sunHours);
  }

  const targetKeyword = `Solar panels in ${cityData.city}`;

  const prompt = `You are an SEO content writer. Generate content for a solar calculator page split into two distinct sections.

STRICT SEO DATA:
- Keyword: "${targetKeyword}"
- City: ${cityData.city}, ${cityData.state_id}
- Sun Hours: ${sunHours.toFixed(1)} peak hours (High Potential)
- Savings Range: $${savingsRange.lowFormatted} to $${savingsRange.highFormatted} (25-year estimate, depending on electricity usage)
- Urgency: Rising utility rates, inflation protection. (NO Tax Credit mentions).

OUTPUT REQUIREMENTS (JSON ONLY):
1. title: SEO Title starting with "${targetKeyword}"
2. meta_description: Click-worthy description. Use the savings RANGE (e.g., "$XX,000 to $XX,000 depending on usage").
3. h1: Exact keyword "${targetKeyword}"
4. intro_content: ONE punchy HTML paragraph (<p> tag only). Hook the user immediately about why ${cityData.city} is perfect for solar given the ${sunHours.toFixed(1)} sun hours. Keep it 40-50 words.
5. detailed_content: TWO HTML paragraphs (with <h3> headers). Focus on "Escaping Rate Hikes" and "Long-term Wealth". When mentioning savings, use the RANGE format "$${savingsRange.lowFormatted} to $${savingsRange.highFormatted} depending on your electricity consumption". Tone: Financial & Urgent. NO mentions of federal tax credits or ITC.

Return ONLY valid JSON with no markdown formatting.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            responseMimeType: "application/json",
          },
        }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Gemini API error: ${response.status}`);
      return getFallbackContent(cityData, lifetimeSavings, currentYear, sunHours);
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("No text in Gemini response");
      return getFallbackContent(cityData, lifetimeSavings, currentYear, sunHours);
    }

    return parseAndValidateContent(text, cityData, lifetimeSavings, currentYear, sunHours);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("Gemini API request timed out");
    } else {
      console.error("Gemini API error:", error);
    }
    return getFallbackContent(cityData, lifetimeSavings, currentYear, sunHours);
  }
}

function parseAndValidateContent(
  text: string,
  cityData: CityData,
  lifetimeSavings: number,
  currentYear: number,
  sunHours: number
): GeneratedContent {
  try {
    // Clean the response - remove any markdown code blocks if present
    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.slice(7);
    }
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.slice(3);
    }
    if (cleanText.endsWith("```")) {
      cleanText = cleanText.slice(0, -3);
    }
    cleanText = cleanText.trim();

    let parsed = JSON.parse(cleanText);

    // Handle case where Gemini returns an array instead of an object
    if (Array.isArray(parsed) && parsed.length > 0) {
      parsed = parsed[0];
    }

    // Validate required fields exist
    const missingFields = [];
    if (!parsed.title) missingFields.push("title");
    if (!parsed.meta_description) missingFields.push("meta_description");
    if (!parsed.h1) missingFields.push("h1");
    if (!parsed.intro_content) missingFields.push("intro_content");
    if (!parsed.detailed_content) missingFields.push("detailed_content");

    if (missingFields.length > 0) {
      console.warn(`Missing required fields in Gemini response: ${missingFields.join(", ")}`);
      return getFallbackContent(cityData, lifetimeSavings, currentYear, sunHours);
    }

    // Ensure H1 is exactly the target keyword
    const targetKeyword = `Solar panels in ${cityData.city}`;
    if (parsed.h1 !== targetKeyword) {
      parsed.h1 = targetKeyword;
    }

    // Ensure title starts with target keyword
    if (!parsed.title.toLowerCase().startsWith(targetKeyword.toLowerCase())) {
      parsed.title = `${targetKeyword} - ${currentYear} Cost & Savings | SunScore`;
    }

    return parsed;
  } catch (parseError) {
    console.error("Failed to parse Gemini JSON response:", parseError);
    return getFallbackContent(cityData, lifetimeSavings, currentYear, sunHours);
  }
}

function getFallbackContent(
  cityData: CityData,
  lifetimeSavings: number,
  currentYear: number,
  sunHours: number
): GeneratedContent {
  const targetKeyword = `Solar panels in ${cityData.city}`;
  const savingsRange = calculateSavingsRange(lifetimeSavings);

  // Determine sun quality descriptor based on peak sun hours
  let sunQuality = "solid";
  if (sunHours >= 5.5) sunQuality = "excellent";
  else if (sunHours >= 5.0) sunQuality = "strong";
  else if (sunHours >= 4.5) sunQuality = "good";

  return {
    title: `${targetKeyword} - ${currentYear} Cost & Savings | SunScore`,
    meta_description: `Calculate your solar savings in ${cityData.city}, ${cityData.state_id}. With ${sunHours.toFixed(1)} peak sun hours daily, homeowners save $${savingsRange.lowFormatted} to $${savingsRange.highFormatted} over 25 years depending on usage.`,
    h1: targetKeyword,
    intro_content: `<p>${cityData.city} is a prime location for solar energy, averaging <strong>${sunHours.toFixed(1)} peak sun hours</strong> per day—${sunQuality} solar potential. With electricity rates rising across ${cityData.state_name}, homeowners are switching to solar to lock in predictable energy costs and escape the utility rate rollercoaster.</p>`,
    detailed_content: `<h3>Why Utility Rates Keep Rising in ${cityData.state_name}</h3>
<p>Energy inflation is a growing concern for families in ${cityData.city}. Utility companies continue raising rates an average of 4% annually, and that trend shows no signs of slowing. By generating your own power with solar, you effectively freeze your electricity rate at today's cost of equipment—shielding your household budget from future utility price hikes for decades to come.</p>
<h3>Building Long-Term Wealth with Solar</h3>
<p>Solar isn't just about saving money—it's about redirecting cash flow. Over the next 25 years, switching to solar in ${cityData.city} could save you <strong>$${savingsRange.lowFormatted} to $${savingsRange.highFormatted}</strong> depending on your electricity consumption. That's money that stays in your pocket instead of going to the utility company. Use the calculator above to get your personalized estimate based on your actual electric bill.</p>`,
  };
}

/**
 * Get cached or generate new content
 * Uses a simple in-memory cache - in production, consider Redis or database caching
 */
const contentCache = new Map<string, { content: GeneratedContent; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days

export async function getCityContentWithCache(
  cityData: CityData,
  lifetimeSavings: number,
  currentYear: number,
  sunHours: number
): Promise<GeneratedContent> {
  const cacheKey = `${cityData.city}-${cityData.state_id}-${currentYear}`;
  const cached = contentCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.content;
  }

  const content = await generateCityContent(cityData, lifetimeSavings, currentYear, sunHours);

  contentCache.set(cacheKey, {
    content,
    timestamp: Date.now(),
  });

  return content;
}

// =============================================================================
// STATE PAGE CONTENT GENERATION
// =============================================================================

export interface StateGeneratedContent {
  title: string;
  meta_description: string;
  h1: string;
  intro_content: string; // One punchy paragraph for hero
  overview_content: string; // Two paragraphs covering climate + economics
}

export interface StateContentInput {
  stateId: string;
  stateName: string;
  cityCount: number;
  avgSunHours: number;
  electricityRate: number; // dollars per kWh
  pricePerWatt: number;
  solarClimate: "excellent" | "strong" | "good" | "moderate";
  netMeteringLabel: string;
  hasStateIncentive: boolean;
  stateIncentiveNote?: string;
  hasSrecMarket: boolean;
  currentYear: number;
}

export async function generateStateContent(
  input: StateContentInput
): Promise<StateGeneratedContent> {
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    console.warn("GEMINI_API_KEY not set, using fallback state content");
    return getFallbackStateContent(input);
  }

  const targetKeyword = `Solar panels in ${input.stateName}`;
  const ratePerKwh = `$${input.electricityRate.toFixed(2)}/kWh`;
  const pricePerWatt = `$${input.pricePerWatt.toFixed(2)}/W`;

  const prompt = `You are an SEO content writer for a solar savings calculator. Generate content for a ${input.stateName} state landing page.

STRICT FACTUAL DATA (use these exact numbers, do not invent others):
- Keyword: "${targetKeyword}"
- State: ${input.stateName} (${input.stateId})
- Average Peak Sun Hours: ${input.avgSunHours.toFixed(1)} hours/day
- Solar Climate Rating: ${input.solarClimate}
- Average Residential Electricity Rate: ${ratePerKwh}
- Average Installed Cost: ${pricePerWatt}
- Net Metering Status: ${input.netMeteringLabel}
- State Incentive Available: ${input.hasStateIncentive ? "Yes" : "No"}${input.stateIncentiveNote ? ` (${input.stateIncentiveNote})` : ""}
- SREC Market: ${input.hasSrecMarket ? "Yes" : "No"}
- Cities covered: ${input.cityCount}

OUTPUT REQUIREMENTS (JSON ONLY):
1. title: SEO title starting with "${targetKeyword}" and ending with "| SunScore"
2. meta_description: 150-160 char description mentioning the sun hours and electricity rate. Click-worthy but factual.
3. h1: Exact keyword "${targetKeyword}"
4. intro_content: ONE HTML paragraph (<p> tag only, 50-70 words). Hook the user with ${input.stateName}'s specific solar economics using the exact numbers above. No tax credit mentions. No hyperbole.
5. overview_content: TWO HTML sections each with an <h3> header followed by a <p>. First section covers ${input.stateName}'s solar climate and production potential. Second section covers the financial picture (electricity rates, install cost, net metering policy). Use the exact data above. Weave in the net metering status naturally. 80-120 words per paragraph. No mentions of federal ITC or tax credits.

Return ONLY valid JSON with no markdown code fences.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1500,
            responseMimeType: "application/json",
          },
        }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Gemini state API error: ${response.status}`);
      return getFallbackStateContent(input);
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("No text in Gemini state response");
      return getFallbackStateContent(input);
    }

    return parseAndValidateStateContent(text, input);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("Gemini state API request timed out");
    } else {
      console.error("Gemini state API error:", error);
    }
    return getFallbackStateContent(input);
  }
}

function parseAndValidateStateContent(
  text: string,
  input: StateContentInput
): StateGeneratedContent {
  try {
    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) cleanText = cleanText.slice(7);
    if (cleanText.startsWith("```")) cleanText = cleanText.slice(3);
    if (cleanText.endsWith("```")) cleanText = cleanText.slice(0, -3);
    cleanText = cleanText.trim();

    let parsed = JSON.parse(cleanText);
    if (Array.isArray(parsed) && parsed.length > 0) parsed = parsed[0];

    const required = ["title", "meta_description", "h1", "intro_content", "overview_content"];
    const missing = required.filter((f) => !parsed[f]);
    if (missing.length > 0) {
      console.warn(`Missing state fields from Gemini: ${missing.join(", ")}`);
      return getFallbackStateContent(input);
    }

    const targetKeyword = `Solar panels in ${input.stateName}`;
    if (parsed.h1 !== targetKeyword) parsed.h1 = targetKeyword;
    if (!parsed.title.toLowerCase().startsWith(targetKeyword.toLowerCase())) {
      parsed.title = `${targetKeyword} ${input.currentYear} | SunScore`;
    }

    return parsed;
  } catch (parseError) {
    console.error("Failed to parse Gemini state JSON:", parseError);
    return getFallbackStateContent(input);
  }
}

function getFallbackStateContent(input: StateContentInput): StateGeneratedContent {
  const targetKeyword = `Solar panels in ${input.stateName}`;
  const ratePerKwh = `$${input.electricityRate.toFixed(2)}`;
  const pricePerWatt = `$${input.pricePerWatt.toFixed(2)}`;
  const climateDescriptor =
    input.solarClimate === "excellent"
      ? "some of the best solar conditions in the country"
      : input.solarClimate === "strong"
      ? "strong solar production potential"
      : input.solarClimate === "good"
      ? "solid solar production potential"
      : "moderate but workable solar conditions";

  return {
    title: `${targetKeyword} ${input.currentYear} - Costs, Savings & Incentives | SunScore`,
    meta_description: `Compare solar savings across ${input.stateName}. ${input.avgSunHours.toFixed(1)} peak sun hours, ${ratePerKwh}/kWh electricity rates, and ${pricePerWatt}/W install costs. Free calculator for ${input.cityCount} cities.`,
    h1: targetKeyword,
    intro_content: `<p>${input.stateName} offers ${climateDescriptor}, averaging <strong>${input.avgSunHours.toFixed(1)} peak sun hours</strong> per day. With residential electricity rates around <strong>${ratePerKwh}/kWh</strong> and installed solar costs near <strong>${pricePerWatt}/W</strong>, homeowners across ${input.stateName} are using their rooftops to lock in predictable energy costs for decades.</p>`,
    overview_content: `<h3>Solar Production Potential in ${input.stateName}</h3>
<p>With ${input.avgSunHours.toFixed(1)} peak sun hours per day on average, ${input.stateName} has ${climateDescriptor}. A typical residential system produces enough electricity to offset a meaningful portion of the average household's usage&mdash;and in many ${input.stateName} cities, full offset is achievable with a properly sized installation. Actual production varies by roof orientation, shading, and local microclimate, which is why our calculator pulls location-specific data from NREL for every address.</p>
<h3>The Financial Picture: Rates, Costs &amp; Policy</h3>
<p>${input.stateName} residents pay an average of ${ratePerKwh}/kWh for electricity, and installed solar costs average ${pricePerWatt}/W before incentives. The state operates under <strong>${input.netMeteringLabel}</strong>, which directly affects how much value you capture from excess generation.${input.hasStateIncentive && input.stateIncentiveNote ? ` ${input.stateName} also offers additional state-level support: ${input.stateIncentiveNote}` : ""}${input.hasSrecMarket ? ` ${input.stateName} has an active SREC market, which can provide ongoing payments on top of energy savings.` : ""} Use the city calculators below to see a personalized 25-year projection for your address.</p>`,
  };
}

const stateContentCache = new Map<string, { content: StateGeneratedContent; timestamp: number }>();

export async function getStateContentWithCache(
  input: StateContentInput
): Promise<StateGeneratedContent> {
  const cacheKey = `${input.stateId}-${input.currentYear}`;
  const cached = stateContentCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.content;
  }

  const content = await generateStateContent(input);

  stateContentCache.set(cacheKey, {
    content,
    timestamp: Date.now(),
  });

  return content;
}

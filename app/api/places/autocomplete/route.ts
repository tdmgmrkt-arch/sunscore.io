import { NextRequest, NextResponse } from "next/server";

// Places API (New) endpoint
const PLACES_API_URL = "https://places.googleapis.com/v1/places:autocomplete";

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();

    if (!input || input.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

    if (!API_KEY) {
      console.error("GOOGLE_PLACES_API_KEY not set");
      return NextResponse.json(
        { error: "Places API not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(PLACES_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
      },
      body: JSON.stringify({
        input,
        includedRegionCodes: ["us"],
        includedPrimaryTypes: ["street_address", "premise", "subpremise"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Places API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to fetch suggestions" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform the response to a simpler format
    const suggestions = (data.suggestions || []).map((suggestion: any) => ({
      placeId: suggestion.placePrediction?.placeId,
      description: suggestion.placePrediction?.text?.text,
      mainText: suggestion.placePrediction?.structuredFormat?.mainText?.text,
      secondaryText: suggestion.placePrediction?.structuredFormat?.secondaryText?.text,
    })).filter((s: any) => s.placeId && s.description);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Places autocomplete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

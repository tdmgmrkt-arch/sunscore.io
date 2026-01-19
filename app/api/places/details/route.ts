import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get("placeId");

    if (!placeId) {
      return NextResponse.json(
        { error: "placeId is required" },
        { status: 400 }
      );
    }

    const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

    if (!API_KEY) {
      console.error("GOOGLE_PLACES_API_KEY not set");
      return NextResponse.json(
        { error: "Places API not configured" },
        { status: 500 }
      );
    }

    // Places API (New) - Get Place Details
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?fields=location,formattedAddress,addressComponents`,
      {
        headers: {
          "X-Goog-Api-Key": API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Places Details API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to fetch place details" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract state from address components
    let stateId = "";
    if (data.addressComponents) {
      const stateComponent = data.addressComponents.find((c: any) =>
        c.types.includes("administrative_area_level_1")
      );
      if (stateComponent) {
        stateId = stateComponent.shortText || "";
      }
    }

    return NextResponse.json({
      lat: data.location?.latitude,
      lng: data.location?.longitude,
      formattedAddress: data.formattedAddress,
      stateId,
    });
  } catch (error) {
    console.error("Places details error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

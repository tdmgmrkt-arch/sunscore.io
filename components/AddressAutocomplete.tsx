"use client";

import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import usePlacesAutocomplete from "use-places-autocomplete";
import { MapPin, Loader2, CheckCircle2 } from "lucide-react";

// Window already has google types from @types/google.maps

interface PlaceDetails {
  lat: number;
  lng: number;
  formattedAddress: string;
  stateId: string;
}

interface AddressAutocompleteProps {
  onSelect: (address: string, details: PlaceDetails) => void;
  onChange?: (value: string) => void; // Called on every keystroke
  onError?: (message: string) => void; // Called when geocoding fails
  placeholder?: string;
  defaultValue?: string;
}

const GOOGLE_PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || "";

export default function AddressAutocomplete({
  onSelect,
  onChange,
  onError,
  placeholder = "Enter your full address (e.g., 123 Main St, Austin, TX)",
  defaultValue = "",
}: AddressAutocompleteProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1); // Tracks keyboard selection
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const attrContainerRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<(HTMLLIElement | null)[]>([]);

  // Check if Google Maps is already loaded (e.g., from another component)
  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.maps?.places) {
      setIsScriptLoaded(true);
    }
  }, []);

  // Initialize PlacesService when script loads
  useEffect(() => {
    if (isScriptLoaded && window.google?.maps?.places && !placesServiceRef.current) {
      // Create a hidden div for PlacesService (required by the API)
      if (!attrContainerRef.current) {
        attrContainerRef.current = document.createElement("div");
      }
      placesServiceRef.current = new window.google.maps.places.PlacesService(attrContainerRef.current);
    }
  }, [isScriptLoaded]);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
    init,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: "us" },
      types: ["address"],
    },
    debounce: 300,
    defaultValue,
    initOnMount: false, // Don't init until script is loaded
  });

  // Initialize the autocomplete when script loads
  useEffect(() => {
    if (isScriptLoaded) {
      init();
    }
  }, [isScriptLoaded, init]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        clearSuggestions();
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [clearSuggestions]);

  // Scroll active item into view when navigating with keyboard
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current[activeIndex]) {
      listRef.current[activeIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [activeIndex]);

  // Handle selection using Place Details API (more reliable than Geocoding API)
  const handleSelect = async (description: string, placeId: string) => {
    setValue(description, false);
    clearSuggestions();
    setIsGeocoding(true);
    setIsVerified(false);

    if (!placesServiceRef.current) {
      console.error("PlacesService not initialized");
      setIsGeocoding(false);
      onError?.("Google Maps service not ready. Please try again.");
      return;
    }

    // Use Place Details API to get geometry and address components
    placesServiceRef.current.getDetails(
      {
        placeId: placeId,
        fields: ["geometry", "address_components", "formatted_address"],
      },
      (place, status) => {
        setIsGeocoding(false);

        if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
          console.error("Place details error:", status);
          setIsVerified(false);
          onError?.("Unable to verify this address. Please try selecting a different suggestion.");
          return;
        }

        const lat = place.geometry?.location?.lat();
        const lng = place.geometry?.location?.lng();

        if (lat === undefined || lng === undefined) {
          console.error("No geometry in place details");
          setIsVerified(false);
          onError?.("Unable to get location coordinates. Please try a different address.");
          return;
        }

        // Extract state from address components
        let stateId = "";
        if (place.address_components) {
          for (const component of place.address_components) {
            if (component.types.includes("administrative_area_level_1")) {
              stateId = component.short_name;
              break;
            }
          }
        }

        setIsVerified(true);
        onSelect(description, {
          lat,
          lng,
          formattedAddress: place.formatted_address || description,
          stateId,
        });
      }
    );
  };

  // Handle Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (status !== "OK" || data.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault(); // Stop cursor from moving
      setActiveIndex((prev) => (prev < data.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) {
        const selected = data[activeIndex];
        handleSelect(selected.description, selected.place_id);
      }
    } else if (e.key === "Escape") {
      clearSuggestions();
      setActiveIndex(-1);
    }
  };

  return (
    <>
      {/* Load Google Maps Script */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=places`}
        strategy="lazyOnload"
        onLoad={() => {
          console.log("Google Maps API loaded");
          setIsScriptLoaded(true);
        }}
        onError={(e) => {
          console.error("Failed to load Google Maps API:", e);
        }}
      />

      <div ref={wrapperRef} className="relative flex-1">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setIsVerified(false); // Reset verified state when user types
              setActiveIndex(-1); // Reset keyboard selection when typing
              onChange?.(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            disabled={!ready || isGeocoding}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-3.5 bg-gray-800/80 border border-gray-700 rounded-xl text-base md:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            autoComplete="off"
          />
          {/* Loading indicator while geocoding */}
          {isGeocoding && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
            </div>
          )}
          {/* Verified checkmark after successful geocoding */}
          {isVerified && !isGeocoding && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          )}
          {/* Initial loading spinner while Places API initializes */}
          {!ready && isScriptLoaded && !isGeocoding && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
            </div>
          )}
        </div>

        {/* Suggestions dropdown */}
        {status === "OK" && data.length > 0 && (
          <ul className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
            {data.map((suggestion, index) => {
              const {
                place_id,
                structured_formatting: { main_text, secondary_text },
              } = suggestion;
              const isActive = index === activeIndex;

              return (
                <li
                  key={place_id}
                  ref={(el) => { listRef.current[index] = el; }}
                  onClick={() => handleSelect(suggestion.description, place_id)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`px-4 py-3 cursor-pointer transition-colors border-b border-gray-700/50 last:border-b-0 ${
                    isActive ? "bg-gray-700" : "hover:bg-gray-700/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      isActive ? "text-emerald-400" : "text-emerald-500"
                    }`} />
                    <div>
                      <p className={`text-sm font-medium ${isActive ? "text-white" : "text-white"}`}>{main_text}</p>
                      <p className={`text-xs ${isActive ? "text-gray-300" : "text-gray-400"}`}>{secondary_text}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}

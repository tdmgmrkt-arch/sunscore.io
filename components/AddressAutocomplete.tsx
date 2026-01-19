"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Script from "next/script";
import { MapPin, Loader2, CheckCircle2 } from "lucide-react";

interface PlaceDetails {
  lat: number;
  lng: number;
  formattedAddress: string;
  stateId: string;
}

interface AddressAutocompleteProps {
  onSelect: (address: string, details: PlaceDetails) => void;
  onChange?: (value: string) => void;
  onError?: (message: string) => void;
  placeholder?: string;
  defaultValue?: string;
}

interface Suggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
  description: string;
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
  const [isReady, setIsReady] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<(HTMLLIElement | null)[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const attrContainerRef = useRef<HTMLDivElement | null>(null);

  // Check if Google Maps is already loaded (e.g., from another component)
  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.maps?.places) {
      setIsScriptLoaded(true);
      initializeServices();
    }
  }, []);

  // Initialize services when script loads
  const initializeServices = useCallback(() => {
    if (!window.google?.maps?.places) return;

    // Create AutocompleteService for suggestions
    if (!autocompleteServiceRef.current) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
    }

    // Create PlacesService for place details (requires a DOM element)
    if (!placesServiceRef.current) {
      if (!attrContainerRef.current) {
        attrContainerRef.current = document.createElement("div");
      }
      placesServiceRef.current = new window.google.maps.places.PlacesService(attrContainerRef.current);
    }

    // Create session token for billing optimization
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
    }

    setIsReady(true);
  }, []);

  // Initialize when script loads
  useEffect(() => {
    if (isScriptLoaded) {
      initializeServices();
    }
  }, [isScriptLoaded, initializeServices]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setSuggestions([]);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll active item into view when navigating with keyboard
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current[activeIndex]) {
      listRef.current[activeIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [activeIndex]);

  // Fetch autocomplete suggestions
  const fetchSuggestions = useCallback((input: string) => {
    if (!input || input.length < 3 || !autocompleteServiceRef.current) {
      setSuggestions([]);
      return;
    }

    const request: google.maps.places.AutocompletionRequest = {
      input,
      componentRestrictions: { country: "us" },
      types: ["address"],
      sessionToken: sessionTokenRef.current ?? undefined,
    };

    autocompleteServiceRef.current.getPlacePredictions(
      request,
      (predictions, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
          setSuggestions([]);
          return;
        }

        const formattedSuggestions: Suggestion[] = predictions.map((prediction) => ({
          placeId: prediction.place_id,
          mainText: prediction.structured_formatting.main_text,
          secondaryText: prediction.structured_formatting.secondary_text,
          description: prediction.description,
        }));

        setSuggestions(formattedSuggestions);
      }
    );
  }, []);

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setIsVerified(false);
    setActiveIndex(-1);
    onChange?.(newValue);

    // Debounce the API call
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  // Handle selection - fetch place details
  const handleSelect = (suggestion: Suggestion) => {
    setValue(suggestion.description);
    setSuggestions([]);
    setIsGeocoding(true);
    setIsVerified(false);

    if (!placesServiceRef.current) {
      console.error("PlacesService not initialized");
      setIsGeocoding(false);
      onError?.("Google Maps service not ready. Please try again.");
      return;
    }

    placesServiceRef.current.getDetails(
      {
        placeId: suggestion.placeId,
        fields: ["geometry", "address_components", "formatted_address"],
        sessionToken: sessionTokenRef.current ?? undefined,
      },
      (place, status) => {
        setIsGeocoding(false);

        // Create a new session token for the next search
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();

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
        onSelect(suggestion.description, {
          lat,
          lng,
          formattedAddress: place.formatted_address || suggestion.description,
          stateId,
        });
      }
    );
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) {
        handleSelect(suggestions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setActiveIndex(-1);
    }
  };

  // Check if script needs to be loaded (not already present)
  const shouldLoadScript = !isScriptLoaded && typeof window !== "undefined" && !window.google?.maps;

  return (
    <>
      {/* Load Google Maps Script with Places library - only if not already loaded */}
      {shouldLoadScript && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=places`}
          strategy="lazyOnload"
          onLoad={() => {
            setIsScriptLoaded(true);
          }}
          onError={(e) => {
            console.error("Failed to load Google Maps API:", e);
          }}
        />
      )}

      <div ref={wrapperRef} className="relative flex-1">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={!isReady || isGeocoding}
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
          {!isReady && isScriptLoaded && !isGeocoding && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
            </div>
          )}
        </div>

        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <ul className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => {
              const isActive = index === activeIndex;

              return (
                <li
                  key={suggestion.placeId}
                  ref={(el) => { listRef.current[index] = el; }}
                  onClick={() => handleSelect(suggestion)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`px-4 py-3 cursor-pointer transition-colors border-b border-gray-700/50 last:border-b-0 ${
                    isActive ? "bg-gray-700" : "hover:bg-gray-700/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${
                      isActive ? "text-emerald-400" : "text-emerald-500"
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-white">{suggestion.mainText}</p>
                      <p className={`text-xs ${isActive ? "text-gray-300" : "text-gray-400"}`}>{suggestion.secondaryText}</p>
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

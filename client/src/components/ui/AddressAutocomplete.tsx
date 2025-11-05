import { useRef, useEffect } from "react";
import { Input } from "./input";
import { Label } from "./label";

// Type declaration for Google Maps
declare global {
  interface Window {
    google: any;
  }
}

interface AddressComponents {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface AddressAutocompleteProps {
  value: string;
  onAddressSelect: (address: AddressComponents) => void;
  onInputChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
  id?: string;
  apiKey: string;
}

export function AddressAutocomplete({
  value,
  onAddressSelect,
  onInputChange,
  placeholder = "Start typing your address...",
  label = "Street Address",
  required = false,
  className = "",
  id = "street",
  apiKey,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    // If no API key, skip initialization
    if (!apiKey || apiKey.trim() === '') {
      return;
    }

    // Load Google Places API script if not already loaded
    const loadGoogleScript = () => {
      if (typeof window === 'undefined') return;
      
      // Check if script already exists
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        initAutocomplete();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initAutocomplete;
      document.head.appendChild(script);
    };

    const initAutocomplete = () => {
      if (!inputRef.current || !window.google) return;

      // Initialize autocomplete
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: 'us' }, // Restrict to US addresses
        }
      );

      // Listen for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        
        if (!place || !place.address_components) return;

        // Extract address components
        let street = '';
        let city = '';
        let state = '';
        let zipCode = '';

        place.address_components?.forEach((component: any) => {
          const types = component.types;

          if (types.includes('street_number')) {
            street = component.long_name + ' ';
          }
          if (types.includes('route')) {
            street += component.long_name;
          }
          if (types.includes('locality')) {
            city = component.long_name;
          }
          if (types.includes('administrative_area_level_1')) {
            state = component.short_name;
          }
          if (types.includes('postal_code')) {
            zipCode = component.long_name;
          }
        });

        // Call the callback with parsed address
        onAddressSelect({
          street: street.trim(),
          city,
          state,
          zipCode,
        });
      });
    };

    loadGoogleScript();

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [apiKey, onAddressSelect]);

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id}>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <Input
        ref={inputRef}
        id={id}
        value={value}
        onChange={(e) => onInputChange?.(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={className}
        autoComplete="off"
      />
      <p className="text-xs text-gray-500">
        Start typing and select your address from the suggestions
      </p>
    </div>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/use-locale';
import React, { useEffect, useState } from 'react';

interface LocationAutocompleteComboSelectProps {
  label: string;
  id: string;
  // Selected value is the human-readable address string
  value: string;
  required?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onCoordinatesChange?: (coords: { lat: number; lng: number } | null, placeId?: string) => void;
  onBlur?: () => void;
}

const LocationAutocompleteComboSelect: React.FC<
  LocationAutocompleteComboSelectProps
> = ({
  label,
  id,
  value,
  required = false,
  hasError = false,
  errorMessage,
  placeholder,
  onChange,
  onCoordinatesChange,
  onBlur
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'components.searchbar' });
  const locale = useLocale();
  const isHebrew = locale === 'he';

  const text = {
    searchUnavailable: isHebrew ? 'חיפוש לא זמין' : 'Search unavailable',
  };
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState<Array<{ description: string; place_id: string }>>([]);
  // This state holds the description that will be displayed on the button.
  const [displayValue, setDisplayValue] = useState('');
  const [isReady, setIsReady] = useState(false);
  const googleMapsApiKey = 'AIzaSyAjx6NIRePitcFdZjH2kE0z-zSAy8etaUE';

  // Keep AutocompleteService and Geocoder instances
  const autocompleteServiceRef = React.useRef<any>(null);
  const geocoderRef = React.useRef<any>(null);

  // Geocode a place_id to get coordinates
  const geocodePlaceId = async (placeId: string): Promise<{ lat: number; lng: number } | null> => {
    if (!geocoderRef.current) {
      try {
        geocoderRef.current = new (window as any).google.maps.Geocoder();
      } catch (e) {
        console.error('Failed to init Geocoder:', e);
        return null;
      }
    }

    return new Promise((resolve) => {
      geocoderRef.current.geocode({ placeId }, (results: any[], status: string) => {
        if (status === 'OK' && results?.[0]?.geometry?.location) {
          const location = results[0].geometry.location;
          resolve({ lat: location.lat(), lng: location.lng() });
        } else {
          console.error('Geocoding failed:', status);
          resolve(null);
        }
      });
    });
  };

  // Initialize display from the provided value (address string)
  useEffect(() => {
    setDisplayValue(value || '');
  }, [value]);

  // Load Google Maps Places library in the browser
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const apiKey = googleMapsApiKey;

    if (!apiKey) {
      console.warn('❌ Google Maps API key is not configured. Client-side address search disabled.');
      return;
    }

    // Function to initialize the autocomplete service
    const initAutocomplete = () => {
      if ((window as any).google?.maps?.places && !autocompleteServiceRef.current) {
        try {
          autocompleteServiceRef.current = new (window as any).google.maps.places.AutocompleteService();
          setIsReady(true);
          console.log('✅ AutocompleteService initialized');
        } catch (e) {
          console.error('Failed to init AutocompleteService:', e);
        }
      }
    };

    // If Google Maps is already loaded, initialize immediately
    if ((window as any).google?.maps?.places) {
      initAutocomplete();
      return;
    }

    // Check if script already exists
    const existing = document.querySelector('script[data-facepet-google]') as HTMLScriptElement | null;

    if (existing) {
      // Script exists, wait for it to load
      const checkReady = setInterval(() => {
        if ((window as any).google?.maps?.places) {
          clearInterval(checkReady);
          initAutocomplete();
        }
      }, 100);

      // Clean up interval after 10 seconds
      setTimeout(() => clearInterval(checkReady), 10000);
      return;
    }

    // Create new script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=${locale}`;
    script.async = true;
    script.defer = true;
    script.setAttribute('data-facepet-google', 'true');
    script.onload = () => {
      // Wait a bit for the places library to initialize
      setTimeout(initAutocomplete, 100);
    };
    script.onerror = () => console.error('Failed to load Google Maps script');
    document.head.appendChild(script);
    console.log('✅ Loading Google Maps with key:', apiKey.substring(0, 10) + '...');
  }, [locale]);

  // Fetch predictions when the user types
  useEffect(() => {
    if (!isReady || !searchQuery) {
      setPredictions([]);
      return;
    }
    const svc = autocompleteServiceRef.current;
    if (!svc) return;

    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      svc.getPlacePredictions({ input: searchQuery, language: locale as string }, (res: any[] | null) => {
        if (cancelled) return;
        setPredictions((res || []).map((p: any) => ({ description: p.description, place_id: p.place_id })));
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [searchQuery, isReady, locale]);

  return (
    <div className="relative w-full">
      {/* Label */}
      <label
        htmlFor={id}
        className={cn(
          'absolute top-2.5 left-3 text-sm text-gray-500 transition-all duration-200 ease-in-out rtl:right-3',
          value
            ? 'text-gray-700 -top-6 text-sm font-medium'
            : 'top-2.5 text-gray-500',
          hasError ? 'text-red-800' : ''
        )}
        onBlur={onBlur}
      >
        {label}
        {required ? '*' : ''}
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            id={id}
            className={cn(
              'hover:ouline-none hover:ring-ring h-10 w-full justify-between border-gray-300 bg-white px-3 text-base hover:bg-white hover:ring-1',
              hasError ? 'border-red-800' : ''
            )}
            onClick={() => setOpen(true)}
          >
            <span className={cn(
              "overflow-x-scroll font-normal text-black",
              !displayValue && placeholder ? "text-gray-400" : ""
            )}>
              {displayValue || placeholder || ""}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput
              placeholder={t('search')}
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {predictions.length > 0 ? (
                <ScrollArea className="max-h-44 overflow-y-auto">
                  <CommandGroup>
                    {predictions.map((prediction) => (
                      <CommandItem
                        key={prediction.place_id}
                        value={prediction.description}
                        onSelect={async () => {
                          // When selected: update display and return address string
                          setDisplayValue(prediction.description);
                          onChange(prediction.description);
                          setSearchQuery('');
                          setOpen(false);

                          // Geocode the place_id to get coordinates
                          if (onCoordinatesChange && prediction.place_id) {
                            const coords = await geocodePlaceId(prediction.place_id);
                            onCoordinatesChange(coords, prediction.place_id);
                          }
                        }}
                      >
                        {prediction.description}
                        <div className="grow" />
                        <Check
                          className={cn(
                            'ml-auto',
                            prediction.description === value ? 'opacity-100' : 'opacity-0'
                          )}
                          size={16}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </ScrollArea>
              ) : (
                <CommandEmpty>{isReady ? t('noResult') : text.searchUnavailable}</CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default LocationAutocompleteComboSelect;

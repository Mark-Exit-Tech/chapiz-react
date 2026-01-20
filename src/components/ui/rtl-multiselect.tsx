'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Badge } from './badge';

interface DropdownOption {
  value: string;
  label: string;
}

interface RtlMultiselectProps {
  options: DropdownOption[];
  selectedValues: string[];
  onSelectionChange: (selectedValues: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  noOptionsText?: string;
  className?: string;
  disabled?: boolean;
}

export function RtlMultiselect({
  options,
  selectedValues,
  onSelectionChange,
  placeholder = 'Select options...',
  searchPlaceholder = 'Search...',
  noOptionsText = 'No options found.',
  className,
  disabled = false
}: RtlMultiselectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRTL, setIsRTL] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect RTL context
  useEffect(() => {
    const checkRTL = () => {
      let element = containerRef.current?.parentElement;
      while (element) {
        const dir = element.getAttribute('dir');
        if (dir === 'rtl') {
          setIsRTL(true);
          return;
        }
        if (dir === 'ltr') {
          setIsRTL(false);
          return;
        }
        element = element.parentElement;
      }
      const docDir = document.documentElement.dir || document.body.dir;
      setIsRTL(docDir === 'rtl');
    };

    checkRTL();
  }, []);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;

    const query = searchQuery.toLowerCase();
    return options.filter(option =>
      option.label.toLowerCase().includes(query) ||
      option.value.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  const selectedOptions = useMemo(() => {
    return options.filter(option => selectedValues.includes(option.value));
  }, [options, selectedValues]);

  const toggleOption = (optionValue: string) => {
    if (selectedValues.includes(optionValue)) {
      onSelectionChange(selectedValues.filter(value => value !== optionValue));
    } else {
      onSelectionChange([...selectedValues, optionValue]);
    }
  };

  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectionChange(selectedValues.filter(value => value !== optionValue));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative w-full">
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full justify-between min-h-[42px] h-auto",
          !selectedValues.length && "text-muted-foreground",
          className
        )}
        disabled={disabled}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selectedOptions.length === 0 ? (
            <span>{placeholder}</span>
          ) : (
            selectedOptions.map((option) => (
              <Badge
                key={option.value}
                variant="secondary"
                className={cn(
                  "mb-1 cursor-pointer",
                  isRTL ? "ml-1" : "mr-1"
                )}
                onClick={(e) => removeOption(option.value, e)}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {option.label}
                <span
                  role="button"
                  tabIndex={0}
                  className={cn(
                    "rounded-full hover:bg-secondary-foreground/20 inline-flex items-center justify-center p-0.5",
                    isRTL ? "mr-1" : "ml-1"
                  )}
                  onClick={(e) => removeOption(option.value, e)}
                  onMouseDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      removeOption(option.value, e as any);
                    }
                  }}
                >
                  <X className="h-3 w-3" />
                </span>
              </Badge>
            ))
          )}
        </div>
        <ChevronsUpDown className={cn("h-4 w-4 shrink-0 opacity-50", isRTL ? "mr-2" : "ml-2")} />
      </Button>

      {open && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute z-50 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md animate-in fade-in-0 zoom-in-95",
            isRTL ? "left-0" : "right-0"
          )}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="p-2">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {noOptionsText}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <div
                    key={option.value}
                    onClick={() => toggleOption(option.value)}
                    className={cn(
                      "relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                      "select-none transition-colors"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        isRTL ? "ml-2" : "mr-2",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="flex-1">{option.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

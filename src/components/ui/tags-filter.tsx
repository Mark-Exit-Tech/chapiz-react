'use client';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale } from '@/hooks/use-locale';
import React, { useState } from 'react';

interface TagsFilterProps {
  tags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  clearAllText?: string;
  searchTagsPlaceholder?: string;
  tagsSelectedText?: string;
  tagsSelectedPluralText?: string;
  selectedText?: string;
  noTagsFoundText?: string;
  className?: string;
  translateTag?: (tag: string) => string; // Function to translate tags for display
  dir?: 'ltr' | 'rtl'; // Explicit direction override
}

export function TagsFilter({
  tags,
  selectedTags,
  onTagsChange,
  placeholder = "Filter by tags...",
  clearAllText = "Clear all",
  searchTagsPlaceholder = "Search tags...",
  tagsSelectedText = "{count} tag selected",
  tagsSelectedPluralText = "{count} tags selected",
  selectedText = "Selected",
  noTagsFoundText = "No tags found.",
  className,
  translateTag,
  dir
}: TagsFilterProps) {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  // Use explicit dir prop if provided, otherwise detect from locale
  const isRTL = dir ? dir === 'rtl' : (locale === 'he' || locale?.startsWith('he'));

  // Helper function to get display text for a tag
  const getTagDisplay = (tag: string) => {
    return translateTag ? translateTag(tag) : tag;
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    onTagsChange(selectedTags.filter(t => t !== tag));
  };

  const clearAllTags = () => {
    onTagsChange([]);
  };

  return (
    <div className={cn('space-y-2', className)} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Tags dropdown */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", isRTL ? "flex-row-reverse text-right" : "text-left")}
            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
          >
            <span className="truncate">{placeholder}</span>
            <ChevronsUpDown className={cn("h-4 w-4 shrink-0 opacity-50", isRTL ? "ltr:ml-2 rtl:mr-2" : "ml-2")} />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[300px] p-0"
          align={isRTL ? "end" : "start"}
          side="bottom"
          sideOffset={4}
          avoidCollisions={true}
          collisionPadding={16}
          dir={isRTL ? 'rtl' : 'ltr'}
          style={{ direction: isRTL ? 'rtl' : 'ltr' }}
        >
          <Command dir={isRTL ? 'rtl' : 'ltr'}>
            <CommandInput placeholder={searchTagsPlaceholder} className={isRTL ? "text-right" : "text-left"} />
            <CommandList className="max-h-[300px] overflow-y-auto">
              <CommandEmpty>{noTagsFoundText}</CommandEmpty>
              {selectedTags.length > 0 && (
                <CommandGroup>
                  <CommandItem
                    onSelect={clearAllTags}
                    className={cn("flex items-center text-muted-foreground hover:text-foreground cursor-pointer", isRTL ? "flex-row-reverse justify-center" : "justify-center")}
                  >
                    <X className={cn("h-4 w-4", isRTL ? "ltr:mr-2 rtl:ml-2" : "mr-2")} />
                    {clearAllText}
                  </CommandItem>
                </CommandGroup>
              )}
              <CommandGroup>
                {tags.map((tag) => (
                  <CommandItem
                    key={tag}
                    value={translateTag ? getTagDisplay(tag) : tag}
                    onSelect={() => handleTagToggle(tag)}
                    className={cn("flex items-center cursor-pointer", isRTL ? "flex-row-reverse" : "")}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isRTL ? "ltr:mr-2 rtl:ml-2" : "mr-2",
                        selectedTags.includes(tag) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className={isRTL ? "text-right" : "text-left"}>{getTagDisplay(tag)}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

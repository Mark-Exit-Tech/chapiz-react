'use client';

import { useState, useEffect, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RtlMultiselect } from '@/components/ui/rtl-multiselect';
import { getPetTypesForDropdown } from '@/lib/firebase/database/pets';
import { getLocalizedBreedsForType, breedsByType, type PetType } from '@/lib/data/breeds';

export interface PetFiltersBlockText {
  petType: string;
  petTypePlaceholder: string;
  otherSpecify: string;
  breed: string;
  breedPlaceholder: string;
  search: string;
  noOptions: string;
  selectPetTypeFirst: string;
}

export interface PetFiltersBlockProps {
  locale: 'en' | 'he';
  selectedPetTypes: string[];
  onPetTypesChange: (values: string[]) => void;
  selectedBreeds: string[];
  onBreedsChange: (values: string[]) => void;
  petTypeOther?: string;
  onPetTypeOtherChange?: (value: string) => void;
  text: PetFiltersBlockText;
}

/** Reusable pet type + breed block using the same breed data as Add Pet (lib/data/breeds). */
export function PetFiltersBlock({
  locale,
  selectedPetTypes,
  onPetTypesChange,
  selectedBreeds,
  onBreedsChange,
  petTypeOther = '',
  onPetTypeOtherChange,
  text
}: PetFiltersBlockProps) {
  const [petTypes, setPetTypes] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    getPetTypesForDropdown(locale).then(setPetTypes);
  }, [locale]);

  const breedOptions = useMemo(() => {
    const types = selectedPetTypes.filter((t): t is PetType => t !== 'other' && t in breedsByType);
    if (types.length === 0) return [];
    const merged: Array<{ value: string; label: string }> = [];
    const seen = new Set<string>();
    for (const petType of types) {
      const list = getLocalizedBreedsForType(petType as PetType, locale);
      for (const b of list) {
        if (!seen.has(b.id)) {
          seen.add(b.id);
          merged.push({ value: b.id, label: b.name });
        }
      }
    }
    return merged;
  }, [selectedPetTypes, locale]);

  const showBreedSelector = selectedPetTypes.some(t => t && t !== 'other');

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>{text.petType}</Label>
        <RtlMultiselect
          options={petTypes}
          selectedValues={selectedPetTypes}
          onSelectionChange={(values) => {
            onPetTypesChange(values);
            if (!values.includes('other')) {
              onPetTypeOtherChange?.('');
            }
            if (!values.some(t => t && t !== 'other')) {
              onBreedsChange([]);
            }
          }}
          placeholder={text.petTypePlaceholder}
          searchPlaceholder={text.search}
          noOptionsText={text.noOptions}
        />
        {selectedPetTypes.includes('other') && onPetTypeOtherChange && (
          <Input
            value={petTypeOther}
            onChange={(e) => onPetTypeOtherChange(e.target.value)}
            placeholder={text.otherSpecify}
            className="mt-2"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label>{text.breed}</Label>
        {showBreedSelector ? (
          <RtlMultiselect
            options={breedOptions}
            selectedValues={selectedBreeds}
            onSelectionChange={onBreedsChange}
            placeholder={text.breedPlaceholder}
            searchPlaceholder={text.search}
            noOptionsText={text.noOptions}
          />
        ) : (
          <div className="flex h-9 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
            {selectedPetTypes.length === 0 ? text.petTypePlaceholder : text.selectPetTypeFirst}
          </div>
        )}
      </div>
    </div>
  );
}

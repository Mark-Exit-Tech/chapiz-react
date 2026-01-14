// Comprehensive breed data imported from breeds.json
import breedsData from '../../../breeds.json';

export interface Breed {
  id: number;
  type?: string;
  en: string;
  he: string;
}

export interface BreedByType {
  dog: Breed[];
  cat: Breed[];
  other: Breed[];
}

// Separate breeds by type field from breeds.json
export const breedsByType: BreedByType = {
  dog: breedsData.filter(breed => breed.type === 'dog'),
  cat: breedsData.filter(breed => breed.type === 'cat'),
  other: [{ id: 0, type: 'other', en: 'Other', he: 'אחר' }]
};

// Helper function to get breeds for a specific pet type
export function getBreedsForType(petType: 'dog' | 'cat' | 'other'): Breed[] {
  return breedsByType[petType] || breedsByType.other;
}

// Helper function to get breed by ID
export function getBreedById(id: number): Breed | undefined {
  return breedsData.find(breed => breed.id === id);
}

// Helper function to get breed by name (case insensitive)
export function getBreedByName(name: string, language: 'en' | 'he' = 'en'): Breed | undefined {
  const field = language === 'he' ? 'he' : 'en';
  return breedsData.find(breed => 
    breed[field].toLowerCase() === name.toLowerCase()
  );
}

// Get all breeds
export function getAllBreeds(): Breed[] {
  return breedsData;
}

// Export the raw data for direct access
export { breedsData };

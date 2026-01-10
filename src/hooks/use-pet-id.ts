import { useState, useEffect } from 'react';

const PET_ID_KEY = 'chapiz_pet_id';

export const savePetId = (id: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PET_ID_KEY, id);
  }
};

export const getSavedPetId = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(PET_ID_KEY);
  }
  return null;
};

export const clearSavedPetId = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PET_ID_KEY);
  }
};

export function usePetId() {
  const [petId, setPetId] = useState<string | null>(getSavedPetId());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sync with localStorage
    setPetId(getSavedPetId());
  }, []);

  const clearPetId = () => {
    clearSavedPetId();
    setPetId(null);
  };

  return {
    petId,
    loading,
    clearPetId
  };
}
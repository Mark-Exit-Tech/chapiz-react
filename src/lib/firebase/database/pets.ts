import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../client';

export interface Pet {
    id: string;
    name: string;
    description?: string;
    imageUrl: string;
    genderId: number;
    breedId: number;
    birthDate?: string;
    notes?: string;
    userEmail: string;
    ownerId?: string;
    vetId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Breed {
    id: number;
    en: string;
    he: string;
}

export interface Gender {
    id: number;
    en: string;
    he: string;
}

export interface PetType {
    id: number;
    en: string;
    he: string;
}

const PETS_COLLECTION = 'pets';
const BREEDS_COLLECTION = 'breeds';
const GENDERS_COLLECTION = 'genders';
const PET_TYPES_COLLECTION = 'petTypes';

// Get all breeds
export async function getAllBreeds(): Promise<Breed[]> {
    try {
        const breedsRef = collection(db, BREEDS_COLLECTION);
        const q = query(breedsRef, orderBy('en', 'asc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() } as Breed));
    } catch (error) {
        console.error('Error fetching breeds:', error);
        return [];
    }
}

// Get all genders
export async function getAllGenders(): Promise<Gender[]> {
    try {
        const gendersRef = collection(db, GENDERS_COLLECTION);
        const q = query(gendersRef, orderBy('id', 'asc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() } as Gender));
    } catch (error) {
        console.error('Error fetching genders:', error);
        return [];
    }
}

// Get all pet types
export async function getAllPetTypes(): Promise<PetType[]> {
    try {
        const petTypesRef = collection(db, PET_TYPES_COLLECTION);
        const q = query(petTypesRef, orderBy('id', 'asc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() } as PetType));
    } catch (error) {
        console.error('Error fetching pet types:', error);
        return [];
    }
}

// Get pets by user email
export async function getPetsByUserEmail(email: string): Promise<Pet[]> {
    try {
        const petsRef = collection(db, PETS_COLLECTION);
        const q = query(petsRef, where('userEmail', '==', email), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pet));
    } catch (error) {
        console.error('Error fetching pets:', error);
        return [];
    }
}

// Get pet by ID
export async function getPetById(id: string): Promise<Pet | null>;
export async function getPetById(id: string, withResult: true): Promise<{ success: boolean; pet?: Pet; error?: string }>;
export async function getPetById(id: string, withResult?: true): Promise<Pet | null | { success: boolean; pet?: Pet; error?: string }> {
    try {
        const petRef = doc(db, PETS_COLLECTION, id);
        const petDoc = await getDoc(petRef);
        
        if (!petDoc.exists()) {
            if (withResult) {
                return { success: false, error: 'Pet not found' };
            }
            return null;
        }
        
        const pet = { id: petDoc.id, ...petDoc.data() } as Pet;
        
        if (withResult) {
            return { success: true, pet };
        }
        return pet;
    } catch (error) {
        console.error('Error fetching pet:', error);
        if (withResult) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
        return null;
    }
}

// Create pet
export async function createPetInFirestore(petData: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pet | null> {
    try {
        const petsRef = collection(db, PETS_COLLECTION);
        const newPetRef = doc(petsRef);
        const now = new Date();
        
        const pet: Pet = {
            id: newPetRef.id,
            ...petData,
            createdAt: now,
            updatedAt: now
        };
        
        await setDoc(newPetRef, pet);
        return pet;
    } catch (error) {
        console.error('Error creating pet:', error);
        return null;
    }
}

// Update pet
export async function updatePetInFirestore(id: string, updates: Partial<Pet>): Promise<Pet | null> {
    try {
        const petRef = doc(db, PETS_COLLECTION, id);
        await updateDoc(petRef, {
            ...updates,
            updatedAt: new Date()
        });
        
        const updatedDoc = await getDoc(petRef);
        if (!updatedDoc.exists()) return null;
        
        return { id: updatedDoc.id, ...updatedDoc.data() } as Pet;
    } catch (error) {
        console.error('Error updating pet:', error);
        return null;
    }
}

// Delete pet
export async function deletePet(id: string): Promise<boolean> {
    try {
        const petRef = doc(db, PETS_COLLECTION, id);
        await deleteDoc(petRef);
        return true;
    } catch (error) {
        console.error('Error deleting pet:', error);
        return false;
    }
}

// Get breed name by ID
export async function getBreedNameById(id: number, locale: 'en' | 'he' = 'en'): Promise<string> {
    try {
        const breedRef = doc(db, BREEDS_COLLECTION, id.toString());
        const breedDoc = await getDoc(breedRef);
        
        if (!breedDoc.exists()) return 'Unknown Breed';
        
        const breed = breedDoc.data() as Breed;
        return locale === 'he' ? breed.he : breed.en;
    } catch (error) {
        console.error('Error fetching breed name:', error);
        return 'Unknown Breed';
    }
}

// Helper function to get dropdown data
export async function getBreedsForDropdown(): Promise<Breed[]> {
    return getAllBreeds();
}

export async function getGendersForDropdown(): Promise<Gender[]> {
    return getAllGenders();
}

export async function getPetTypesForDropdown(): Promise<PetType[]> {
    return getAllPetTypes();
}

// Get pet with consolidated owner
export async function getPetWithConsolidatedOwner(petId: string) {
    try {
        const result = await getPetById(petId, true);
        return result;
    } catch (error) {
        console.error('Error in getPetWithConsolidatedOwner:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

// Stub functions for compatibility
export async function getAreasForDropdown(): Promise<string[]> {
    return [];
}

export async function getCitiesForDropdown(): Promise<string[]> {
    return [];
}

export async function getAgeRangesForDropdown(): Promise<string[]> {
    return [];
}

export async function getWeightRangesForDropdown(): Promise<string[]> {
    return [];
}

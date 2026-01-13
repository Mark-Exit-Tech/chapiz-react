import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../client';

export interface Pet {
    id: string;
    name: string;
    description?: string;
    imageUrl: string;
    genderId: number;
    breedId: number;
    breedName?: string; // Compatibility field
    breed?: string; // Compatibility field
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
export async function createPetInFirestore(petData: any): Promise<{ success: boolean; petId?: string; error?: string }> {
    try {
        const petsRef = collection(db, PETS_COLLECTION);
        const newPetRef = doc(petsRef);
        const now = new Date();
        
        const pet = {
            ...petData,
            createdAt: now,
            updatedAt: now
        };
        
        await setDoc(newPetRef, pet);
        return { success: true, petId: newPetRef.id };
    } catch (error) {
        console.error('Error creating pet:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

// Update pet
export async function updatePetInFirestore(id: string, updates: any): Promise<{ success: boolean; pet?: Pet; error?: string }> {
    try {
        const petRef = doc(db, PETS_COLLECTION, id);
        await updateDoc(petRef, {
            ...updates,
            updatedAt: new Date()
        });
        
        const updatedDoc = await getDoc(petRef);
        if (!updatedDoc.exists()) {
            return { success: false, error: 'Pet not found after update' };
        }
        
        const pet = { id: updatedDoc.id, ...updatedDoc.data() } as Pet;
        return { success: true, pet };
    } catch (error) {
        console.error('Error updating pet:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
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

// Delete pet (alias for admin compatibility)
export async function deletePetFromFirestore(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const result = await deletePet(id);
        return { success: result, error: result ? undefined : 'Failed to delete pet' };
    } catch (error) {
        console.error('Error deleting pet:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

// Get all pets (admin function)
export async function getAllPets(): Promise<Pet[]> {
    try {
        const petsRef = collection(db, PETS_COLLECTION);
        const q = query(petsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now())
            } as Pet;
        });
    } catch (error) {
        console.error('Error fetching all pets:', error);
        return [];
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
export async function getBreedsForDropdown(locale: 'en' | 'he' = 'en'): Promise<{ value: string; label: string; }[]> {
    const breeds = await getAllBreeds();
    
    if (breeds.length === 0) {
        // Fallback data if collection is empty (common dog breeds)
        console.warn('Breeds collection is empty, using fallback data');
        return locale === 'he'
            ? [
                { value: '1', label: 'מעורב' },
                { value: '2', label: 'גולדן רטריבר' },
                { value: '3', label: 'לברדור' },
                { value: '4', label: 'פודל' },
                { value: '5', label: 'שיצו' },
                { value: '6', label: 'פאג' },
                { value: '7', label: 'ביגל' },
                { value: '8', label: 'רועה גרמני' },
                { value: '9', label: 'אחר' }
              ]
            : [
                { value: '1', label: 'Mixed' },
                { value: '2', label: 'Golden Retriever' },
                { value: '3', label: 'Labrador' },
                { value: '4', label: 'Poodle' },
                { value: '5', label: 'Shih Tzu' },
                { value: '6', label: 'Pug' },
                { value: '7', label: 'Beagle' },
                { value: '8', label: 'German Shepherd' },
                { value: '9', label: 'Other' }
              ];
    }
    
    return breeds.map(breed => ({
        value: breed.id.toString(),
        label: locale === 'he' ? breed.he : breed.en
    }));
}

export async function getGendersForDropdown(locale: 'en' | 'he' = 'en'): Promise<{ value: string; label: string; }[]> {
    const genders = await getAllGenders();
    return genders.map(gender => ({
        value: gender.id.toString(),
        label: locale === 'he' ? gender.he : gender.en
    }));
}

export async function getPetTypesForDropdown(locale: 'en' | 'he' = 'en'): Promise<{ value: string; label: string; }[]> {
    const petTypes = await getAllPetTypes();
    
    if (petTypes.length === 0) {
        // Fallback data if collection is empty
        console.warn('Pet types collection is empty, using fallback data');
        return locale === 'he'
            ? [
                { value: '1', label: 'כלב' },
                { value: '2', label: 'חתול' },
                { value: '3', label: 'ציפור' },
                { value: '4', label: 'ארנב' },
                { value: '5', label: 'אחר' }
              ]
            : [
                { value: '1', label: 'Dog' },
                { value: '2', label: 'Cat' },
                { value: '3', label: 'Bird' },
                { value: '4', label: 'Rabbit' },
                { value: '5', label: 'Other' }
              ];
    }
    
    return petTypes.map(petType => ({
        value: petType.id.toString(),
        label: locale === 'he' ? petType.he : petType.en
    }));
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

// Get areas for dropdown
export async function getAreasForDropdown(locale: 'en' | 'he' = 'en'): Promise<{ value: string; label: string; }[]> {
    try {
        const areasRef = collection(db, 'areas');
        const snapshot = await getDocs(areasRef);
        
        if (snapshot.empty) {
            // Fallback data if collection is empty
            console.warn('Areas collection is empty, using fallback data');
            return locale === 'he' 
                ? [
                    { value: 'north', label: 'צפון' },
                    { value: 'center', label: 'מרכז' },
                    { value: 'south', label: 'דרום' },
                    { value: 'jerusalem', label: 'ירושלים והסביבה' }
                  ]
                : [
                    { value: 'north', label: 'North' },
                    { value: 'center', label: 'Center' },
                    { value: 'south', label: 'South' },
                    { value: 'jerusalem', label: 'Jerusalem Area' }
                  ];
        }
        
        return snapshot.docs.map(doc => {
            const data = doc.data();
            const label = locale === 'he' ? (data.nameHe || data.name_he || data.name) : (data.nameEn || data.name_en || data.name);
            return {
                value: doc.id,
                label: label || doc.id
            };
        }).sort((a, b) => a.label.localeCompare(b.label));
    } catch (error) {
        console.error('Error fetching areas:', error);
        return [];
    }
}

// Get cities for dropdown
export async function getCitiesForDropdown(locale: 'en' | 'he' = 'en'): Promise<{ value: string; label: string; }[]> {
    try {
        const citiesRef = collection(db, 'cities');
        const snapshot = await getDocs(citiesRef);
        
        if (snapshot.empty) {
            // Fallback data if collection is empty
            console.warn('Cities collection is empty, using fallback data');
            return locale === 'he'
                ? [
                    { value: 'tel-aviv', label: 'תל אביב' },
                    { value: 'jerusalem', label: 'ירושלים' },
                    { value: 'haifa', label: 'חיפה' },
                    { value: 'rishon', label: 'ראשון לציון' },
                    { value: 'petah-tikva', label: 'פתח תקווה' },
                    { value: 'ashdod', label: 'אשדוד' },
                    { value: 'netanya', label: 'נתניה' },
                    { value: 'beer-sheva', label: 'באר שבע' }
                  ]
                : [
                    { value: 'tel-aviv', label: 'Tel Aviv' },
                    { value: 'jerusalem', label: 'Jerusalem' },
                    { value: 'haifa', label: 'Haifa' },
                    { value: 'rishon', label: 'Rishon LeZion' },
                    { value: 'petah-tikva', label: 'Petah Tikva' },
                    { value: 'ashdod', label: 'Ashdod' },
                    { value: 'netanya', label: 'Netanya' },
                    { value: 'beer-sheva', label: 'Beer Sheva' }
                  ];
        }
        
        return snapshot.docs.map(doc => {
            const data = doc.data();
            const label = locale === 'he' ? (data.nameHe || data.name_he || data.name) : (data.nameEn || data.name_en || data.name);
            return {
                value: doc.id,
                label: label || doc.id
            };
        }).sort((a, b) => a.label.localeCompare(b.label));
    } catch (error) {
        console.error('Error fetching cities:', error);
        return [];
    }
}

// Get age ranges for dropdown
export async function getAgeRangesForDropdown(locale: 'en' | 'he' = 'en'): Promise<{ value: string; label: string; }[]> {
    try {
        const ageRangesRef = collection(db, 'ageRanges');
        const snapshot = await getDocs(ageRangesRef);
        
        if (snapshot.empty) {
            // Fallback data if collection is empty
            console.warn('Age ranges collection is empty, using fallback data');
            return locale === 'he'
                ? [
                    { value: 'puppy', label: 'גור (0-1 שנים)' },
                    { value: 'young', label: 'צעיר (1-3 שנים)' },
                    { value: 'adult', label: 'בוגר (3-7 שנים)' },
                    { value: 'senior', label: 'מבוגר (7+ שנים)' }
                  ]
                : [
                    { value: 'puppy', label: 'Puppy (0-1 years)' },
                    { value: 'young', label: 'Young (1-3 years)' },
                    { value: 'adult', label: 'Adult (3-7 years)' },
                    { value: 'senior', label: 'Senior (7+ years)' }
                  ];
        }
        
        return snapshot.docs.map(doc => {
            const data = doc.data();
            const label = locale === 'he' ? (data.nameHe || data.name_he || data.name) : (data.nameEn || data.name_en || data.name);
            return {
                value: doc.id,
                label: label || doc.id
            };
        });
    } catch (error) {
        console.error('Error fetching age ranges:', error);
        return [];
    }
}

// Get weight ranges for dropdown
export async function getWeightRangesForDropdown(locale: 'en' | 'he' = 'en'): Promise<{ value: string; label: string; }[]> {
    try {
        const weightRangesRef = collection(db, 'weightRanges');
        const snapshot = await getDocs(weightRangesRef);
        
        if (snapshot.empty) {
            // Fallback data if collection is empty
            console.warn('Weight ranges collection is empty, using fallback data');
            return locale === 'he'
                ? [
                    { value: 'small', label: 'קטן (0-10 ק"ג)' },
                    { value: 'medium', label: 'בינוני (10-25 ק"ג)' },
                    { value: 'large', label: 'גדול (25-45 ק"ג)' },
                    { value: 'giant', label: 'ענק (45+ ק"ג)' }
                  ]
                : [
                    { value: 'small', label: 'Small (0-10 kg)' },
                    { value: 'medium', label: 'Medium (10-25 kg)' },
                    { value: 'large', label: 'Large (25-45 kg)' },
                    { value: 'giant', label: 'Giant (45+ kg)' }
                  ];
        }
        
        return snapshot.docs.map(doc => {
            const data = doc.data();
            const label = locale === 'he' ? (data.nameHe || data.name_he || data.name) : (data.nameEn || data.name_en || data.name);
            return {
                value: doc.id,
                label: label || doc.id
            };
        });
    } catch (error) {
        console.error('Error fetching weight ranges:', error);
        return [];
    }
}

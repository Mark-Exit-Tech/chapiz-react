import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../client';

export interface Filter {
    id: string;
    name: string;
    type: 'petType' | 'breed' | 'age' | 'area' | 'city' | 'gender';
    values: string[];
    createdAt: Date;
    updatedAt: Date;
}

const FILTERS_COLLECTION = 'filters';

// Get all filters
export async function getAllFilters(): Promise<Filter[]> {
    try {
        const filtersRef = collection(db, FILTERS_COLLECTION);
        const q = query(filtersRef, orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Filter));
    } catch (error) {
        console.error('Error fetching filters:', error);
        return [];
    }
}

// Get filter by ID
export async function getFilterById(id: string): Promise<Filter | null> {
    try {
        const filterRef = doc(db, FILTERS_COLLECTION, id);
        const filterDoc = await getDoc(filterRef);
        
        if (!filterDoc.exists()) {
            return null;
        }
        
        return { id: filterDoc.id, ...filterDoc.data() } as Filter;
    } catch (error) {
        console.error('Error fetching filter:', error);
        return null;
    }
}

// Create filter
export async function createFilter(filterData: Omit<Filter, 'id' | 'createdAt' | 'updatedAt'>): Promise<Filter | null> {
    try {
        const filtersRef = collection(db, FILTERS_COLLECTION);
        const newFilterRef = doc(filtersRef);
        const now = new Date();
        
        const filter: Filter = {
            id: newFilterRef.id,
            ...filterData,
            createdAt: now,
            updatedAt: now
        };
        
        await setDoc(newFilterRef, filter);
        return filter;
    } catch (error) {
        console.error('Error creating filter:', error);
        return null;
    }
}

// Update filter
export async function updateFilter(id: string, updates: Partial<Filter>): Promise<Filter | null> {
    try {
        const filterRef = doc(db, FILTERS_COLLECTION, id);
        await updateDoc(filterRef, {
            ...updates,
            updatedAt: new Date()
        });
        
        const updatedDoc = await getDoc(filterRef);
        if (!updatedDoc.exists()) return null;
        
        return { id: updatedDoc.id, ...updatedDoc.data() } as Filter;
    } catch (error) {
        console.error('Error updating filter:', error);
        return null;
    }
}

// Delete filter
export async function deleteFilter(id: string): Promise<boolean> {
    try {
        const filterRef = doc(db, FILTERS_COLLECTION, id);
        await deleteDoc(filterRef);
        return true;
    } catch (error) {
        console.error('Error deleting filter:', error);
        return false;
    }
}

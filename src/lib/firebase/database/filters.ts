import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../client';

export interface Filter {
    id: string;
    name: string;
    type?: 'petType' | 'breed' | 'age' | 'area' | 'city' | 'gender'; // Optional for flexibility
    values?: string[]; // Optional for flexibility
    audienceIds: string[]; // Required to match promo.ts
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
}

const FILTERS_COLLECTION = 'filters';

// Get all filters
export async function getAllFilters(): Promise<Filter[]> {
    try {
        const filtersRef = collection(db, FILTERS_COLLECTION);
        const q = query(filtersRef, orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name || '',
                type: data.type,
                values: data.values,
                audienceIds: data.audienceIds || [],
                isActive: data.isActive !== undefined ? data.isActive : true,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
                createdBy: data.createdBy || 'admin'
            } as Filter;
        });
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
        const { Timestamp } = await import('firebase/firestore');
        const filtersRef = collection(db, FILTERS_COLLECTION);
        const newFilterRef = doc(filtersRef);
        const now = Timestamp.now();
        
        const firestoreData = {
            name: filterData.name,
            type: filterData.type,
            values: filterData.values,
            audienceIds: filterData.audienceIds || [],
            isActive: filterData.isActive !== undefined ? filterData.isActive : true,
            createdBy: filterData.createdBy || 'admin',
            createdAt: now,
            updatedAt: now
        };
        
        await setDoc(newFilterRef, firestoreData);
        
        const filter: Filter = {
            id: newFilterRef.id,
            name: filterData.name,
            type: filterData.type,
            values: filterData.values,
            audienceIds: filterData.audienceIds || [],
            isActive: filterData.isActive !== undefined ? filterData.isActive : true,
            createdBy: filterData.createdBy || 'admin',
            createdAt: now.toDate(),
            updatedAt: now.toDate()
        };
        
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

import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../client';

export interface Audience {
    id: string;
    name: string;
    description?: string;
    petType?: string;
    ageRange?: string[];
    breed?: string[];
    city?: string[];
    area?: string;
    gender?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AUDIENCES_COLLECTION = 'audiences';

// Get all audiences
export async function getAllAudiences(): Promise<Audience[]> {
    try {
        const audiencesRef = collection(db, AUDIENCES_COLLECTION);
        const q = query(audiencesRef, orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Audience));
    } catch (error) {
        console.error('Error fetching audiences:', error);
        return [];
    }
}

// Get audience by ID
export async function getAudienceById(id: string): Promise<Audience | null> {
    try {
        const audienceRef = doc(db, AUDIENCES_COLLECTION, id);
        const audienceDoc = await getDoc(audienceRef);
        
        if (!audienceDoc.exists()) {
            return null;
        }
        
        return { id: audienceDoc.id, ...audienceDoc.data() } as Audience;
    } catch (error) {
        console.error('Error fetching audience:', error);
        return null;
    }
}

// Create audience
export async function createAudience(audienceData: Omit<Audience, 'id' | 'createdAt' | 'updatedAt'>): Promise<Audience | null> {
    try {
        const audiencesRef = collection(db, AUDIENCES_COLLECTION);
        const newAudienceRef = doc(audiencesRef);
        const now = new Date();
        
        const audience: Audience = {
            id: newAudienceRef.id,
            ...audienceData,
            createdAt: now,
            updatedAt: now
        };
        
        await setDoc(newAudienceRef, audience);
        return audience;
    } catch (error) {
        console.error('Error creating audience:', error);
        return null;
    }
}

// Update audience
export async function updateAudience(id: string, updates: Partial<Audience>): Promise<Audience | null> {
    try {
        const audienceRef = doc(db, AUDIENCES_COLLECTION, id);
        await updateDoc(audienceRef, {
            ...updates,
            updatedAt: new Date()
        });
        
        const updatedDoc = await getDoc(audienceRef);
        if (!updatedDoc.exists()) return null;
        
        return { id: updatedDoc.id, ...updatedDoc.data() } as Audience;
    } catch (error) {
        console.error('Error updating audience:', error);
        return null;
    }
}

// Delete audience
export async function deleteAudience(id: string): Promise<boolean> {
    try {
        const audienceRef = doc(db, AUDIENCES_COLLECTION, id);
        await deleteDoc(audienceRef);
        return true;
    } catch (error) {
        console.error('Error deleting audience:', error);
        return false;
    }
}

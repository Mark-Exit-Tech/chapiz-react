import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../client';

export interface Ad {
    id: string;
    title: string;
    content: string;
    type: 'image' | 'video';
    status: 'active' | 'inactive' | 'pending' | 'scheduled';
    startDate: string | null;
    endDate: string | null;
    phone?: string;
    location?: string;
    description?: string;
    tags?: string[];
    area?: string;
    city?: string[];
    petType?: string;
    breed?: string;
    ageRange?: string[];
    weight?: string[];
    views: number;
    clicks: number;
    duration?: number;
    imageUrl?: string;
    createdAt: Date;
}

const ADS_COLLECTION = 'advertisements';

// Get ad by ID
export async function getAdById(id: string): Promise<Ad | null> {
    try {
        const adRef = doc(db, ADS_COLLECTION, id);
        const adDoc = await getDoc(adRef);
        
        if (!adDoc.exists()) {
            console.error('Ad not found');
            return null;
        }
        
        return { id: adDoc.id, ...adDoc.data() } as Ad;
    } catch (error) {
        console.error('Error fetching ad:', error);
        return null;
    }
}

// Get all active ads
export async function getActiveAds(): Promise<Ad[]> {
    try {
        const adsRef = collection(db, ADS_COLLECTION);
        const q = query(adsRef, where('status', '==', 'active'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));
    } catch (error) {
        console.error('Error fetching active ads:', error);
        return [];
    }
}

// Create ad
export async function createAd(adData: Omit<Ad, 'id' | 'createdAt'>): Promise<Ad | null> {
    try {
        const adsRef = collection(db, ADS_COLLECTION);
        const newAdRef = doc(adsRef);
        
        const ad: Ad = {
            id: newAdRef.id,
            ...adData,
            createdAt: new Date()
        };
        
        await setDoc(newAdRef, ad);
        return ad;
    } catch (error) {
        console.error('Error creating ad:', error);
        return null;
    }
}

// Update ad
export async function updateAd(id: string, updates: Partial<Ad>): Promise<Ad | null> {
    try {
        const adRef = doc(db, ADS_COLLECTION, id);
        await updateDoc(adRef, updates);
        
        const updatedDoc = await getDoc(adRef);
        if (!updatedDoc.exists()) return null;
        
        return { id: updatedDoc.id, ...updatedDoc.data() } as Ad;
    } catch (error) {
        console.error('Error updating ad:', error);
        return null;
    }
}

// Delete ad
export async function deleteAd(id: string): Promise<boolean> {
    try {
        const adRef = doc(db, ADS_COLLECTION, id);
        await deleteDoc(adRef);
        return true;
    } catch (error) {
        console.error('Error deleting ad:', error);
        return false;
    }
}

import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../client';

const USER_FAVORITES_COLLECTION = 'userFavorites';

export interface Favorite {
    id: string;
    userId: string;
    serviceId: string;
    serviceName?: string;
    serviceType?: string;
    createdAt: Date;
}

/**
 * Add to favorites
 */
export async function addToFavorites(userId: string, serviceId: string, serviceName?: string, serviceType?: string): Promise<{ success: boolean; error?: string }> {
    try {
        // Create a unique ID combining userId and serviceId
        const favoriteId = `${userId}_${serviceId}`;
        const favoriteRef = doc(db, USER_FAVORITES_COLLECTION, favoriteId);

        await setDoc(favoriteRef, {
            id: favoriteId,
            userId,
            serviceId,
            serviceName: serviceName || '',
            serviceType: serviceType || 'service',
            createdAt: Timestamp.now()
        });

        return { success: true };
    } catch (error) {
        console.error('Error adding to favorites:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/**
 * Remove from favorites
 */
export async function removeFromFavorites(userId: string, serviceId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const favoriteId = `${userId}_${serviceId}`;
        const favoriteRef = doc(db, USER_FAVORITES_COLLECTION, favoriteId);
        await deleteDoc(favoriteRef);
        return { success: true };
    } catch (error) {
        console.error('Error removing from favorites:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/**
 * Check if favorited
 */
export async function isFavorited(userId: string, serviceId: string): Promise<boolean> {
    try {
        const favoriteId = `${userId}_${serviceId}`;
        const favoriteRef = doc(db, USER_FAVORITES_COLLECTION, favoriteId);
        const favoriteDoc = await getDoc(favoriteRef);
        return favoriteDoc.exists();
    } catch (error) {
        console.error('Error checking favorite:', error);
        return false;
    }
}

/**
 * Get user favorites
 */
export async function getUserFavorites(userId: string): Promise<Favorite[]> {
    try {
        const favoritesRef = collection(db, USER_FAVORITES_COLLECTION);
        const q = query(favoritesRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(docSnapshot => {
            const data = docSnapshot.data();
            return {
                id: docSnapshot.id,
                userId: data.userId,
                serviceId: data.serviceId,
                serviceName: data.serviceName,
                serviceType: data.serviceType,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())
            } as Favorite;
        });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        return [];
    }
}

/**
 * Check if ad is favorited (alias for isFavorited)
 */
export async function isAdFavorited(userId: string, adId: string): Promise<boolean> {
    return isFavorited(userId, adId);
}

/**
 * Get all tags from both advertisements and businesses collections
 */
export async function getAllAdTags(): Promise<string[]> {
    try {
        // Import both advertisements and businesses functions dynamically
        const { getActiveAds } = await import('./advertisements');
        const { getAllBusinesses } = await import('./businesses');

        // Fetch both in parallel
        const [ads, businesses] = await Promise.all([
            getActiveAds().catch(() => []),
            getAllBusinesses().catch(() => [])
        ]);

        // Collect all unique tags from all ads and businesses
        const tagsSet = new Set<string>();

        // Add tags from advertisements
        ads.forEach(ad => {
            if (ad.tags && Array.isArray(ad.tags)) {
                ad.tags.forEach(tag => tagsSet.add(tag));
            }
        });

        // Add tags from businesses
        businesses.forEach(business => {
            if (business.tags && Array.isArray(business.tags)) {
                business.tags.forEach(tag => tagsSet.add(tag));
            }
        });

        const tags = Array.from(tagsSet).sort();
        console.log(`✅ Loaded ${tags.length} unique tags from ${ads.length} ads and ${businesses.length} businesses`);
        return tags;
    } catch (error) {
        console.error('Error fetching tags:', error);
        return [];
    }
}

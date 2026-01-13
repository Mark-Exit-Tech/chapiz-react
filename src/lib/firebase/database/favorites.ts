import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../client';

const USER_FAVORITES_COLLECTION = 'userFavorites';

/**
 * Add to favorites
 */
export async function addToFavorites(userId: string, serviceId: string, serviceName?: string, serviceType?: string): Promise<{ success: boolean; error?: string }> {
    try {
        console.warn('addToFavorites not yet fully implemented');
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
        console.warn('removeFromFavorites not yet fully implemented');
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
        console.warn('isFavorited not yet fully implemented');
        return false;
    } catch (error) {
        console.error('Error checking favorite:', error);
        return false;
    }
}

/**
 * Get user favorites
 */
export async function getUserFavorites(userId: string): Promise<string[]> {
    try {
        console.warn('getUserFavorites not yet fully implemented');
        return [];
    } catch (error) {
        console.error('Error fetching favorites:', error);
        return [];
    }
}

/**
 * Check if ad is favorited
 */
export async function isAdFavorited(userId: string, adId: string): Promise<boolean> {
    try {
        console.warn('isAdFavorited not yet fully implemented');
        return false;
    } catch (error) {
        console.error('Error checking ad favorite:', error);
        return false;
    }
}

/**
 * Get all ad tags from advertisements collection
 * Note: Businesses collection doesn't have tags by default
 */
export async function getAllAdTags(): Promise<string[]> {
    try {
        // Import advertisements functions dynamically
        const { getActiveAds } = await import('./advertisements');
        const ads = await getActiveAds();
        
        // Collect all unique tags from all ads
        const tagsSet = new Set<string>();
        ads.forEach(ad => {
            if (ad.tags && Array.isArray(ad.tags)) {
                ad.tags.forEach(tag => tagsSet.add(tag));
            }
        });
        
        const tags = Array.from(tagsSet).sort();
        console.log(`✅ Loaded ${tags.length} unique tags from advertisements`);
        return tags;
    } catch (error) {
        console.error('Error fetching ad tags:', error);
        return [];
    }
}

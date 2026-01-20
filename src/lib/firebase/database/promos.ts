import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../client';

export interface UserPromo {
    id: string;
    userId: string;
    promoId: string;
    createdAt: string;
    promo?: any;
    usedAt?: string;
}

const USER_PROMOS_COLLECTION = 'userPromos';
const PROMOS_COLLECTION = 'promos';

/**
 * Get user promos
 */
export async function getUserPromos(userId: string): Promise<UserPromo[]> {
    try {
        console.warn('getUserPromos not yet fully implemented');
        return [];
    } catch (error) {
        console.error('Error fetching user promos:', error);
        return [];
    }
}

/**
 * Purchase promo
 */
export async function purchasePromo(userId: string, promoId: string): Promise<{ success: boolean; error?: string }> {
    try {
        console.warn('purchasePromo not yet fully implemented');
        return { success: false, error: 'Not yet implemented' };
    } catch (error) {
        console.error('Error purchasing promo:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/**
 * Mark promo as used
 */
export async function markPromoAsUsed(userId: string, promoId: string): Promise<{ success: boolean; error?: string }> {
    try {
        console.log('✔️ Marking promo as used:', { userId, promoId });

        // Create or update user promo record
        const userPromosRef = collection(db, USER_PROMOS_COLLECTION);
        const q = query(
            userPromosRef,
            where('userId', '==', userId),
            where('promoId', '==', promoId)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // Create new record if doesn't exist
            const newUserPromoRef = doc(userPromosRef);
            const now = new Date();

            await setDoc(newUserPromoRef, {
                userId,
                promoId,
                usedAt: now.toISOString(),
                createdAt: now.toISOString()
            });

            console.log('✅ Promo marked as used (new record created)');
        } else {
            // Update existing record
            const userPromoDoc = querySnapshot.docs[0];
            const now = new Date();

            await updateDoc(doc(db, USER_PROMOS_COLLECTION, userPromoDoc.id), {
                usedAt: now.toISOString()
            });

            console.log('✅ Promo marked as used (existing record updated)');
        }

        return { success: true };
    } catch (error) {
        console.error('❌ Error marking promo as used:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/**
 * Check if promo is used
 */
export async function isPromoUsed(userId: string, promoId: string): Promise<boolean> {
    try {
        const userPromosRef = collection(db, USER_PROMOS_COLLECTION);
        const q = query(
            userPromosRef,
            where('userId', '==', userId),
            where('promoId', '==', promoId)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return false;
        }

        // Check if any of the records have a usedAt field
        for (const docSnap of querySnapshot.docs) {
            const data = docSnap.data();
            if (data.usedAt) {
                return true;
            }
        }

        return false;
    } catch (error) {
        console.error('❌ Error checking promo status:', error);
        return false;
    }
}

/**
 * Get user used promos
 */
export async function getUserUsedPromos(userId: string): Promise<{ success: boolean; promos: UserPromo[]; error?: any }> {
    try {
        console.warn('getUserUsedPromos not yet fully implemented');
        return { success: true, promos: [] };
    } catch (error) {
        console.error('Error fetching used promos:', error);
        return { success: false, promos: [], error };
    }
}

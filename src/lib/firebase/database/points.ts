import { collection, doc, getDoc, getDocs, setDoc, updateDoc, increment, query, where, orderBy } from 'firebase/firestore';
import { db } from '../client';

const USER_POINTS_COLLECTION = 'userPoints';
const POINTS_TRANSACTIONS_COLLECTION = 'pointsTransactions';

export interface UserPoints {
    userId: string;
    points: number;
    updatedAt: Date;
}

export interface PointsTransaction {
    id: string;
    userId: string;
    points: number;
    category: string;
    description?: string;
    createdAt: Date;
}

/**
 * Get user points
 */
export async function getUserPoints(user: any): Promise<{ points: number }> {
    try {
        if (!user || !user.uid) {
            return { points: 0 };
        }
        
        const pointsRef = doc(db, USER_POINTS_COLLECTION, user.uid);
        const pointsDoc = await getDoc(pointsRef);
        
        if (!pointsDoc.exists()) {
            return { points: 0 };
        }
        
        const data = pointsDoc.data() as UserPoints;
        return { points: data.points || 0 };
    } catch (error) {
        console.error('Error fetching user points:', error);
        return { points: 0 };
    }
}

/**
 * Update user points
 */
export async function updateUserPoints(user: any, points: number): Promise<boolean> {
    try {
        if (!user || !user.uid) {
            return false;
        }
        
        const pointsRef = doc(db, USER_POINTS_COLLECTION, user.uid);
        await setDoc(pointsRef, {
            userId: user.uid,
            points,
            updatedAt: new Date()
        }, { merge: true });
        
        return true;
    } catch (error) {
        console.error('Error updating user points:', error);
        return false;
    }
}

/**
 * Add points to category
 */
export async function addPointsToCategory(user: any, category: string, points: number): Promise<boolean> {
    try {
        if (!user || !user.uid) {
            return false;
        }
        
        // Update total points
        const pointsRef = doc(db, USER_POINTS_COLLECTION, user.uid);
        await setDoc(pointsRef, {
            userId: user.uid,
            points: increment(points),
            updatedAt: new Date()
        }, { merge: true });
        
        // Create transaction record
        const transactionsRef = collection(db, POINTS_TRANSACTIONS_COLLECTION);
        const newTransactionRef = doc(transactionsRef);
        
        await setDoc(newTransactionRef, {
            id: newTransactionRef.id,
            userId: user.uid,
            points,
            category,
            createdAt: new Date()
        });
        
        return true;
    } catch (error) {
        console.error('Error adding points:', error);
        return false;
    }
}

/**
 * Deduct points from category
 */
export async function deductPointsFromCategory(user: any, category: string, points: number): Promise<boolean> {
    try {
        if (!user || !user.uid) {
            return false;
        }
        
        // Update total points (decrement)
        const pointsRef = doc(db, USER_POINTS_COLLECTION, user.uid);
        await setDoc(pointsRef, {
            userId: user.uid,
            points: increment(-points),
            updatedAt: new Date()
        }, { merge: true });
        
        // Create transaction record
        const transactionsRef = collection(db, POINTS_TRANSACTIONS_COLLECTION);
        const newTransactionRef = doc(transactionsRef);
        
        await setDoc(newTransactionRef, {
            id: newTransactionRef.id,
            userId: user.uid,
            points: -points,
            category,
            createdAt: new Date()
        });
        
        return true;
    } catch (error) {
        console.error('Error deducting points:', error);
        return false;
    }
}

/**
 * Recalculate user points
 */
export async function recalculateUserPoints(user: any): Promise<boolean> {
    try {
        if (!user || !user.uid) {
            return false;
        }
        
        console.warn('recalculateUserPoints not yet fully implemented');
        return true;
    } catch (error) {
        console.error('Error recalculating points:', error);
        return false;
    }
}

/**
 * Get user transactions
 */
export async function getUserTransactions(user: any): Promise<PointsTransaction[]> {
    try {
        if (!user || !user.uid) {
            return [];
        }
        
        const transactionsRef = collection(db, POINTS_TRANSACTIONS_COLLECTION);
        const q = query(
            transactionsRef,
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PointsTransaction));
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
}

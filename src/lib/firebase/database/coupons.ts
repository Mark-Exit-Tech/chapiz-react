import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../client';

export interface UserCoupon {
    id: string;
    userId: string;
    couponId: string;
    status: string;
    createdAt: string;
    purchasedAt: Date;
    usedAt?: Date;
    coupon: {
        id: string;
        name: string;
        description: string;
        price: number;
        points: number;
        validFrom: Date;
        validTo: Date;
        imageUrl?: string;
        businessId?: string;
        businessIds?: string[];
    };
}

const USER_COUPONS_COLLECTION = 'userCoupons';
const COUPONS_COLLECTION = 'coupons';

/**
 * Purchase coupon
 */
export async function purchaseCoupon(userId: string, couponId: string, points: number): Promise<{ success: boolean; error?: string }> {
    try {
        console.log('💰 Purchasing coupon:', { userId, couponId, points });
        
        // Get the coupon details
        const couponRef = doc(db, COUPONS_COLLECTION, couponId);
        const couponSnap = await getDoc(couponRef);
        
        if (!couponSnap.exists()) {
            console.error('❌ Coupon not found:', couponId);
            return { success: false, error: 'Coupon not found' };
        }
        
        const couponData = couponSnap.data();
        
        // Create user coupon record
        const userCouponsRef = collection(db, USER_COUPONS_COLLECTION);
        const newUserCouponRef = doc(userCouponsRef);
        const now = Timestamp.now();
        
        const userCouponData = {
            userId,
            couponId,
            status: 'active',
            purchasedAt: now,
            createdAt: now.toDate().toISOString(),
            pointsSpent: points,
        };
        
        await setDoc(newUserCouponRef, userCouponData);
        console.log('✅ Coupon purchased successfully:', newUserCouponRef.id);
        
        return { success: true };
    } catch (error) {
        console.error('❌ Error purchasing coupon:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/**
 * Get active user coupons
 */
export async function getActiveUserCoupons(userId: string): Promise<UserCoupon[]> {
    try {
        console.log('🎫 Fetching active coupons for user:', userId);
        
        const userCouponsRef = collection(db, USER_COUPONS_COLLECTION);
        const q = query(userCouponsRef, where('userId', '==', userId), where('status', '==', 'active'));
        const querySnapshot = await getDocs(q);
        
        const userCoupons: UserCoupon[] = [];
        
        // Fetch coupon details for each user coupon
        for (const docSnap of querySnapshot.docs) {
            const data = docSnap.data();
            const couponRef = doc(db, COUPONS_COLLECTION, data.couponId);
            const couponSnap = await getDoc(couponRef);
            
            if (couponSnap.exists()) {
                const couponData = couponSnap.data();
                
                userCoupons.push({
                    id: docSnap.id,
                    userId: data.userId,
                    couponId: data.couponId,
                    status: data.status || 'active',
                    createdAt: data.createdAt,
                    purchasedAt: data.purchasedAt?.toDate ? data.purchasedAt.toDate() : new Date(data.purchasedAt),
                    usedAt: data.usedAt?.toDate ? data.usedAt.toDate() : undefined,
                    coupon: {
                        id: couponSnap.id,
                        name: couponData.name || '',
                        description: couponData.description || '',
                        price: couponData.price || 0,
                        points: couponData.points || 0,
                        validFrom: couponData.validFrom?.toDate ? couponData.validFrom.toDate() : new Date(couponData.validFrom),
                        validTo: couponData.validTo?.toDate ? couponData.validTo.toDate() : new Date(couponData.validTo),
                        imageUrl: couponData.imageUrl,
                        businessId: couponData.businessId,
                        businessIds: couponData.businessIds,
                    }
                });
            }
        }
        
        console.log(`✅ Fetched ${userCoupons.length} active coupons`);
        return userCoupons;
    } catch (error) {
        console.error('❌ Error fetching active coupons:', error);
        return [];
    }
}

/**
 * Get coupon history
 */
export async function getCouponHistory(userId: string): Promise<{ success: boolean; coupons?: UserCoupon[] }> {
    try {
        console.log('📜 Fetching coupon history for user:', userId);
        
        const userCouponsRef = collection(db, USER_COUPONS_COLLECTION);
        const q = query(userCouponsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        
        const userCoupons: UserCoupon[] = [];
        
        // Fetch coupon details for each user coupon
        for (const docSnap of querySnapshot.docs) {
            const data = docSnap.data();
            const couponRef = doc(db, COUPONS_COLLECTION, data.couponId);
            const couponSnap = await getDoc(couponRef);
            
            if (couponSnap.exists()) {
                const couponData = couponSnap.data();
                
                userCoupons.push({
                    id: docSnap.id,
                    userId: data.userId,
                    couponId: data.couponId,
                    status: data.status || 'active',
                    createdAt: data.createdAt,
                    purchasedAt: data.purchasedAt?.toDate ? data.purchasedAt.toDate() : new Date(data.purchasedAt),
                    usedAt: data.usedAt?.toDate ? data.usedAt.toDate() : (data.usedAt ? new Date(data.usedAt) : undefined),
                    coupon: {
                        id: couponSnap.id,
                        name: couponData.name || '',
                        description: couponData.description || '',
                        price: couponData.price || 0,
                        points: couponData.points || 0,
                        validFrom: couponData.validFrom?.toDate ? couponData.validFrom.toDate() : new Date(couponData.validFrom),
                        validTo: couponData.validTo?.toDate ? couponData.validTo.toDate() : new Date(couponData.validTo),
                        imageUrl: couponData.imageUrl,
                        businessId: couponData.businessId,
                        businessIds: couponData.businessIds,
                    }
                });
            }
        }
        
        console.log(`✅ Fetched ${userCoupons.length} coupons from history`);
        return { success: true, coupons: userCoupons };
    } catch (error) {
        console.error('❌ Error fetching coupon history:', error);
        return { success: false };
    }
}

/**
 * Mark coupon as used
 */
export async function markCouponAsUsed(userCouponId: string): Promise<{ success: boolean; error?: string }> {
    try {
        console.log('✔️ Marking coupon as used:', userCouponId);
        
        const userCouponRef = doc(db, USER_COUPONS_COLLECTION, userCouponId);
        const now = Timestamp.now();
        
        await updateDoc(userCouponRef, {
            status: 'used',
            usedAt: now
        });
        
        console.log('✅ Coupon marked as used successfully');
        return { success: true };
    } catch (error) {
        console.error('❌ Error marking coupon as used:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/**
 * Get user coupon by ID
 */
export async function getUserCouponById(userCouponId: string): Promise<UserCoupon | null> {
    try {
        console.warn('getUserCouponById not yet fully implemented');
        return null;
    } catch (error) {
        console.error('Error fetching user coupon:', error);
        return null;
    }
}

/**
 * Get coupon by ID
 */
export async function getCouponById(couponId: string): Promise<any> {
    try {
        console.warn('getCouponById not yet fully implemented');
        return null;
    } catch (error) {
        console.error('Error fetching coupon:', error);
        return null;
    }
}

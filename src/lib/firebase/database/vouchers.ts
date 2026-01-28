import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../client';

export interface Voucher {
    id: string;
    name: string;
    description: string;
    price: number;
    points: number;
    imageUrl?: string;
    validFrom: Date;
    validTo: Date;
    isActive: boolean;
    stock?: number; // Available quantity (undefined = unlimited)
    businessId?: string;
    businessIds?: string[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
}

export interface UserVoucher {
    id: string;
    userId: string;
    voucherId: string;
    status: 'active' | 'used' | 'expired';
    purchasedAt: Date;
    usedAt?: Date;
    voucher: Voucher;
}

const VOUCHERS_COLLECTION = 'vouchers';
const USER_VOUCHERS_COLLECTION = 'userVouchers';

/**
 * Get all vouchers (admin function)
 */
export async function getAllVouchers(): Promise<Voucher[]> {
    try {
        const q = query(
            collection(db, VOUCHERS_COLLECTION),
            orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const vouchers: Voucher[] = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            vouchers.push({
                id: doc.id,
                ...data,
                validFrom: data.validFrom?.toDate() || new Date(),
                validTo: data.validTo?.toDate() || new Date(),
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            } as Voucher);
        });
        
        return vouchers;
    } catch (error) {
        console.error('Error fetching all vouchers:', error);
        return [];
    }
}

/**
 * Get purchase count per voucher (how many times each voucher was bought). For admin.
 */
export async function getVoucherPurchaseCounts(): Promise<Record<string, number>> {
    try {
        const q = query(collection(db, USER_VOUCHERS_COLLECTION));
        const snapshot = await getDocs(q);
        const counts: Record<string, number> = {};
        snapshot.forEach((docSnap) => {
            const voucherId = docSnap.data().voucherId;
            if (voucherId) {
                counts[voucherId] = (counts[voucherId] || 0) + 1;
            }
        });
        return counts;
    } catch (error) {
        console.error('Error fetching voucher purchase counts:', error);
        return {};
    }
}

/**
 * Get all active vouchers (currently valid and isActive).
 * Uses getAllVouchers + client-side filter to avoid requiring a Firestore composite index.
 */
export async function getActiveVouchers(): Promise<Voucher[]> {
    try {
        const all = await getAllVouchers();
        const now = new Date();
        return all.filter((v) => {
            if (!v.isActive) return false;
            const validFrom = v.validFrom instanceof Date ? v.validFrom : new Date(v.validFrom);
            const validTo = v.validTo instanceof Date ? v.validTo : new Date(v.validTo);
            return validFrom <= now && validTo >= now;
        });
    } catch (error) {
        console.error('Error fetching vouchers:', error);
        return [];
    }
}

/**
 * Get user vouchers (no orderBy in query to avoid composite index; sort in memory).
 */
export async function getUserVouchers(userId: string): Promise<UserVoucher[]> {
    try {
        const q = query(
            collection(db, USER_VOUCHERS_COLLECTION),
            where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(q);
        const userVouchers: UserVoucher[] = [];

        for (const docSnapshot of querySnapshot.docs) {
            const data = docSnapshot.data();
            const voucherId = data.voucherId;
            if (!voucherId) continue;

            const voucherDoc = await getDoc(doc(db, VOUCHERS_COLLECTION, voucherId));
            if (voucherDoc.exists()) {
                const voucherData = voucherDoc.data();
                const purchasedAt = data.purchasedAt?.toDate() || new Date();
                userVouchers.push({
                    id: docSnapshot.id,
                    userId: data.userId,
                    voucherId,
                    status: data.status || 'active',
                    purchasedAt,
                    usedAt: data.usedAt?.toDate(),
                    voucher: {
                        id: voucherDoc.id,
                        ...voucherData,
                        validFrom: voucherData.validFrom?.toDate() || new Date(),
                        validTo: voucherData.validTo?.toDate() || new Date(),
                        createdAt: voucherData.createdAt?.toDate() || new Date(),
                        updatedAt: voucherData.updatedAt?.toDate() || new Date(),
                    } as Voucher,
                });
            }
        }

        userVouchers.sort((a, b) => (b.purchasedAt?.getTime?.() ?? 0) - (a.purchasedAt?.getTime?.() ?? 0));
        return userVouchers;
    } catch (error) {
        console.error('Error fetching user vouchers:', error);
        return [];
    }
}

/**
 * Purchase voucher
 */
export async function purchaseVoucher(userId: string, voucherId: string, points: number): Promise<{ success: boolean; error?: string }> {
    try {
        const { getUserByUid } = await import('./users');
        const user = await getUserByUid(userId);
        if (user?.voucherPurchaseLimit != null && user.voucherPurchaseLimit >= 0) {
            const existing = await getUserVouchers(userId);
            if (existing.length >= user.voucherPurchaseLimit) {
                return {
                    success: false,
                    error: `Purchase limit reached. You can buy up to ${user.voucherPurchaseLimit} voucher(s).`
                };
            }
        }

        const userVoucherRef = doc(collection(db, USER_VOUCHERS_COLLECTION));
        
        await setDoc(userVoucherRef, {
            userId,
            voucherId,
            status: 'active',
            purchasedAt: Timestamp.now(),
            pointsSpent: points,
        });
        
        return { success: true };
    } catch (error) {
        console.error('Error purchasing voucher:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/**
 * Mark voucher as used
 */
export async function markVoucherAsUsed(userVoucherId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const voucherRef = doc(db, USER_VOUCHERS_COLLECTION, userVoucherId);
        
        await updateDoc(voucherRef, {
            status: 'used',
            usedAt: Timestamp.now(),
        });
        
        return { success: true };
    } catch (error) {
        console.error('Error marking voucher as used:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/**
 * Get user voucher by document ID (for voucher detail page)
 */
export async function getUserVoucherById(userVoucherId: string): Promise<UserVoucher | null> {
    try {
        const userVoucherRef = doc(db, USER_VOUCHERS_COLLECTION, userVoucherId);
        const userVoucherSnap = await getDoc(userVoucherRef);

        if (!userVoucherSnap.exists()) return null;

        const data = userVoucherSnap.data();
        const voucherDoc = await getDoc(doc(db, VOUCHERS_COLLECTION, data.voucherId));
        if (!voucherDoc.exists()) return null;

        const voucherData = voucherDoc.data();
        return {
            id: userVoucherSnap.id,
            userId: data.userId,
            voucherId: data.voucherId,
            status: data.status || 'active',
            purchasedAt: data.purchasedAt?.toDate() || new Date(),
            usedAt: data.usedAt?.toDate(),
            voucher: {
                id: voucherDoc.id,
                ...voucherData,
                validFrom: voucherData.validFrom?.toDate() || new Date(),
                validTo: voucherData.validTo?.toDate() || new Date(),
                createdAt: voucherData.createdAt?.toDate() || new Date(),
                updatedAt: voucherData.updatedAt?.toDate() || new Date(),
            } as Voucher,
        };
    } catch (error) {
        console.error('Error fetching user voucher:', error);
        return null;
    }
}

/**
 * Get voucher by ID
 */
export async function getVoucherById(voucherId: string): Promise<Voucher | null> {
    try {
        const voucherDoc = await getDoc(doc(db, VOUCHERS_COLLECTION, voucherId));
        
        if (voucherDoc.exists()) {
            const data = voucherDoc.data();
            return {
                id: voucherDoc.id,
                ...data,
                validFrom: data.validFrom?.toDate() || new Date(),
                validTo: data.validTo?.toDate() || new Date(),
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            } as Voucher;
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching voucher:', error);
        return null;
    }
}

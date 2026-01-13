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
 * Get all active vouchers
 */
export async function getActiveVouchers(): Promise<Voucher[]> {
    try {
        const q = query(
            collection(db, VOUCHERS_COLLECTION),
            where('isActive', '==', true),
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
        console.error('Error fetching vouchers:', error);
        return [];
    }
}

/**
 * Get user vouchers
 */
export async function getUserVouchers(userId: string): Promise<UserVoucher[]> {
    try {
        const q = query(
            collection(db, USER_VOUCHERS_COLLECTION),
            where('userId', '==', userId),
            orderBy('purchasedAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const userVouchers: UserVoucher[] = [];
        
        for (const docSnapshot of querySnapshot.docs) {
            const data = docSnapshot.data();
            
            // Fetch the voucher details
            const voucherDoc = await getDoc(doc(db, VOUCHERS_COLLECTION, data.voucherId));
            if (voucherDoc.exists()) {
                const voucherData = voucherDoc.data();
                userVouchers.push({
                    id: docSnapshot.id,
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
                });
            }
        }
        
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

import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit as firestoreLimit, Timestamp } from 'firebase/firestore';
import { db } from '../client';

export interface Business {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    contactInfo: {
        email: string;
        phone: string;
        address: string;
    };
    tags: string[];
    filterIds?: string[];
    rating?: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    // Legacy fields for backward compatibility
    logoUrl?: string;
    website?: string;
    phone?: string;
    email?: string;
    address?: string;
}

const BUSINESSES_COLLECTION = 'businesses';

// Get all businesses
export async function getAllBusinesses(): Promise<Business[]> {
    try {
        const businessesRef = collection(db, BUSINESSES_COLLECTION);
        const q = query(businessesRef, orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            // Normalize data to match new interface while supporting legacy format
            return {
                id: doc.id,
                name: data.name || '',
                description: data.description || '',
                imageUrl: data.imageUrl || data.logoUrl || '',
                contactInfo: data.contactInfo || {
                    email: data.email || '',
                    phone: data.phone || '',
                    address: data.address || ''
                },
                tags: data.tags || [],
                filterIds: data.filterIds,
                rating: data.rating,
                isActive: data.isActive !== undefined ? data.isActive : true,
                createdAt: data.createdAt || new Date(),
                updatedAt: data.updatedAt || new Date(),
                createdBy: data.createdBy || '',
                // Legacy fields
                logoUrl: data.logoUrl,
                website: data.website,
                phone: data.phone,
                email: data.email,
                address: data.address
            } as Business;
        });
    } catch (error) {
        console.error('Error fetching businesses:', error);
        return [];
    }
}

// Get business by ID
export async function getBusinessById(id: string): Promise<Business | null> {
    try {
        const businessRef = doc(db, BUSINESSES_COLLECTION, id);
        const businessDoc = await getDoc(businessRef);
        
        if (!businessDoc.exists()) {
            console.error('Business not found');
            return null;
        }
        
        const data = businessDoc.data();
        // Normalize data to match new interface while supporting legacy format
        return {
            id: businessDoc.id,
            name: data.name || '',
            description: data.description || '',
            imageUrl: data.imageUrl || data.logoUrl || '',
            contactInfo: data.contactInfo || {
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || ''
            },
            tags: data.tags || [],
            filterIds: data.filterIds,
            rating: data.rating,
            isActive: data.isActive !== undefined ? data.isActive : true,
            createdAt: data.createdAt || new Date(),
            updatedAt: data.updatedAt || new Date(),
            createdBy: data.createdBy || '',
            // Legacy fields
            logoUrl: data.logoUrl,
            website: data.website,
            phone: data.phone,
            email: data.email,
            address: data.address
        } as Business;
    } catch (error) {
        console.error('Error fetching business:', error);
        return null;
    }
}

// Search businesses
export async function searchBusinesses(searchTerm: string): Promise<Business[]> {
    try {
        // Note: Firestore doesn't support full-text search natively
        // This is a simplified version - you may want to use Algolia or similar
        const businessesRef = collection(db, BUSINESSES_COLLECTION);
        const querySnapshot = await getDocs(businessesRef);
        
        return querySnapshot.docs
            .map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name || '',
                    description: data.description || '',
                    imageUrl: data.imageUrl || data.logoUrl || '',
                    contactInfo: data.contactInfo || {
                        email: data.email || '',
                        phone: data.phone || '',
                        address: data.address || ''
                    },
                    tags: data.tags || [],
                    filterIds: data.filterIds,
                    rating: data.rating,
                    isActive: data.isActive !== undefined ? data.isActive : true,
                    createdAt: data.createdAt || new Date(),
                    updatedAt: data.updatedAt || new Date(),
                    createdBy: data.createdBy || '',
                    logoUrl: data.logoUrl,
                    website: data.website,
                    phone: data.phone,
                    email: data.email,
                    address: data.address
                } as Business;
            })
            .filter(business => 
                business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                business.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
    } catch (error) {
        console.error('Error searching businesses:', error);
        return [];
    }
}

// Create business
export async function createBusiness(businessData: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>): Promise<Business | null> {
    try {
        const businessesRef = collection(db, BUSINESSES_COLLECTION);
        const newBusinessRef = doc(businessesRef);
        const now = Timestamp.now();
        
        // Prepare data for Firestore (using Timestamp)
        const firestoreData = {
            name: businessData.name,
            description: businessData.description,
            imageUrl: businessData.imageUrl || '',
            contactInfo: businessData.contactInfo,
            tags: businessData.tags || [],
            filterIds: businessData.filterIds || [],
            rating: businessData.rating || 0,
            isActive: businessData.isActive !== undefined ? businessData.isActive : true,
            createdBy: businessData.createdBy || 'admin',
            createdAt: now,
            updatedAt: now
        };
        
        console.log('📝 Creating business with data:', firestoreData);
        await setDoc(newBusinessRef, firestoreData);
        
        // Return business with Date objects for consistency
        const business: Business = {
            id: newBusinessRef.id,
            name: businessData.name,
            description: businessData.description,
            imageUrl: businessData.imageUrl || '',
            contactInfo: businessData.contactInfo,
            tags: businessData.tags || [],
            filterIds: businessData.filterIds,
            rating: businessData.rating,
            isActive: businessData.isActive !== undefined ? businessData.isActive : true,
            createdAt: now.toDate(),
            updatedAt: now.toDate(),
            createdBy: businessData.createdBy || 'admin'
        };
        
        console.log('✅ Business created successfully:', business.id);
        return business;
    } catch (error) {
        console.error('❌ Error creating business:', error);
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            code: (error as any)?.code,
            stack: error instanceof Error ? error.stack : undefined
        });
        return null;
    }
}

// Update business
export async function updateBusiness(id: string, updates: Partial<Business>): Promise<Business | null> {
    try {
        const businessRef = doc(db, BUSINESSES_COLLECTION, id);
        await updateDoc(businessRef, {
            ...updates,
            updatedAt: Timestamp.now()
        });
        
        const updatedDoc = await getDoc(businessRef);
        if (!updatedDoc.exists()) return null;
        
        const data = updatedDoc.data();
        return {
            id: updatedDoc.id,
            name: data.name || '',
            description: data.description || '',
            imageUrl: data.imageUrl || data.logoUrl || '',
            contactInfo: data.contactInfo || {
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || ''
            },
            tags: data.tags || [],
            filterIds: data.filterIds,
            rating: data.rating,
            isActive: data.isActive !== undefined ? data.isActive : true,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
            createdBy: data.createdBy || '',
            logoUrl: data.logoUrl,
            website: data.website,
            phone: data.phone,
            email: data.email,
            address: data.address
        } as Business;
    } catch (error) {
        console.error('Error updating business:', error);
        return null;
    }
}

// Delete business
export async function deleteBusiness(id: string): Promise<boolean> {
    try {
        const businessRef = doc(db, BUSINESSES_COLLECTION, id);
        await deleteDoc(businessRef);
        return true;
    } catch (error) {
        console.error('Error deleting business:', error);
        return false;
    }
}

// Get businesses with pagination
export async function getBusinessesPaginated(page: number = 1, pageSize: number = 20): Promise<{ businesses: Business[], total: number }> {
    try {
        const businessesRef = collection(db, BUSINESSES_COLLECTION);
        const q = query(businessesRef, orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        
        const allBusinesses = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name || '',
                description: data.description || '',
                imageUrl: data.imageUrl || data.logoUrl || '',
                contactInfo: data.contactInfo || {
                    email: data.email || '',
                    phone: data.phone || '',
                    address: data.address || ''
                },
                tags: data.tags || [],
                filterIds: data.filterIds,
                rating: data.rating,
                isActive: data.isActive !== undefined ? data.isActive : true,
                createdAt: data.createdAt || new Date(),
                updatedAt: data.updatedAt || new Date(),
                createdBy: data.createdBy || '',
                logoUrl: data.logoUrl,
                website: data.website,
                phone: data.phone,
                email: data.email,
                address: data.address
            } as Business;
        });
        
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        
        return {
            businesses: allBusinesses.slice(from, to),
            total: allBusinesses.length
        };
    } catch (error) {
        console.error('Error fetching businesses:', error);
        return { businesses: [], total: 0 };
    }
}

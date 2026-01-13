import { collection, doc, setDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../client';

export interface ContactSubmission {
    id: string;
    name: string;
    email: string;
    phone?: string;
    message: string;
    createdAt: Date;
    read: boolean;
}

const CONTACT_SUBMISSIONS_COLLECTION = 'contactSubmissions';

/**
 * Create contact submission
 */
export async function createContactSubmission(
    data: Omit<ContactSubmission, 'id' | 'createdAt' | 'read'>
): Promise<{ success: boolean; error?: string }> {
    try {
        const contactRef = collection(db, CONTACT_SUBMISSIONS_COLLECTION);
        const newContactRef = doc(contactRef);
        
        const submission: ContactSubmission = {
            id: newContactRef.id,
            ...data,
            createdAt: new Date(),
            read: false
        };
        
        await setDoc(newContactRef, submission);
        
        return { success: true };
    } catch (error) {
        console.error('Error creating contact submission:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Get all contact submissions
 */
export async function getAllContactSubmissions(): Promise<ContactSubmission[]> {
    try {
        const contactRef = collection(db, CONTACT_SUBMISSIONS_COLLECTION);
        const q = query(contactRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactSubmission));
    } catch (error) {
        console.error('Error fetching contact submissions:', error);
        return [];
    }
}

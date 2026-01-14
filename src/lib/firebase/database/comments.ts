import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../client';

export interface Comment {
    id: string;
    adId: string;
    userId: string;
    userName?: string;
    userImage?: string;
    content: string;
    rating?: number;
    createdAt: Date;
    updatedAt?: Date;
}

const COMMENTS_COLLECTION = 'comments';

// Get all comments for an ad
export async function getCommentsForAd(adId: string): Promise<Comment[]> {
    try {
        const commentsRef = collection(db, COMMENTS_COLLECTION);

        // Try with orderBy first (requires composite index)
        let querySnapshot;
        try {
            const q = query(commentsRef, where('adId', '==', adId), orderBy('createdAt', 'desc'));
            querySnapshot = await getDocs(q);
        } catch (indexError) {
            // Fallback: query without orderBy if index doesn't exist, then sort in memory
            console.warn('Composite index not available, falling back to client-side sorting');
            const q = query(commentsRef, where('adId', '==', adId));
            querySnapshot = await getDocs(q);
        }

        const comments = querySnapshot.docs.map(docSnapshot => {
            const data = docSnapshot.data();
            return {
                id: docSnapshot.id,
                ...data,
                // Convert Firestore Timestamp to Date
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : undefined)
            } as Comment;
        });

        // Sort by createdAt descending (newest first)
        return comments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
        console.error('Error fetching comments for ad:', error);
        return [];
    }
}

// Get all comments (admin)
export async function getAllComments(): Promise<Comment[]> {
    try {
        const commentsRef = collection(db, COMMENTS_COLLECTION);
        const q = query(commentsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Convert Firestore Timestamp to Date
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : undefined)
            } as Comment;
        });
    } catch (error) {
        console.error('Error fetching all comments:', error);
        return [];
    }
}

// Get comment by ID
export async function getCommentById(id: string): Promise<Comment | null> {
    try {
        const commentRef = doc(db, COMMENTS_COLLECTION, id);
        const commentDoc = await getDoc(commentRef);
        
        if (!commentDoc.exists()) {
            return null;
        }
        
        return { id: commentDoc.id, ...commentDoc.data() } as Comment;
    } catch (error) {
        console.error('Error fetching comment:', error);
        return null;
    }
}

// Create comment
export async function createComment(commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment | null> {
    try {
        const commentsRef = collection(db, COMMENTS_COLLECTION);
        const newCommentRef = doc(commentsRef);

        // Use Firestore Timestamp for proper date storage
        const firestoreData = {
            id: newCommentRef.id,
            ...commentData,
            createdAt: Timestamp.now()
        };

        await setDoc(newCommentRef, firestoreData);

        // Return with Date object for local use
        return {
            id: newCommentRef.id,
            ...commentData,
            createdAt: new Date()
        };
    } catch (error) {
        console.error('Error creating comment:', error);
        return null;
    }
}

// Update comment
export async function updateComment(id: string, updates: Partial<Comment>): Promise<Comment | null> {
    try {
        const commentRef = doc(db, COMMENTS_COLLECTION, id);
        await updateDoc(commentRef, {
            ...updates,
            updatedAt: Timestamp.now()
        });
        
        const updatedDoc = await getDoc(commentRef);
        if (!updatedDoc.exists()) return null;
        
        return { id: updatedDoc.id, ...updatedDoc.data() } as Comment;
    } catch (error) {
        console.error('Error updating comment:', error);
        return null;
    }
}

// Delete comment
export async function deleteComment(id: string): Promise<boolean> {
    try {
        const commentRef = doc(db, COMMENTS_COLLECTION, id);
        await deleteDoc(commentRef);
        return true;
    } catch (error) {
        console.error('Error deleting comment:', error);
        return false;
    }
}

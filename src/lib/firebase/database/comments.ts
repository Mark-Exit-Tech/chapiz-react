import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
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
        const q = query(commentsRef, where('adId', '==', adId), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
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
        
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
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
        
        const comment: Comment = {
            id: newCommentRef.id,
            ...commentData,
            createdAt: new Date()
        };
        
        await setDoc(newCommentRef, comment);
        return comment;
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
            updatedAt: new Date()
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

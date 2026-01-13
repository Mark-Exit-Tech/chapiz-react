import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { app } from './client';

const storage = getStorage(app);

/**
 * Upload a pet image to Firebase Storage
 */
export async function uploadPetImage(file: File, userId: string): Promise<{ success: boolean; downloadURL?: string; error?: string }> {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `petImages/${fileName}`;
        
        const storageRef = ref(storage, filePath);
        const snapshot = await uploadBytes(storageRef, file, {
            cacheControl: 'public, max-age=3600'
        });
        
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return { success: true, downloadURL };
    } catch (error) {
        console.error('Error in uploadPetImage:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Upload a profile image to Firebase Storage
 */
export async function uploadProfileImage(file: File, userId: string): Promise<string> {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `profileImages/${fileName}`;
        
        const storageRef = ref(storage, filePath);
        const snapshot = await uploadBytes(storageRef, file, {
            cacheControl: 'public, max-age=3600'
        });
        
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error('Error in uploadProfileImage:', error);
        throw error;
    }
}

/**
 * Test storage connection
 */
export async function testStorageConnection(): Promise<boolean> {
    try {
        // Try to list files in the root
        const storageRef = ref(storage);
        await listAll(storageRef);
        return true;
    } catch (error) {
        console.error('Storage connection test error:', error);
        return false;
    }
}

/**
 * Delete a pet image from Firebase Storage
 */
export async function deletePetImage(imageUrl: string): Promise<boolean> {
    try {
        // Extract the file path from the URL
        const storageRef = ref(storage, imageUrl);
        await deleteObject(storageRef);
        return true;
    } catch (error) {
        console.error('Error deleting pet image:', error);
        return false;
    }
}

/**
 * Delete a profile image from Firebase Storage
 */
export async function deleteProfileImage(imageUrl: string): Promise<boolean> {
    try {
        const storageRef = ref(storage, imageUrl);
        await deleteObject(storageRef);
        return true;
    } catch (error) {
        console.error('Error deleting profile image:', error);
        return false;
    }
}

/**
 * Upload ad media to Firebase Storage
 */
export async function uploadAdMedia(file: File, adId: string): Promise<{ success: boolean; downloadURL?: string; error?: string }> {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${adId}-${Date.now()}.${fileExt}`;
        const filePath = `adsMedia/${fileName}`;
        
        const storageRef = ref(storage, filePath);
        const snapshot = await uploadBytes(storageRef, file, {
            cacheControl: 'public, max-age=3600'
        });
        
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return { success: true, downloadURL };
    } catch (error) {
        console.error('Error uploading ad media:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Delete ad media from Firebase Storage
 */
export async function deleteAdMedia(mediaUrl: string): Promise<boolean> {
    try {
        const storageRef = ref(storage, mediaUrl);
        await deleteObject(storageRef);
        return true;
    } catch (error) {
        console.error('Error deleting ad media:', error);
        return false;
    }
}

/**
 * Generic upload image function for any path
 */
export async function uploadImage(file: File, customPath: string): Promise<string> {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${customPath}/${fileName}`;
        
        const storageRef = ref(storage, filePath);
        const snapshot = await uploadBytes(storageRef, file, {
            cacheControl: 'public, max-age=3600'
        });
        
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error('Error in uploadImage:', error);
        throw error;
    }
}

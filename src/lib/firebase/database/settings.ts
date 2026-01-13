import { db } from '../client';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface SiteSettings {
  siteName: string;
  email: string;
  phone: string;
  address: string;
  workHours: string;
  logoUrl: string;
  facebook: string;
  instagram: string;
  whatsapp: string;
}

const SETTINGS_DOC_ID = 'site-settings';

/**
 * Get site settings from Firestore
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as SiteSettings;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting site settings:', error);
    return null;
  }
}

/**
 * Save site settings to Firestore
 */
export async function saveSiteSettings(settings: SiteSettings): Promise<boolean> {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    await setDoc(docRef, settings, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving site settings:', error);
    return false;
  }
}

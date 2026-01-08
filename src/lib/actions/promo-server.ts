import { getRandomActiveAd } from './admin';
import { Promo } from '@/types/promo';

/**
 * Server action to fetch a random promo
 * Can be called directly from client components
 */
export async function fetchRandomPromo(): Promise<Promo | null> {
  try {
    // Using the same function as ads for now - this is a stub
    const ad = await getRandomActiveAd();
    if (!ad) return null;
    
    // Convert Ad to Promo format (stub implementation)
    return {
      id: ad.id,
      title: ad.title,
      description: ad.content,
      imageUrl: ad.imageUrl,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Promo;
  } catch (error) {
    console.error('Error in fetchRandomPromo server action:', error);
    return null;
  }
}


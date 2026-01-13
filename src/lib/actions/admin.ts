// Admin functions for Firebase
import { CreateCouponData, UpdateCouponData } from '@/types/coupon';
import { CreateAudienceData, CreateBusinessData, CreatePromoData, UpdateAudienceData, UpdateBusinessData, UpdatePromoData, CreateFilterData, UpdateFilterData } from '@/types/promo';

console.warn('⚠️ Admin actions are using stubs - All functions need Firebase implementation.');

// Type Definitions
export type ContactInfo = {
  email: string;
  phone: string;
  address: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  storeUrl: string;
  androidAppUrl: string;
  iosAppUrl: string;
}

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: Date;
  isRead?: boolean;
}

export type InstallBannerSettings = {
  isEnabled: boolean;
  iosAppId: string;
  androidAppId: string;
  showAfterSeconds: number;
  bannerText: string;
  logoUrl: string;
}

export type CookieSettings = {
  analyticsEnabled: boolean;
  marketingEnabled: boolean;
  necessaryCookiesEnabled: boolean;
  cookieBannerText: string;
  cookiePolicyUrl: string;
}

export type AdStatus = 'active' | 'inactive' | 'pending' | 'scheduled';
export type AdType = 'image' | 'video';

export interface Ad {
  id: string;
  title: string;
  content: string;
  type: AdType;
  status: AdStatus;
  startDate: string | null;
  endDate: string | null;
  phone?: string;
  location?: string;
  description?: string;
  tags?: string[];
  area?: string;
  city?: string[];
  petType?: string;
  breed?: string;
  ageRange?: string[];
  weight?: string[];
  views: number;
  clicks: number;
  duration?: number;
  imageUrl?: string;
  createdAt?: string;
}

// Stub functions that return empty/default values
export async function getDashboardStats() {
  try {
    // Import Firebase functions
    const { getAllUsers } = await import('@/lib/firebase/database/users');
    const { getAllComments } = await import('@/lib/firebase/database/comments');
    const { getAllContactSubmissions } = await import('@/lib/firebase/database/contact');
    
    // Fetch all data in parallel
    const [users, comments, submissions, adsResult] = await Promise.all([
      getAllUsers(),
      getAllComments(),
      getAllContactSubmissions(),
      getAllAds(1, 1000)
    ]);

    // Calculate stats
    const usersByRole: Record<string, number> = {};
    users.forEach(user => {
      usersByRole[user.role] = (usersByRole[user.role] || 0) + 1;
    });

    const adsByStatus: Record<string, number> = {};
    const adsByType: Record<string, number> = {};
    (adsResult.ads || []).forEach((ad: any) => {
      adsByStatus[ad.status] = (adsByStatus[ad.status] || 0) + 1;
      adsByType[ad.type] = (adsByType[ad.type] || 0) + 1;
    });

    // Calculate average rating
    const ratingsWithValues = comments.filter(c => c.rating && c.rating > 0);
    const avgRating = ratingsWithValues.length > 0
      ? (ratingsWithValues.reduce((sum, c) => sum + (c.rating || 0), 0) / ratingsWithValues.length).toFixed(1)
      : '0.0';

    return {
      users: { 
        total: users.length, 
        new: users.filter(u => {
          const created = u.created_at;
          if (!created) return false;
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return new Date(created) > dayAgo;
        }).length,
        byRole: usersByRole 
      },
      ads: { 
        total: adsResult.ads?.length || 0,
        byStatus: adsByStatus,
        byType: adsByType
      },
      pets: { 
        total: 0, // TODO: Implement when pets collection is ready
        new: 0 
      },
      contactSubmissions: { 
        total: submissions.length 
      },
      comments: { 
        total: comments.length 
      },
      rating: { 
        average: avgRating
      }
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      users: { total: 0, new: 0, byRole: {} },
      ads: { total: 0, byStatus: {}, byType: {} },
      pets: { total: 0, new: 0 },
      contactSubmissions: { total: 0 },
      comments: { total: 0 },
      rating: { average: '0.0' }
    };
  }
}

export async function getAllUsers() {
  return [];
}

export async function getUserById(id: string) {
  return null;
}

export async function updateUser(id: string, data: any) {
  console.warn('updateUser stub');
  return { success: true, error: undefined };
}

export async function deleteUser(id: string) {
  console.warn('deleteUser stub');
  return { success: true, error: undefined };
}

export async function updateUserRole(id: string, role: string) {
  console.warn('updateUserRole is a stub - needs Firebase implementation');
  return { success: true, error: undefined };
}

export async function restrictUser(id: string, reason: string) {
  console.warn('restrictUser is a stub - needs Firebase implementation');
  return { success: true, error: undefined };
}

export async function unrestrictUser(id: string) {
  console.warn('unrestrictUser is a stub - needs Firebase implementation');
  return { success: true, error: undefined };
}

export async function addPointsToUser(id: string, points: number, category?: string) {
  console.warn('addPointsToUser is a stub - needs Firebase implementation');
  return { success: true, error: undefined };
}

export async function getAllBusinesses() {
  const { getAllBusinesses: getBusinessesFromDB } = await import('@/lib/firebase/database/businesses');
  return await getBusinessesFromDB();
}

export async function createBusiness(data: CreateBusinessData) {
  console.warn('createBusiness stub');
  return { success: true, error: undefined };
}

export async function updateBusiness(id: string, data: UpdateBusinessData) {
  console.warn('updateBusiness stub');
  return { success: true, error: undefined };
}

export async function deleteBusiness(id: string) {
  console.warn('deleteBusiness stub');
  return { success: true, error: undefined };
}

// Contact info stub
export async function getContactInfo() {
  return {
    email: 'support@facepet.club',
    phone: '+972-50-000-0000',
    address: 'Israel',
    whatsapp: '+972-50-000-0000',
    facebook: 'https://facebook.com/facepet',
    instagram: 'https://instagram.com/facepet',
    storeUrl: 'https://shop.facepet.club'
  };
}

// Mobile app links stub
export async function getMobileAppLinks() {
  return {
    iosAppUrl: 'https://apps.apple.com/app/facepet',
    androidAppUrl: 'https://play.google.com/store/apps/details?id=com.facepet'
  };
}

export async function getInstallBannerSettings(): Promise<InstallBannerSettings> {
  return { isEnabled: false, iosAppId: '', androidAppId: '', showAfterSeconds: 0, bannerText: '', logoUrl: '' };
}

export async function saveInstallBannerSettings(settings: InstallBannerSettings): Promise<{ success: boolean; error?: string }> {
  console.warn('saveInstallBannerSettings stub');
  return { success: true, error: undefined };
}

export async function updateAd(id: string, data: any) {
  return { success: true, error: undefined };
}

export async function deleteAd(id: string) {
  return { success: true, error: undefined };
}

export async function createAd(data: any) {
  return { success: true, error: undefined };
}

export async function createCoupon(data: CreateCouponData) {
  try {
    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase/client');
    
    // Create coupon document
    const couponData = {
      name: data.name,
      description: data.description,
      price: data.price,
      points: data.points,
      imageUrl: data.imageUrl || '',
      validFrom: Timestamp.fromDate(new Date(data.validFrom)),
      validTo: Timestamp.fromDate(new Date(data.validTo)),
      businessIds: data.businessIds || [],
      purchaseLimit: data.purchaseLimit,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: 'admin' // TODO: Get actual admin user ID
    };
    
    const couponsRef = collection(db, 'coupons');
    const docRef = await addDoc(couponsRef, couponData);
    
    console.log('✅ Coupon created successfully:', docRef.id);
    
    return { success: true, couponId: docRef.id, error: undefined };
  } catch (error) {
    console.error('❌ Error creating coupon:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create coupon' 
    };
  }
}

// Create Voucher (same as coupon but in vouchers collection)
export async function createVoucher(data: any) {
  try {
    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase/client');
    
    const voucherData = {
      name: data.name,
      description: data.description,
      price: Number(data.price) || 0,
      points: Number(data.points) || 0,
      imageUrl: data.imageUrl || '',
      validFrom: Timestamp.fromDate(new Date(data.validFrom)),
      validTo: Timestamp.fromDate(new Date(data.validTo)),
      purchaseLimit: Number(data.purchaseLimit) || undefined,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: 'admin'
    };
    
    const vouchersRef = collection(db, 'vouchers');
    const docRef = await addDoc(vouchersRef, voucherData);
    
    console.log('✅ Voucher created successfully:', docRef.id);
    
    return { success: true, voucherId: docRef.id, error: undefined };
  } catch (error) {
    console.error('❌ Error creating voucher:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create voucher' 
    };
  }
}

export async function getCoupons() {
  console.warn('getCoupons is a stub - needs Firebase implementation');
  return {
    success: true,
    coupons: [],
    error: undefined
  };
}

export async function getCouponById(id: string) {
  console.warn('getCouponById is a stub - needs Firebase implementation');
  return {
    success: true,
    coupon: null,
    error: undefined
  };
}

export async function updateCoupon(id: string, data: UpdateCouponData) {
  console.warn('updateCoupon is a stub - needs Firebase implementation');
  return { success: true, error: undefined };
}

export async function deleteCoupon(id: string) {
  console.warn('deleteCoupon is a stub - needs Firebase implementation');
  return { success: true, error: undefined };
}

// Add more stub functions as needed
// TODO: Rewrite all admin functions to use Firebase

export async function getRandomActiveAd(): Promise<Ad | null> {
  console.warn('getRandomActiveAd is a stub - needs Firebase implementation');
  return null;
}

export async function getActiveAdsForServices(serviceType?: string): Promise<Ad[]> {
  const { getActiveAds } = await import('@/lib/firebase/database/advertisements');
  const dbAds = await getActiveAds();
  
  // Convert database Ad format to admin Ad format (Date -> string)
  const ads: Ad[] = dbAds.map(ad => {
    const createdAtValue = ad.createdAt instanceof Date ? ad.createdAt.toISOString() : String(ad.createdAt);
    
    return {
      ...ad,
      startDate: ad.startDate || null,
      endDate: ad.endDate || null,
      createdAt: createdAtValue
    } as Ad;
  });
  
  // Filter by serviceType if provided (could be a tag or other field)
  if (serviceType) {
    return ads.filter(ad => 
      ad.tags?.includes(serviceType) || 
      ad.type === serviceType
    );
  }
  
  return ads;
}

export async function getBusinesses() {
  try {
    const { getAllBusinesses } = await import('@/lib/firebase/database/businesses');
    const businesses = await getAllBusinesses();
    return { success: true, businesses, error: undefined };
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return { success: false, businesses: [], error: String(error) };
  }
}

export async function getBusinessById(id: string) {
  try {
    const { getBusinessById: getBusinessByIdFromDB } = await import('@/lib/firebase/database/businesses');
    return await getBusinessByIdFromDB(id);
  } catch (error) {
    console.error('Error fetching business by ID:', error);
    return null;
  }
}

export async function getPromos() {
  console.warn('getPromos is a stub - needs Firebase implementation');
  return { success: true, promos: [], error: undefined };
}

export async function getPromoById(id: string) {
  console.warn('getPromoById is a stub - needs Firebase implementation');
  return null;
}

export async function getAdById(id: string): Promise<Ad | null> {
  try {
    const { getAdById: getAdByIdFromDB } = await import('@/lib/firebase/database/advertisements');
    const dbAd = await getAdByIdFromDB(id);
    
    if (!dbAd) return null;
    
    // Convert database Ad format to admin Ad format (Date -> string)
    const createdAtValue = dbAd.createdAt instanceof Date ? dbAd.createdAt.toISOString() : String(dbAd.createdAt);
    
    return {
      ...dbAd,
      startDate: dbAd.startDate || null,
      endDate: dbAd.endDate || null,
      createdAt: createdAtValue
    } as Ad;
  } catch (error) {
    console.error('Error fetching ad by ID:', error);
    return null;
  }
}

export async function getAllComments() {
  console.warn('getAllComments is a stub - needs Firebase implementation');
  return [];
}

export async function getAllContactSubmissions() {
  console.warn('getAllContactSubmissions is a stub - needs Firebase implementation');
  return [];
}

export async function getAllPetsForAdmin() {
  console.warn('getAllPetsForAdmin is a stub - needs Firebase implementation');
  return [];
}

// Comment stubs
export async function getCommentsForAd(adId: string) {
  console.warn('getCommentsForAd is a stub - needs Firebase implementation');
  return [];
}

export async function submitComment(data: any) {
  console.warn('submitComment is a stub - needs Firebase implementation');
  return { success: true, error: undefined };
}

export async function getPetsByUserEmail(email: string) {
  try {
    // TODO: Implement with Firebase
    console.warn('getPetsByUserEmail needs Firebase implementation');

    // Fetch pets using Firebase
    const { getPetsByUserEmail: fetchPets } = await import('@/lib/firebase/database/pets');
    const pets = await fetchPets(email);
    
    // Map to Pet interface expected by client
    return pets.map((pet: any) => ({
      id: pet.id,
      name: pet.name,
      type: 'Pet',
      breed: 'Unknown', // TODO: Get breed name from breedId
      gender: 'Unknown', // TODO: Get gender name from genderId
      weight: 'N/A',
      imageUrl: pet.imageUrl,
      ownerName: '',
      ownerId: pet.ownerId || '',
      createdAt: pet.createdAt
    }));
  } catch (error) {
    console.error('Exception in getPetsByUserEmail:', error);
    return [];
  }
}

// Additional stub functions for admin components
export async function createPromo(data: CreatePromoData) {
  return { success: true, error: undefined };
}

export async function updatePromo(id: string, data: UpdatePromoData) {
  return { success: true, error: undefined };
}

export async function deletePromo(id: string) {
  return { success: true, error: undefined };
}

export async function getRecentActivity() {
  try {
    // Import Firebase functions
    const { getAllUsers } = await import('@/lib/firebase/database/users');
    
    // Fetch data
    const [users, adsResult] = await Promise.all([
      getAllUsers(),
      getAllAds(1, 10)
    ]);

    // Get recent users (last 10, sorted by creation date)
    const recentUsers = users
      .filter(u => u.createdAt || u.created_at) // Support both camelCase and snake_case
      .sort((a, b) => {
        const dateA = new Date((a.createdAt || a.created_at)!).getTime();
        const dateB = new Date((b.createdAt || b.created_at)!).getTime();
        return dateB - dateA;
      })
      .slice(0, 10)
      .map(u => ({
        uid: u.uid,
        fullName: u.displayName || u.display_name || u.full_name || u.email.split('@')[0], // Use actual Firestore field names
        email: u.email,
        createdAt: u.createdAt || u.created_at // Dashboard expects createdAt, not joined
      }));

    // Get recent ads
    const recentAds = (adsResult.ads || []).slice(0, 10).map((ad: any) => ({
      title: ad.title,
      status: ad.status,
      type: ad.type,
      createdAt: ad.createdAt
    }));

    return {
      users: recentUsers,
      pets: [], // TODO: Implement when pets collection is ready
      ads: recentAds
    };
  } catch (error) {
    console.error('Error getting recent activity:', error);
    return { users: [], pets: [], ads: [] };
  }
}

export async function getAllAds(page?: number, limit?: number) {
  console.warn('getAllAds is a stub - needs Firebase implementation');
  return { ads: [] };
}

export async function getFilters() {
  console.warn('getFilters is a stub - needs Firebase implementation');
  return { success: true, filters: [], audiences: [], error: undefined };
}

export async function createFilter(data: CreateFilterData) {
  return { success: true, error: undefined };
}

export async function updateFilter(id: string, data: UpdateFilterData) {
  return { success: true, error: undefined };
}

export async function deleteFilter(id: string) {
  return { success: true, error: undefined };
}

export async function bulkDeleteBusinesses(ids: string[]) {
  return { success: true, error: undefined };
}

export async function bulkUpdateBusinesses(ids: string[], data: Partial<UpdateBusinessData>) {
  return { success: true, error: undefined };
}

export async function bulkAssignTags(ids: string[], tagsToAdd: string[], tagsToRemove?: string[]): Promise<{ success: boolean; error?: string }> {
  return { success: true, error: undefined };
}

export async function deleteComment(id: string) {
  return { success: true, error: undefined };
}

export async function saveContactInfo(data: any) {
  return { success: true, error: undefined };
}

export async function updateContactInfo(data: any) {
  return { success: true, error: undefined };
}

export async function deleteContactSubmission(id: string) {
  console.warn('deleteContactSubmission is a stub - needs Firebase implementation');
  return { success: true, error: undefined };
}

export async function updateContactSubmissionReadStatus(id: string, isRead: boolean) {
  console.warn('updateContactSubmissionReadStatus is a stub - needs Firebase implementation');
  return { success: true, error: undefined };
}

export async function createAudience(data: CreateAudienceData) {
  return { success: true, error: undefined };
}

export async function updateAudience(id: string, data: UpdateAudienceData) {
  return { success: true, error: undefined };
}

export async function deleteAudience(id: string) {
  return { success: true, error: undefined };
}

export async function getAudiences() {
  console.warn('getAudiences is a stub - needs Firebase implementation');
  return { success: true, audiences: [], error: undefined };
}

export async function updatePetField(id: string, field: string, value: any) {
  return { success: true, error: undefined };
}

export async function deletePet(id: string): Promise<{ success: boolean; error?: string }> {
  return { success: true, error: undefined };
}

export async function saveCookieSettings(data: CookieSettings): Promise<{ success: boolean; error?: string }> {
  return { success: true, error: undefined };
}

export async function getCookieSettings(): Promise<CookieSettings> {
  return { analyticsEnabled: false, marketingEnabled: false, necessaryCookiesEnabled: true, cookieBannerText: '', cookiePolicyUrl: '/privacy' };
}

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
  address?: string;
  description?: string;
  tags?: string[];
  area?: string;
  city?: string[];
  petType?: string | string[];
  /** Free text when pet type "other" is selected */
  petTypeOther?: string;
  breed?: string | string[];
  ageRange?: string[];
  weight?: string[];
  views: number;
  clicks: number;
  duration?: number;
  imageUrl?: string;
  createdAt?: string;
  coordinates?: { lat: number; lng: number }; // Self-healing geocoded coordinates
}

// Stub functions that return empty/default values
export async function getDashboardStats() {
  try {
    // Import Firebase functions
    const { getAllUsers } = await import('@/lib/firebase/database/users');
    const { getAllComments } = await import('@/lib/firebase/database/comments');
    const { getAllContactSubmissions } = await import('@/lib/firebase/database/contact');
    
    // Fetch all data in parallel
    const { getAllVouchers } = await import('@/lib/firebase/database/vouchers');
    const [users, comments, submissions, adsResult, couponsResult, vouchers] = await Promise.all([
      getAllUsers(),
      getAllComments(),
      getAllContactSubmissions(),
      getAllAds(1, 1000),
      getCoupons(),
      getAllVouchers()
    ]);
    const coupons = couponsResult.success && couponsResult.coupons ? couponsResult.coupons : [];

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
      },
      coupons: { total: coupons.length },
      vouchers: { total: vouchers.length }
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      users: { total: 0, new: 0, byRole: {} },
      ads: { total: 0, byStatus: {}, byType: {} },
      pets: { total: 0, new: 0 },
      contactSubmissions: { total: 0 },
      comments: { total: 0 },
      rating: { average: '0.0' },
      coupons: { total: 0 },
      vouchers: { total: 0 }
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
  try {
    const { updateUser: updateUserInDB } = await import('@/lib/firebase/database/users');
    await updateUserInDB(id, data);
    return { success: true, error: undefined };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: String(error) };
  }
}

export async function deleteUser(id: string) {
  try {
    const { deleteUser: deleteUserFromDB } = await import('@/lib/firebase/database/users');
    await deleteUserFromDB(id);
    return { success: true, error: undefined };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: String(error) };
  }
}

export async function updateUserRole(id: string, role: string) {
  try {
    const { updateUser: updateUserInDB } = await import('@/lib/firebase/database/users');
    await updateUserInDB(id, { role: role as 'user' | 'admin' | 'super_admin' });
    return { success: true, error: undefined };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: String(error) };
  }
}

export async function restrictUser(id: string, reason: string) {
  try {
    const { updateUser: updateUserInDB } = await import('@/lib/firebase/database/users');
    await updateUserInDB(id, { is_restricted: true, restriction_reason: reason });
    return { success: true, error: undefined };
  } catch (error) {
    console.error('Error restricting user:', error);
    return { success: false, error: String(error) };
  }
}

export async function unrestrictUser(id: string) {
  try {
    const { updateUser: updateUserInDB } = await import('@/lib/firebase/database/users');
    await updateUserInDB(id, { is_restricted: false, restriction_reason: '' });
    return { success: true, error: undefined };
  } catch (error) {
    console.error('Error unrestricting user:', error);
    return { success: false, error: String(error) };
  }
}

export async function addPointsToUser(id: string, points: number, category?: string) {
  try {
    const { addPointsToCategory } = await import('@/lib/firebase/database/points');
    // Create a user object with uid for the function
    const user = { uid: id };
    await addPointsToCategory(user, category || 'admin_grant', points);
    return { success: true, error: undefined };
  } catch (error) {
    console.error('Error adding points to user:', error);
    return { success: false, error: String(error) };
  }
}

export async function getAllBusinesses() {
  const { getAllBusinesses: getBusinessesFromDB } = await import('@/lib/firebase/database/businesses');
  return await getBusinessesFromDB();
}

export async function createBusiness(data: CreateBusinessData) {
  try {
    console.log('📝 Admin action: Creating business with data:', data);
    
    const { createBusiness: createBusinessInDB } = await import('@/lib/firebase/database/businesses');
    const business = await createBusinessInDB({
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl || '',
      contactInfo: data.contactInfo,
      tags: data.tags || [],
      filterIds: data.filterIds,
      rating: data.rating,
      isActive: true,
      createdBy: 'admin' // TODO: Get actual user ID from auth
    });
    
    if (!business) {
      console.error('❌ Database returned null - business creation failed');
      return { success: false, error: 'Failed to create business in database. Check console for details.' };
    }
    
    console.log('✅ Business created successfully:', business.id);
    return { success: true, business, error: undefined };
  } catch (error) {
    console.error('❌ Error in createBusiness admin action:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to create business: ${errorMessage}` };
  }
}

export async function updateBusiness(id: string, data: UpdateBusinessData) {
  try {
    const { updateBusiness: updateBusinessInDB } = await import('@/lib/firebase/database/businesses');
    const business = await updateBusinessInDB(id, data);
    
    if (!business) {
      return { success: false, error: 'Failed to update business in database' };
    }
    
    return { success: true, business, error: undefined };
  } catch (error) {
    console.error('Error updating business:', error);
    return { success: false, error: String(error) };
  }
}

export async function deleteBusiness(id: string) {
  try {
    const { deleteBusiness: deleteBusinessFromDB } = await import('@/lib/firebase/database/businesses');
    const success = await deleteBusinessFromDB(id);
    
    if (!success) {
      return { success: false, error: 'Failed to delete business from database' };
    }
    
    return { success: true, error: undefined };
  } catch (error) {
    console.error('Error deleting business:', error);
    return { success: false, error: String(error) };
  }
}

// Contact info - fetched from Firebase settings
export async function getContactInfo() {
  try {
    const { getSiteSettings } = await import('@/lib/firebase/database/settings');
    const settings = await getSiteSettings();

    if (settings) {
      return {
        email: settings.email || '',
        phone: settings.phone || '',
        address: settings.address || '',
        whatsapp: settings.whatsapp || '',
        facebook: settings.facebook || '',
        instagram: settings.instagram || '',
        storeUrl: settings.storeUrl || '',
        androidAppUrl: settings.androidAppUrl || '',
        iosAppUrl: settings.iosAppUrl || ''
      };
    }

    // Fallback to empty values if no settings found
    return {
      email: '',
      phone: '',
      address: '',
      whatsapp: '',
      facebook: '',
      instagram: '',
      storeUrl: '',
      androidAppUrl: '',
      iosAppUrl: ''
    };
  } catch (error) {
    console.error('Error fetching contact info from settings:', error);
    return {
      email: '',
      phone: '',
      address: '',
      whatsapp: '',
      facebook: '',
      instagram: '',
      storeUrl: '',
      androidAppUrl: '',
      iosAppUrl: ''
    };
  }
}

// Mobile app links - fetched from Firebase settings
export async function getMobileAppLinks() {
  try {
    const { getSiteSettings } = await import('@/lib/firebase/database/settings');
    const settings = await getSiteSettings();

    if (settings) {
      return {
        iosAppUrl: settings.iosAppUrl || '',
        androidAppUrl: settings.androidAppUrl || ''
      };
    }

    return {
      iosAppUrl: '',
      androidAppUrl: ''
    };
  } catch (error) {
    console.error('Error fetching mobile app links from settings:', error);
    return {
      iosAppUrl: '',
      androidAppUrl: ''
    };
  }
}

// Legacy stub - kept for backwards compatibility
export async function getMobileAppLinksLegacy() {
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
  try {
    const { updateAd: updateAdInDB } = await import('@/lib/firebase/database/advertisements');
    const ad = await updateAdInDB(id, data);
    
    if (!ad) {
      return { success: false, error: 'Failed to update ad in database' };
    }
    
    return { success: true, ad, error: undefined };
  } catch (error) {
    console.error('Error updating ad:', error);
    return { success: false, error: String(error) };
  }
}

export async function deleteAd(id: string) {
  try {
    const { deleteAd: deleteAdFromDB } = await import('@/lib/firebase/database/advertisements');
    const success = await deleteAdFromDB(id);
    
    if (!success) {
      return { success: false, error: 'Failed to delete ad from database' };
    }
    
    return { success: true, error: undefined };
  } catch (error) {
    console.error('Error deleting ad:', error);
    return { success: false, error: String(error) };
  }
}

export async function createAd(data: any) {
  try {
    const { createAd: createAdInDB } = await import('@/lib/firebase/database/advertisements');
    const ad = await createAdInDB({
      title: data.title,
      content: data.content,
      type: data.type,
      status: data.status || 'active',
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      phone: data.phone,
      location: data.location,
      description: data.description,
      tags: data.tags || [],
      area: data.area,
      city: data.city,
      petType: data.petType,
      petTypeOther: data.petTypeOther,
      breed: data.breed,
      ageRange: data.ageRange,
      weight: data.weight,
      views: 0,
      clicks: 0,
      duration: data.duration || 5
    });
    
    if (!ad) {
      return { success: false, error: 'Failed to create ad in database' };
    }
    
    return { success: true, ad, error: undefined };
  } catch (error) {
    console.error('Error creating ad:', error);
    return { success: false, error: String(error) };
  }
}

/** Validate voucher/coupon dates. Allow validFrom up to 1 day in the past; validTo must be today or future. */
function validateVoucherCouponDates(validFrom: Date | string, validTo: Date | string, isCreate: boolean): string | null {
  const from = new Date(validFrom);
  const to = new Date(validTo);
  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return 'Valid From and Valid To must be valid dates';
  }
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (isCreate) {
    if (from.getTime() < oneDayAgo.getTime()) {
      return 'Valid From date cannot be in the past';
    }
    if (to.getTime() < now.getTime()) {
      return 'Valid To date cannot be in the past';
    }
  } else {
    if (to.getTime() < now.getTime()) {
      return 'Valid To date cannot be in the past';
    }
  }
  if (to.getTime() < from.getTime()) {
    return 'Valid To must be on or after Valid From';
  }
  return null;
}

export async function createCoupon(data: CreateCouponData) {
  try {
    const err = validateVoucherCouponDates(data.validFrom, data.validTo, true);
    if (err) {
      return { success: false, error: err, couponId: undefined };
    }
    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase/client');
    
    const couponData: Record<string, unknown> = {
      name: data.name,
      description: data.description,
      price: data.price,
      points: data.points,
      imageUrl: data.imageUrl || '',
      validFrom: Timestamp.fromDate(new Date(data.validFrom)),
      validTo: Timestamp.fromDate(new Date(data.validTo)),
      businessIds: data.businessIds || [],
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: 'admin'
    };
    const stockVal = (data as { stock?: number | string }).stock;
    if (stockVal !== undefined && stockVal !== null && String(stockVal).trim() !== '' && !isNaN(Number(stockVal))) {
      couponData.stock = Math.max(0, Number(stockVal));
    }
    if (data.purchaseLimit !== undefined && data.purchaseLimit !== null && !isNaN(Number(data.purchaseLimit))) {
      couponData.purchaseLimit = Number(data.purchaseLimit);
    }
    
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
    const err = validateVoucherCouponDates(data.validFrom, data.validTo, true);
    if (err) {
      return { success: false, error: err, voucherId: undefined };
    }
    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase/client');
    
    const voucherData: any = {
      name: data.name,
      description: data.description,
      price: Number(data.price) || 0,
      points: Number(data.points) || 0,
      imageUrl: data.imageUrl || '',
      validFrom: Timestamp.fromDate(new Date(data.validFrom)),
      validTo: Timestamp.fromDate(new Date(data.validTo)),
      businessIds: data.businessIds || [],
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: 'admin'
    };
    if (data.stock !== undefined && data.stock !== '' && !isNaN(Number(data.stock))) {
      voucherData.stock = Math.max(0, Number(data.stock));
    }
    if (data.purchaseLimit && !isNaN(Number(data.purchaseLimit))) {
      voucherData.purchaseLimit = Number(data.purchaseLimit);
    }
    
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
  try {
    const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase/client');
    
    const couponsRef = collection(db, 'coupons');
    const q = query(couponsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const coupons = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        description: data.description || '',
        price: data.price || 0,
        points: data.points || 0,
        imageUrl: data.imageUrl || '',
        validFrom: data.validFrom?.toDate ? data.validFrom.toDate() : new Date(data.validFrom || Date.now()),
        validTo: data.validTo?.toDate ? data.validTo.toDate() : new Date(data.validTo || Date.now()),
        isActive: data.isActive !== undefined ? data.isActive : true,
        stock: data.stock,
        businessId: data.businessId,
        businessIds: data.businessIds,
        purchaseLimit: data.purchaseLimit,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
        createdBy: data.createdBy || ''
      };
    });
    
    return {
      success: true,
      coupons,
      error: undefined
    };
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return {
      success: false,
      coupons: [],
      error: String(error)
    };
  }
}

export async function getCouponById(id: string) {
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase/client');
    
    const couponRef = doc(db, 'coupons', id);
    const couponDoc = await getDoc(couponRef);
    
    if (!couponDoc.exists()) {
      return {
        success: false,
        coupon: null,
        error: 'Coupon not found'
      };
    }
    
    return {
      success: true,
      coupon: { id: couponDoc.id, ...couponDoc.data() },
      error: undefined
    };
  } catch (error) {
    console.error('Error fetching coupon:', error);
    return {
      success: false,
      coupon: null,
      error: String(error)
    };
  }
}

export async function updateCoupon(id: string, data: UpdateCouponData) {
  try {
    if (data.validFrom != null && data.validTo != null) {
      const err = validateVoucherCouponDates(data.validFrom, data.validTo, false);
      if (err) {
        return { success: false, error: err };
      }
    } else if (data.validTo != null) {
      const to = new Date(data.validTo);
      if (to.getTime() < Date.now()) {
        return { success: false, error: 'Valid To date cannot be in the past' };
      }
    }
    const { doc, updateDoc, Timestamp, deleteField } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase/client');

    const couponRef = doc(db, 'coupons', id);
    const updateData: any = {};

    // Only include defined fields
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.points !== undefined) updateData.points = data.points;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.businessIds !== undefined) updateData.businessIds = data.businessIds;
    if ((data as any).isActive !== undefined) updateData.isActive = (data as any).isActive;

    // Convert date strings to Timestamps if present
    if (data.validFrom) {
      updateData.validFrom = Timestamp.fromDate(new Date(data.validFrom));
    }
    if (data.validTo) {
      updateData.validTo = Timestamp.fromDate(new Date(data.validTo));
    }

    // Handle stock - use deleteField() to remove if empty
    const stockVal = (data as { stock?: number | string }).stock;
    if (stockVal !== undefined && stockVal !== null && String(stockVal).trim() !== '' && !isNaN(Number(stockVal))) {
      updateData.stock = Math.max(0, Number(stockVal));
    } else if ((data as any).hasOwnProperty('stock')) {
      updateData.stock = deleteField();
    }

    // Handle purchaseLimit - use deleteField() to remove if empty
    const purchaseLimitVal = (data as any).purchaseLimit;
    if (purchaseLimitVal !== undefined && purchaseLimitVal !== null && String(purchaseLimitVal).trim() !== '' && !isNaN(Number(purchaseLimitVal))) {
      updateData.purchaseLimit = Number(purchaseLimitVal);
    } else if ((data as any).hasOwnProperty('purchaseLimit')) {
      updateData.purchaseLimit = deleteField();
    }

    updateData.updatedAt = Timestamp.now();

    await updateDoc(couponRef, updateData);
    return { success: true, error: undefined };
  } catch (error) {
    console.error('Error updating coupon:', error);
    return { success: false, error: String(error) };
  }
}

export async function deleteCoupon(id: string) {
  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase/client');

    const couponRef = doc(db, 'coupons', id);
    await deleteDoc(couponRef);
    return { success: true, error: undefined };
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return { success: false, error: String(error) };
  }
}

export async function deleteVoucher(id: string) {
  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase/client');

    const voucherRef = doc(db, 'vouchers', id);
    await deleteDoc(voucherRef);
    return { success: true, error: undefined };
  } catch (error) {
    console.error('Error deleting voucher:', error);
    return { success: false, error: String(error) };
  }
}

export async function updateVoucher(id: string, data: any) {
  try {
    if (data.validFrom != null && data.validTo != null) {
      const err = validateVoucherCouponDates(data.validFrom, data.validTo, false);
      if (err) {
        return { success: false, error: err };
      }
    } else if (data.validTo != null) {
      const to = new Date(data.validTo);
      if (to.getTime() < Date.now()) {
        return { success: false, error: 'Valid To date cannot be in the past' };
      }
    }
    const { doc, updateDoc, Timestamp } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase/client');

    const voucherRef = doc(db, 'vouchers', id);

    const updateData: any = {
      ...data,
      updatedAt: Timestamp.now()
    };

    // Convert date strings to Timestamps
    if (data.validFrom) {
      updateData.validFrom = Timestamp.fromDate(new Date(data.validFrom));
    }
    if (data.validTo) {
      updateData.validTo = Timestamp.fromDate(new Date(data.validTo));
    }

    // Convert numeric fields
    if (data.price !== undefined) {
      updateData.price = Number(data.price);
    }
    if (data.points !== undefined) {
      updateData.points = Number(data.points);
    }
    if (data.purchaseLimit !== undefined && data.purchaseLimit !== '') {
      updateData.purchaseLimit = Number(data.purchaseLimit);
    }
    if (data.stock !== undefined && data.stock !== '') {
      updateData.stock = Math.max(0, Number(data.stock));
    } else if (data.stock === '' || data.hasOwnProperty('stock')) {
      updateData.stock = undefined; // clear = unlimited
    }

    await updateDoc(voucherRef, updateData);
    console.log('✅ Voucher updated successfully:', id);
    return { success: true, error: undefined };
  } catch (error) {
    console.error('❌ Error updating voucher:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update voucher'
    };
  }
}

// Add more stub functions as needed
// TODO: Rewrite all admin functions to use Firebase

export async function getRandomActiveAd(): Promise<Ad | null> {
  try {
    const { getActiveAds } = await import('@/lib/firebase/database/advertisements');
    const activeAds = await getActiveAds();

    if (activeAds.length === 0) {
      console.log('[getRandomActiveAd] No active ads available');
      return null;
    }

    // Get a random ad from the active ads
    const randomIndex = Math.floor(Math.random() * activeAds.length);
    const randomAd = activeAds[randomIndex];

    console.log('[getRandomActiveAd] Selected random ad:', randomAd.id, randomAd.title);

    // Convert database Ad format to admin Ad format (Date -> string)
    const ad: Ad = {
      ...randomAd,
      startDate: randomAd.startDate || null,
      endDate: randomAd.endDate || null,
      createdAt: randomAd.createdAt instanceof Date ? randomAd.createdAt.toISOString() : String(randomAd.createdAt)
    };

    return ad;
  } catch (error) {
    console.error('[getRandomActiveAd] Error fetching random ad:', error);
    return null;
  }
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
  try {
    const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase/client');
    
    const promosRef = collection(db, 'promos');
    const q = query(promosRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const promos = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        description: data.description || '',
        imageUrl: data.imageUrl || '',
        youtubeUrl: data.youtubeUrl,
        businessId: data.businessId,
        businessIds: data.businessIds,
        isActive: data.isActive !== undefined ? data.isActive : true,
        startDate: data.startDate?.toDate ? data.startDate.toDate() : (data.startDate ? new Date(data.startDate) : undefined),
        endDate: data.endDate?.toDate ? data.endDate.toDate() : (data.endDate ? new Date(data.endDate) : undefined),
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
        createdBy: data.createdBy || ''
      };
    });
    
    return { success: true, promos, error: undefined };
  } catch (error) {
    console.error('Error fetching promos:', error);
    return { success: false, promos: [], error: String(error) };
  }
}

export async function getPromoById(id: string) {
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase/client');
    
    const promoRef = doc(db, 'promos', id);
    const promoDoc = await getDoc(promoRef);
    
    if (!promoDoc.exists()) {
      return null;
    }
    
    return { id: promoDoc.id, ...promoDoc.data() };
  } catch (error) {
    console.error('Error fetching promo:', error);
    return null;
  }
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
  try {
    const { getAllComments: getAllCommentsFromDB } = await import('@/lib/firebase/database/comments');
    return await getAllCommentsFromDB();
  } catch (error) {
    console.error('Error fetching all comments:', error);
    return [];
  }
}

export async function getAllContactSubmissions() {
  try {
    const { getAllContactSubmissions: getAllContactSubmissionsFromDB } = await import('@/lib/firebase/database/contact');
    return await getAllContactSubmissionsFromDB();
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return [];
  }
}

export async function getAllPetsForAdmin() {
  try {
    const { getAllPets } = await import('@/lib/firebase/database/pets');
    return await getAllPets();
  } catch (error) {
    console.error('Error fetching all pets:', error);
    return [];
  }
}

// Comment stubs
export async function getCommentsForAd(adId: string) {
  try {
    const { getCommentsForAd: getCommentsFromDB } = await import('@/lib/firebase/database/comments');
    return await getCommentsFromDB(adId);
  } catch (error) {
    console.error('Error fetching comments for ad:', error);
    return [];
  }
}

export async function submitComment(data: any) {
  try {
    const { createComment } = await import('@/lib/firebase/database/comments');
    const comment = await createComment(data);
    if (!comment) {
      return { success: false, error: 'Failed to create comment' };
    }
    return { success: true, error: undefined };
  } catch (error) {
    console.error('Error submitting comment:', error);
    return { success: false, error: String(error) };
  }
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
  try {
    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase/client');
    
    const promoData = {
      ...data,
      isActive: true, // Always active by default for new promos
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: 'admin' // TODO: Get actual admin user ID
    };
    
    const promosRef = collection(db, 'promos');
    const docRef = await addDoc(promosRef, promoData);
    
    return { success: true, promoId: docRef.id, error: undefined };
  } catch (error) {
    console.error('Error creating promo:', error);
    return { success: false, error: String(error) };
  }
}

export async function updatePromo(id: string, data: UpdatePromoData) {
  try {
    const { doc, updateDoc, Timestamp } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase/client');
    
    const promoRef = doc(db, 'promos', id);
    await updateDoc(promoRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
    
    return { success: true, error: undefined };
  } catch (error) {
    console.error('Error updating promo:', error);
    return { success: false, error: String(error) };
  }
}

export async function deletePromo(id: string) {
  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase/client');
    
    const promoRef = doc(db, 'promos', id);
    await deleteDoc(promoRef);
    
    return { success: true, error: undefined };
  } catch (error) {
    console.error('Error deleting promo:', error);
    return { success: false, error: String(error) };
  }
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

export async function getAllAds(page: number = 1, limit: number = 1000) {
  try {
    const { getAllAds: getAllAdsFromDB } = await import('@/lib/firebase/database/advertisements');
    const allAds = await getAllAdsFromDB();
    
    // Convert Date objects to strings for serialization
    const ads = allAds.map(ad => ({
      ...ad,
      createdAt: ad.createdAt instanceof Date ? ad.createdAt.toISOString() : ad.createdAt
    }));
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAds = ads.slice(startIndex, endIndex);
    
    return {
      ads: paginatedAds,
      total: ads.length,
      page,
      limit
    };
  } catch (error) {
    console.error('Error fetching all ads:', error);
    return { ads: [], total: 0, page, limit };
  }
}

export async function getFilters() {
  try {
    const { getAllFilters } = await import('@/lib/firebase/database/filters');
    const { getAllAudiences } = await import('@/lib/firebase/database/audiences');
    
    const [filters, audiences] = await Promise.all([
      getAllFilters(),
      getAllAudiences()
    ]);
    
    return { success: true, filters, audiences, error: undefined };
  } catch (error) {
    console.error('Error fetching filters and audiences:', error);
    return { success: false, filters: [], audiences: [], error: String(error) };
  }
}

export async function createFilter(data: CreateFilterData) {
  try {
    const { createFilter: createFilterInDB } = await import('@/lib/firebase/database/filters');
    // Convert CreateFilterData to match database Filter structure
    const filterData = {
      name: data.name,
      type: 'petType' as const, // Default type, should be provided in data
      values: [] as string[], // Empty array, should be provided in data
      audienceIds: [] as string[],
      isActive: true,
      createdBy: 'admin'
    };
    const filter = await createFilterInDB(filterData);
    
    if (!filter) {
      return { success: false, error: 'Failed to create filter' };
    }
    
    return { success: true, filter, error: undefined };
  } catch (error) {
    console.error('Error creating filter:', error);
    return { success: false, error: String(error) };
  }
}

export async function updateFilter(id: string, data: UpdateFilterData) {
  try {
    const { updateFilter: updateFilterInDB } = await import('@/lib/firebase/database/filters');
    const filter = await updateFilterInDB(id, data);
    
    if (!filter) {
      return { success: false, error: 'Failed to update filter' };
    }
    
    return { success: true, filter, error: undefined };
  } catch (error) {
    console.error('Error updating filter:', error);
    return { success: false, error: String(error) };
  }
}

export async function deleteFilter(id: string) {
  try {
    const { deleteFilter: deleteFilterFromDB } = await import('@/lib/firebase/database/filters');
    const success = await deleteFilterFromDB(id);
    
    if (!success) {
      return { success: false, error: 'Failed to delete filter' };
    }
    
    return { success: true, error: undefined };
  } catch (error) {
    console.error('Error deleting filter:', error);
    return { success: false, error: String(error) };
  }
}

export async function bulkDeleteBusinesses(ids: string[]) {
  try {
    const { deleteBusiness: deleteBusinessFromDB } = await import('@/lib/firebase/database/businesses');
    
    // Delete all businesses in parallel
    const deletePromises = ids.map(id => deleteBusinessFromDB(id));
    const results = await Promise.all(deletePromises);
    
    // Check if all deletions were successful
    const allSuccessful = results.every(result => result === true);
    
    if (!allSuccessful) {
      return { success: false, error: 'Some businesses failed to delete' };
    }
    
    return { success: true, error: undefined };
  } catch (error) {
    console.error('Error bulk deleting businesses:', error);
    return { success: false, error: String(error) };
  }
}

export async function bulkUpdateBusinesses(ids: string[], data: Partial<UpdateBusinessData>) {
  try {
    const { updateBusiness: updateBusinessInDB } = await import('@/lib/firebase/database/businesses');
    
    // Update all businesses in parallel
    const updatePromises = ids.map(id => updateBusinessInDB(id, data));
    const results = await Promise.all(updatePromises);
    
    // Check if all updates were successful
    const allSuccessful = results.every(result => result !== null);
    
    if (!allSuccessful) {
      return { success: false, error: 'Some businesses failed to update' };
    }
    
    return { success: true, error: undefined };
  } catch (error) {
    console.error('Error bulk updating businesses:', error);
    return { success: false, error: String(error) };
  }
}

export async function bulkAssignTags(ids: string[], tagsToAdd: string[], tagsToRemove?: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const { getBusinessById, updateBusiness: updateBusinessInDB } = await import('@/lib/firebase/database/businesses');
    
    // Process each business
    const updatePromises = ids.map(async (id) => {
      const business = await getBusinessById(id);
      if (!business) return false;
      
      let newTags = [...(business.tags || [])];
      
      // Add new tags
      if (tagsToAdd.length > 0) {
        tagsToAdd.forEach(tag => {
          if (!newTags.includes(tag)) {
            newTags.push(tag);
          }
        });
      }
      
      // Remove tags
      if (tagsToRemove && tagsToRemove.length > 0) {
        newTags = newTags.filter(tag => !tagsToRemove.includes(tag));
      }
      
      const result = await updateBusinessInDB(id, { tags: newTags });
      return result !== null;
    });
    
    const results = await Promise.all(updatePromises);
    const allSuccessful = results.every(result => result === true);
    
    if (!allSuccessful) {
      return { success: false, error: 'Some businesses failed to update tags' };
    }
    
    return { success: true, error: undefined };
  } catch (error) {
    console.error('Error bulk assigning tags:', error);
    return { success: false, error: String(error) };
  }
}

export async function deleteComment(id: string) {
  try {
    const { deleteComment: deleteCommentFromDB } = await import('@/lib/firebase/database/comments');
    const success = await deleteCommentFromDB(id);
    
    if (!success) {
      return { success: false, error: 'Failed to delete comment' };
    }
    
    return { success: true, error: undefined };
  } catch (error) {
    console.error('Error deleting comment:', error);
    return { success: false, error: String(error) };
  }
}

export async function saveContactInfo(data: any) {
  try {
    const { saveSiteSettings } = await import('@/lib/firebase/database/settings');

    // Map the form data to SiteSettings format
    const settings = {
      siteName: data.siteName || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      workHours: data.workHours || '',
      logoUrl: data.logoUrl || '',
      facebook: data.facebook || '',
      instagram: data.instagram || '',
      whatsapp: data.whatsapp || '',
      storeUrl: data.storeUrl || '',
      androidAppUrl: data.androidAppUrl || '',
      iosAppUrl: data.iosAppUrl || ''
    };

    const success = await saveSiteSettings(settings as any);

    if (success) {
      return { success: true, error: undefined };
    } else {
      return { success: false, error: 'Failed to save settings' };
    }
  } catch (error) {
    console.error('Error saving contact info:', error);
    return { success: false, error: String(error) };
  }
}

export async function updateContactInfo(data: any) {
  // Use the same function as saveContactInfo
  return saveContactInfo(data);
}

export async function deleteContactSubmission(id: string) {
  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase/client');
    
    const submissionRef = doc(db, 'contactSubmissions', id);
    await deleteDoc(submissionRef);
    return { success: true, error: undefined };
  } catch (error) {
    console.error('Error deleting contact submission:', error);
    return { success: false, error: String(error) };
  }
}

export async function updateContactSubmissionReadStatus(id: string, isRead: boolean) {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase/client');
    
    const submissionRef = doc(db, 'contactSubmissions', id);
    await updateDoc(submissionRef, { read: isRead });
    return { success: true, error: undefined };
  } catch (error) {
    console.error('Error updating contact submission read status:', error);
    return { success: false, error: String(error) };
  }
}

export async function createAudience(data: CreateAudienceData) {
  try {
    const { createAudience: createAudienceInDB } = await import('@/lib/firebase/database/audiences');
    const audienceData = {
      ...data,
      isActive: true,
      createdBy: 'admin'
    };
    const audience = await createAudienceInDB(audienceData);
    
    if (!audience) {
      return { success: false, error: 'Failed to create audience' };
    }
    
    return { success: true, audience, error: undefined };
  } catch (error) {
    console.error('Error creating audience:', error);
    return { success: false, error: String(error) };
  }
}

export async function updateAudience(id: string, data: UpdateAudienceData) {
  try {
    const { updateAudience: updateAudienceInDB } = await import('@/lib/firebase/database/audiences');
    const audience = await updateAudienceInDB(id, data);
    
    if (!audience) {
      return { success: false, error: 'Failed to update audience' };
    }
    
    return { success: true, audience, error: undefined };
  } catch (error) {
    console.error('Error updating audience:', error);
    return { success: false, error: String(error) };
  }
}

export async function deleteAudience(id: string) {
  try {
    const { deleteAudience: deleteAudienceFromDB } = await import('@/lib/firebase/database/audiences');
    const success = await deleteAudienceFromDB(id);
    
    if (!success) {
      return { success: false, error: 'Failed to delete audience' };
    }
    
    return { success: true, error: undefined };
  } catch (error) {
    console.error('Error deleting audience:', error);
    return { success: false, error: String(error) };
  }
}

export async function getAudiences() {
  try {
    const { getAllAudiences } = await import('@/lib/firebase/database/audiences');
    const audiences = await getAllAudiences();
    return { success: true, audiences, error: undefined };
  } catch (error) {
    console.error('Error fetching audiences:', error);
    return { success: false, audiences: [], error: String(error) };
  }
}

export async function updatePetField(id: string, field: string, value: any) {
  try {
    const { updatePetInFirestore } = await import('@/lib/firebase/database/pets');
    const result = await updatePetInFirestore(id, { [field]: value });
    
    if (!result.success) {
      return { success: false, error: result.error || 'Failed to update pet' };
    }
    
    return { success: true, error: undefined };
  } catch (error) {
    console.error('Error updating pet field:', error);
    return { success: false, error: String(error) };
  }
}

export async function deletePet(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { deletePetFromFirestore } = await import('@/lib/firebase/database/pets');
    const result = await deletePetFromFirestore(id);
    
    if (!result.success) {
      return { success: false, error: result.error || 'Failed to delete pet' };
    }
    
    return { success: true, error: undefined };
  } catch (error) {
    console.error('Error deleting pet:', error);
    return { success: false, error: String(error) };
  }
}

export async function saveCookieSettings(data: CookieSettings): Promise<{ success: boolean; error?: string }> {
  return { success: true, error: undefined };
}

export async function getCookieSettings(): Promise<CookieSettings> {
  return { analyticsEnabled: false, marketingEnabled: false, necessaryCookiesEnabled: true, cookieBannerText: '', cookiePolicyUrl: '/privacy' };
}

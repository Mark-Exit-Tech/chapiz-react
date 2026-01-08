// TEMPORARY STUB FILE
// All admin functions need to be rewritten to use Supabase
// This file exists only to prevent build errors

import { CreateCouponData, UpdateCouponData } from '@/types/coupon';
import { CreateAudienceData, CreateBusinessData, CreatePromoData, UpdateAudienceData, UpdateBusinessData, UpdatePromoData, CreateFilterData, UpdateFilterData } from '@/types/promo';
import { createServerClient } from '@/lib/supabase/server';

console.warn('⚠️ Admin actions are using stubs - All functions need Supabase implementation.');

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
  return {
    users: { total: 0, new: 0, byRole: {} },
    ads: { total: 0, byStatus: {}, byType: {} },
    pets: { total: 0, new: 0 },
    contactSubmissions: { total: 0 },
    comments: { total: 0 },
    rating: { average: '0.0' }
  };
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
  console.warn('updateUserRole is a stub using Supabase');
  return { success: true, error: undefined };
}

export async function restrictUser(id: string, reason: string) {
  console.warn('restrictUser is a stub using Supabase');
  return { success: true, error: undefined };
}

export async function unrestrictUser(id: string) {
  console.warn('unrestrictUser is a stub using Supabase');
  return { success: true, error: undefined };
}

export async function addPointsToUser(id: string, points: number, category?: string) {
  console.warn('addPointsToUser is a stub using Supabase');
  return { success: true, error: undefined };
}

export async function getAllBusinesses() {
  return [];
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

export type InstallBannerSettings = {
  isEnabled: boolean;
  iosAppId: string;
  androidAppId: string;
  showAfterSeconds: number;
  bannerText: string;
  logoUrl: string;
}

export async function getInstallBannerSettings(): Promise<InstallBannerSettings> {
  return { isEnabled: false, iosAppId: '', androidAppId: '', showAfterSeconds: 0, bannerText: '', logoUrl: '' };
}

export async function saveInstallBannerSettings(settings: InstallBannerSettings) {
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
  return { success: true, error: undefined };
}

export async function getCoupons() {
  console.warn('getCoupons is a stub using Supabase');
  return {
    success: true,
    coupons: [],
    error: undefined
  };
}

export async function getCouponById(id: string) {
  console.warn('getCouponById is a stub using Supabase');
  return {
    success: true,
    coupon: null,
    error: undefined
  };
}

export async function updateCoupon(id: string, data: UpdateCouponData) {
  console.warn('updateCoupon is a stub using Supabase');
  return { success: true, error: undefined };
}

export async function deleteCoupon(id: string) {
  console.warn('deleteCoupon is a stub using Supabase');
  return { success: true, error: undefined };
}

// Add more stub functions as needed
// TODO: Rewrite all admin functions to use Supabase

export async function getRandomActiveAd(): Promise<Ad | null> {
  console.warn('getRandomActiveAd is a stub using Supabase');
  return null;
}

export async function getActiveAdsForServices(serviceType?: string): Promise<Ad[]> {
  console.warn('getActiveAdsForServices is a stub using Supabase');
  return [];
}

export async function getBusinesses() {
  console.warn('getBusinesses is a stub using Supabase');
  return { success: true, businesses: [], error: undefined };
}

export async function getBusinessById(id: string) {
  console.warn('getBusinessById is a stub using Supabase');
  return null;
}

export async function getPromos() {
  console.warn('getPromos is a stub using Supabase');
  return { success: true, promos: [], error: undefined };
}

export async function getPromoById(id: string) {
  console.warn('getPromoById is a stub using Supabase');
  return null;
}

export async function getAdById(id: string) {
  console.warn('getAdById is a stub using Supabase');
  return null;
}

export async function getAllComments() {
  console.warn('getAllComments is a stub using Supabase');
  return [];
}

export async function getAllContactSubmissions() {
  console.warn('getAllContactSubmissions is a stub using Supabase');
  return [];
}

export async function getAllPetsForAdmin() {
  console.warn('getAllPetsForAdmin is a stub using Supabase');
  return [];
}

// Comment stubs
export async function getCommentsForAd(adId: string) {
  console.warn('getCommentsForAd is a stub using Supabase');
  return [];
}

export async function submitComment(data: any) {
  console.warn('submitComment is a stub using Supabase');
  return { success: true, error: undefined };
}

export async function getPetsByUserEmail(email: string) {
  try {
    const supabase = await createServerClient();

    // Fetch pets with breed and gender joins
    const { data: pets, error } = await supabase
      .from('pets')
      .select(`
        *,
        breed:breeds(en, he),
        gender:genders(en, he)
      `)
      .eq('user_email', email);

    if (error) {
      console.error('Error fetching pets:', error);
      return [];
    }

    // Map to Pet interface expected by client
    return (pets || []).map((pet: any) => ({
      id: pet.id,
      name: pet.name,
      type: 'Pet', // Type information is currently missing in schema association
      breed: pet.breed?.en || 'Unknown',
      gender: pet.gender?.en || 'Unknown',
      weight: 'N/A', // Weight is missing in schema
      imageUrl: pet.image_url,
      ownerName: '', // Not needed as we filtering by user and hiding owner column
      ownerId: pet.owner_id || '',
      createdAt: new Date(pet.created_at)
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
  console.warn('getRecentActivity is a stub using Supabase');
  return { users: [], pets: [], ads: [] };
}

export async function getAllAds(page?: number, limit?: number) {
  console.warn('getAllAds is a stub using Supabase');
  return { ads: [] };
}

export async function getFilters() {
  console.warn('getFilters is a stub using Supabase');
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

export async function bulkAssignTags(ids: string[], tags: string[]) {
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
  console.warn('deleteContactSubmission is a stub using Supabase');
  return { success: true, error: undefined };
}

export async function updateContactSubmissionReadStatus(id: string, isRead: boolean) {
  console.warn('updateContactSubmissionReadStatus is a stub using Supabase');
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
  console.warn('getAudiences is a stub using Supabase');
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

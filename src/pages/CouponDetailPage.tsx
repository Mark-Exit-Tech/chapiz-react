import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPromoById, getBusinesses } from '@/lib/actions/admin';
import CouponViewPageClient from '@/components/pages/CouponViewPageClient';
import Navbar from '@/components/layout/Navbar';
import BottomNavigation from '@/components/layout/BottomNavigation';

export default function CouponDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [coupon, setCoupon] = useState<any>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';
  
  const text = {
    loading: isHebrew ? 'טוען...' : 'Loading...',
    notFound: isHebrew ? 'קופון לא נמצא' : 'Coupon not found',
    goBack: isHebrew ? 'חזור' : 'Go Back',
  };

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Load coupon
        const couponData = await getPromoById(id);
        
        if (couponData) {
          setCoupon(couponData);
          
          // Load businesses
          const businessesResult = await getBusinesses();
          if (businessesResult && Array.isArray(businessesResult)) {
            // Filter businesses that accept this coupon
            const businessIds = (couponData as any).businessIds || ((couponData as any).businessId ? [(couponData as any).businessId] : []);
            const relatedBusinesses = businessesResult.filter((b: any) => businessIds.includes(b.id));
            setBusinesses(relatedBusinesses);
          }
        }
      } catch (error) {
        console.error('Error loading coupon:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">{text.loading}</p>
            </div>
          </div>
        </div>
        <div className="md:hidden">
          <BottomNavigation />
        </div>
      </>
    );
  }

  if (!coupon) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{text.notFound}</h1>
            <button
              onClick={() => window.history.back()}
              className="text-primary hover:underline"
            >
              {text.goBack}
            </button>
          </div>
        </div>
        <div className="md:hidden">
          <BottomNavigation />
        </div>
      </>
    );
  }

  return (
    <>
      <CouponViewPageClient 
        coupon={coupon} 
        business={null}
        businesses={businesses}
      />
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </>
  );
}

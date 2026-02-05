'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Tag, MapPin, QrCode, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import { getCoupons, getBusinesses } from '@/lib/actions/admin';
import { useTranslation } from 'react-i18next';
import { Coupon } from '@/types/coupon';
import MapCard from '@/components/cards/MapCard';
import { getCouponHistory, UserCoupon } from '@/lib/firebase/database/coupons';

type Business = any;

interface PromosPageClientProps {
  business?: Business | null;
  initialBusinesses?: Business[];
}

export default function PromosPageClient({
  business = null,
  initialBusinesses = []
}: PromosPageClientProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { i18n } = useTranslation();

  // Get locale from i18n (works correctly on root path without locale prefix)
  const locale = i18n.language || 'en';
  const isHebrew = locale === 'he';

  // HARDCODED TEXT - NO TRANSLATION KEYS!
  const text = {
    loading: isHebrew ? 'טוען...' : 'Loading...',
    title: isHebrew ? 'קופונים' : 'Coupons',
    description: isHebrew ? 'קופונים מעסקים שונים' : 'Coupons from various businesses',
    noCoupons: isHebrew ? 'אין קופונים זמינים' : 'No coupons available',
    noUsedCoupons: isHebrew ? 'אין קופונים משומשים' : 'No used coupons',
    viewCoupon: isHebrew ? 'צפה בקופון' : 'View Coupon',
    showMap: isHebrew ? 'הצג במפה' : 'Show Map',
    validUntil: isHebrew ? 'תקף עד' : 'Valid until',
    acceptedAt: isHebrew ? 'תקף ב' : 'Accepted at',
    mapFor: isHebrew ? 'מפה עבור' : 'Map for',
    noBusinessesFound: isHebrew ? 'לא נמצאו עסקים עבור קופון זה' : 'No businesses found for this coupon',
    points: isHebrew ? 'נקודות' : 'Points',
    available: isHebrew ? 'זמין' : 'Available',
    used: isHebrew ? 'משומש' : 'Used',
    usedOn: isHebrew ? 'נוצל בתאריך' : 'Used on',
    removeFilter: isHebrew ? 'הסר סינון' : 'Remove Filter',
    couponsForBusiness: (name: string) => (isHebrew ? `קופונים עבור ${name}` : `Coupons for ${name}`),
    couponsForSelectedBusiness: isHebrew ? 'קופונים לעסק הנבחר' : 'Coupons for selected business',
  };

  const [searchParams] = useSearchParams();
  const businessIdFromUrl = searchParams.get('businessId');

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [usedCoupons, setUsedCoupons] = useState<UserCoupon[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  // Load all coupons and businesses from Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load all coupons from admin collection
        const couponsResult = await getCoupons();
        let activeCoupons: Coupon[] = [];
        if (couponsResult.success && couponsResult.coupons) {
          const now = new Date();
          // Filter to only show active coupons that are not expired
          activeCoupons = couponsResult.coupons.filter((c: Coupon) => {
            if (!c.isActive) return false;
            // Check if coupon is expired
            if (c.validTo) {
              const validTo = new Date(c.validTo);
              if (validTo < now) return false;
            }
            return true;
          });
          console.log('✅ Loaded active non-expired coupons:', activeCoupons.length);
        } else {
          console.error('Failed to load coupons:', couponsResult.error);
        }

        // Load businesses
        const businessesResult = await getBusinesses();
        if (businessesResult?.success && Array.isArray(businessesResult.businesses)) {
          setBusinesses(businessesResult.businesses);
          console.log('✅ Loaded businesses:', businessesResult.businesses.length);
        }

        // Load used coupons if user is logged in
        let usedCouponIds: string[] = [];
        if (user) {
          const historyResult = await getCouponHistory(user.uid);
          if (historyResult.success && historyResult.coupons) {
            // Filter only used coupons
            const used = historyResult.coupons.filter(uc => uc.status === 'used');
            setUsedCoupons(used);
            // Get IDs of used coupons to exclude from available list
            usedCouponIds = used.map(uc => uc.couponId);
            console.log('✅ Loaded used coupons:', used.length);
          }
        }

        // Filter out used coupons from available coupons
        let availableCoupons = activeCoupons.filter(c => !usedCouponIds.includes(c.id));
        setCoupons(availableCoupons);
        console.log('✅ Available coupons (excluding used):', availableCoupons.length);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error(text.noCoupons);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Filter coupons by businessId when coming from service detail link
  const filteredCoupons = useMemo(() => {
    if (!businessIdFromUrl) return coupons;
    return coupons.filter((c: Coupon) => {
      const ids = c.businessIds || (c.businessId ? [c.businessId] : []);
      return ids.includes(businessIdFromUrl);
    });
  }, [coupons, businessIdFromUrl]);

  const filteredUsedCoupons = useMemo(() => {
    if (!businessIdFromUrl) return usedCoupons;
    return usedCoupons.filter((uc: UserCoupon) => {
      const ids = uc.coupon?.businessIds || (uc.coupon?.businessId ? [uc.coupon.businessId] : []);
      return ids.includes(businessIdFromUrl);
    });
  }, [usedCoupons, businessIdFromUrl]);

  const filteredBusiness = useMemo(() =>
    businessIdFromUrl ? businesses.find((b: Business) => b.id === businessIdFromUrl) : null,
  [businesses, businessIdFromUrl]);

  const handleRemoveFilter = () => {
    navigate(`/${locale}/coupons`, { replace: true });
  };

  const handleViewCoupon = (coupon: Coupon) => {
    const businessId = businessIdFromUrl || business?.id;
    const url = businessId
      ? `/${locale}/coupons/${coupon.id}?businessId=${businessId}`
      : `/${locale}/coupons/${coupon.id}`;
    navigate(url);
  };

  const handleShowMap = (coupon: Coupon) => {
    const businessIds = coupon.businessIds || (coupon.businessId ? [coupon.businessId] : []);
    if (businessIds.length > 0) {
      // Navigate to services map with highlighted businesses
      navigate(`/${locale}/services?highlight=${businessIds.join(',')}`);
    }
  };

  const getCouponBusinesses = (coupon: Coupon): Business[] => {
    const businessIds = coupon.businessIds || (coupon.businessId ? [coupon.businessId] : []);
    return businesses.filter(b => businessIds.includes(b.id));
  };

  const renderCouponCard = (coupon: Coupon) => {
    const couponBusinesses = getCouponBusinesses(coupon);

    return (
      <Card
        key={coupon.id}
        className="overflow-hidden hover:shadow-lg transition-shadow relative cursor-pointer h-48"
        onClick={() => handleViewCoupon(coupon)}
        dir={isHebrew ? 'rtl' : 'ltr'}
      >
        <div className="flex flex-row h-full">
          {/* Image on the left */}
          {coupon.imageUrl && (
            <div className="relative w-32 flex-shrink-0">
              <img
                src={coupon.imageUrl}
                alt={coupon.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content on the right */}
          <CardContent className="flex-1 p-4 flex flex-col justify-between min-w-0">
            <div>
              <h3 className="font-semibold text-lg line-clamp-2 mb-2">{coupon.name}</h3>

              {coupon.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{coupon.description}</p>
              )}

              {coupon.points > 0 && (
                <p className="text-sm font-semibold text-primary mb-2">
                  {coupon.points} {text.points}
                </p>
              )}

              {coupon.validTo && (
                <p className="text-xs text-gray-500 mb-2">
                  {text.validUntil}: {new Date(coupon.validTo).toLocaleDateString(isHebrew ? 'he-IL' : 'en-US')}
                </p>
              )}

              {couponBusinesses.length > 0 && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-1">
                  {text.acceptedAt}: {couponBusinesses.map((b: Business) => b.name).join(', ')}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewCoupon(coupon);
                }}
                className="flex-1"
                size="sm"
              >
                <QrCode className="w-4 h-4 me-2" />
                {text.viewCoupon}
              </Button>
              {couponBusinesses.length > 0 && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowMap(coupon);
                  }}
                  variant="outline"
                  size="sm"
                >
                  <MapPin className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8" dir={isHebrew ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{text.loading}</p>
        </div>
      </div>
    );
  }

  const renderUsedCouponCard = (userCoupon: UserCoupon) => {
    const coupon = userCoupon.coupon;
    const couponBusinesses = businesses.filter(b =>
      (coupon.businessIds || []).includes(b.id) || coupon.businessId === b.id
    );

    return (
      <Card
        key={userCoupon.id}
        className="overflow-hidden hover:shadow-lg transition-shadow relative cursor-pointer h-48 opacity-75"
        onClick={() => navigate(`/${locale}/coupons/${coupon.id}`)}
        dir={isHebrew ? 'rtl' : 'ltr'}
      >
        <div className="flex flex-row h-full">
          {/* Image on the left */}
          {coupon.imageUrl && (
            <div className="relative w-32 flex-shrink-0">
              <img
                src={coupon.imageUrl}
                alt={coupon.name}
                className="w-full h-full object-cover grayscale"
              />
            </div>
          )}

          {/* Content on the right */}
          <CardContent className="flex-1 p-4 flex flex-col justify-between min-w-0">
            <div>
              <h3 className="font-semibold text-lg line-clamp-2 mb-2">{coupon.name}</h3>

              {coupon.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{coupon.description}</p>
              )}

              {userCoupon.usedAt && (
                <p className="text-xs text-gray-500 mb-2">
                  {text.usedOn}: {new Date(userCoupon.usedAt).toLocaleDateString(isHebrew ? 'he-IL' : 'en-US')}
                </p>
              )}

              {couponBusinesses.length > 0 && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-1">
                  {text.acceptedAt}: {couponBusinesses.map((b: Business) => b.name).join(', ')}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/${locale}/coupons/${coupon.id}`);
                }}
                className="flex-1"
                size="sm"
                variant="outline"
              >
                <QrCode className="w-4 h-4 me-2" />
                {text.viewCoupon}
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-24" dir={isHebrew ? 'rtl' : 'ltr'}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{text.title}</h1>
        <p className="text-gray-600">{text.description}</p>
      </div>

      {/* Filter by business: info + Remove filter button */}
      {businessIdFromUrl && (
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg bg-gray-100 border border-gray-200">
          <p className="text-sm font-medium text-gray-700">
            {filteredBusiness?.name
              ? text.couponsForBusiness(filteredBusiness.name)
              : text.couponsForSelectedBusiness}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveFilter}
            className="flex items-center gap-2 border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-600 shrink-0"
          >
            <X className="h-4 w-4" />
            {text.removeFilter}
          </Button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="used">{text.used}</TabsTrigger>
          <TabsTrigger value="available">{text.available}</TabsTrigger>
        </TabsList>

        <TabsContent value="used">
          {filteredUsedCoupons.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">{text.noUsedCoupons}</p>
            </div>
          ) : (
            <div className={`flex flex-wrap gap-6 ${isHebrew ? 'flex-row-reverse' : ''}`}>
              {filteredUsedCoupons.map(userCoupon => (
                <div key={userCoupon.id} className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                  {renderUsedCouponCard(userCoupon)}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available">
          {filteredCoupons.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">{text.noCoupons}</p>
            </div>
          ) : (
            <div className={`flex flex-wrap gap-6 ${isHebrew ? 'flex-row-reverse' : ''}`}>
              {filteredCoupons.map(coupon => (
                <div key={coupon.id} className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                  {renderCouponCard(coupon)}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

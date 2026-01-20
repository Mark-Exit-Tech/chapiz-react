'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tag, MapPin, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  };

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [usedCoupons, setUsedCoupons] = useState<UserCoupon[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);
  const [loading, setLoading] = useState(true);
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
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
          // Filter to only show active coupons
          activeCoupons = couponsResult.coupons.filter((c: Coupon) => c.isActive);
          console.log('✅ Loaded active coupons:', activeCoupons.length);
        } else {
          console.error('Failed to load coupons:', couponsResult.error);
        }

        // Load businesses
        const businessesResult = await getBusinesses();
        if (businessesResult && Array.isArray(businessesResult)) {
          setBusinesses(businessesResult);
          console.log('✅ Loaded businesses:', businessesResult.length);
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
        const availableCoupons = activeCoupons.filter(c => !usedCouponIds.includes(c.id));
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

  const handleViewCoupon = (coupon: Coupon) => {
    const url = business
      ? `/${locale}/coupons/${coupon.id}?businessId=${business.id}`
      : `/${locale}/coupons/${coupon.id}`;
    navigate(url);
  };

  const handleShowMap = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setShowMapDialog(true);
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="used">{text.used}</TabsTrigger>
          <TabsTrigger value="available">{text.available}</TabsTrigger>
        </TabsList>

        <TabsContent value="used">
          {usedCoupons.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">{text.noUsedCoupons}</p>
            </div>
          ) : (
            <div className={`flex flex-wrap gap-6 ${isHebrew ? 'flex-row-reverse' : ''}`}>
              {usedCoupons.map(userCoupon => (
                <div key={userCoupon.id} className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                  {renderUsedCouponCard(userCoupon)}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available">
          {coupons.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">{text.noCoupons}</p>
            </div>
          ) : (
            <div className={`flex flex-wrap gap-6 ${isHebrew ? 'flex-row-reverse' : ''}`}>
              {coupons.map(coupon => (
                <div key={coupon.id} className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                  {renderCouponCard(coupon)}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Map Dialog */}
      <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCoupon
                ? `${text.mapFor} ${selectedCoupon.name}`
                : text.showMap
              }
            </DialogTitle>
          </DialogHeader>
          {selectedCoupon && getCouponBusinesses(selectedCoupon).length > 0 ? (
            <MapCard
              businesses={getCouponBusinesses(selectedCoupon)}
              title={`${text.mapFor} ${selectedCoupon.name}`}
            />
          ) : (
            <div className="p-4 text-center text-gray-500">
              {text.noBusinessesFound}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

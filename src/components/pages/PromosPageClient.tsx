'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tag, CheckCircle2, History, MapPin, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import { getPromos, getBusinesses } from '@/lib/actions/admin';
import { isPromoUsed, getUserUsedPromos, UserPromo } from '@/lib/firebase/database/promos';

type Promo = any;
type Business = any;

interface PromosPageClientProps {
  initialPromos?: Promo[];
  business?: Business | null;
  initialBusinesses?: Business[];
}

export default function PromosPageClient({ 
  initialPromos = [], 
  business = null, 
  initialBusinesses = [] 
}: PromosPageClientProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';
  
  // HARDCODED TEXT - NO TRANSLATION KEYS!
  const text = {
    loading: isHebrew ? 'טוען...' : 'Loading...',
    title: isHebrew ? 'קופונים חינם' : 'Free Coupons',
    description: isHebrew ? 'קופונים חינם מעסקים שונים' : 'Free coupons from various businesses',
    availableCoupons: isHebrew ? 'קופונים זמינים' : 'Available Coupons',
    usedCoupons: isHebrew ? 'קופונים ששומשו' : 'Used Coupons',
    noCoupons: isHebrew ? 'אין קופונים זמינים כרגע' : 'No coupons available at the moment',
    noUsedCoupons: isHebrew ? 'עדיין לא השתמשתם בקופונים' : 'No coupons used yet',
    viewQR: isHebrew ? 'הצג QR' : 'View QR',
    showMap: isHebrew ? 'הצג במפה' : 'Show Map',
    used: isHebrew ? 'משומש' : 'Used',
    validUntil: isHebrew ? 'תקף עד' : 'Valid until',
    acceptedAt: isHebrew ? 'תקף ב' : 'Accepted at',
    pleaseSignIn: isHebrew ? 'אנא התחבר כדי לראות קופונים' : 'Please sign in to view coupons',
    mapFor: isHebrew ? 'מפה עבור' : 'Map for',
    noBusinessesFound: isHebrew ? 'לא נמצאו עסקים עבור קופון זה' : 'No businesses found for this coupon',
  };

  const [promos, setPromos] = useState<Promo[]>(initialPromos);
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);
  const [usedPromoIds, setUsedPromoIds] = useState<Set<string>>(new Set());
  const [usedPromos, setUsedPromos] = useState<UserPromo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);

  // Load promos and businesses from Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load promos
        const promosResult = await getPromos();
        if (promosResult.success && promosResult.promos) {
          // Filter to only show active promos
          const activePromos = promosResult.promos.filter((p: any) => p.isActive);
          setPromos(activePromos);
          console.log('✅ Loaded promos:', activePromos.length);
        } else {
          console.error('Failed to load promos:', promosResult.error);
          setPromos([]);
        }
        
        // Load businesses
        const businessesResult = await getBusinesses();
        if (businessesResult && Array.isArray(businessesResult)) {
          setBusinesses(businessesResult);
          console.log('✅ Loaded businesses:', businessesResult.length);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error(text.noCoupons);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Check which promos are used
  const loadUsedPromos = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Check which of the current promos are used
      const usedSet = new Set<string>();
      await Promise.all(
        promos.map(async (promo: any) => {
          const used = await isPromoUsed(user.uid, promo.id);
          if (used) {
            usedSet.add(promo.id);
          }
        })
      );
      setUsedPromoIds(usedSet);

      // Get all used promos for history
      const usedPromosResult = await getUserUsedPromos(user.uid);
      if (usedPromosResult.success && usedPromosResult.promos) {
        setUsedPromos(usedPromosResult.promos);
        console.log('✅ Loaded used promos:', usedPromosResult.promos.length);
      } else {
        console.error('Failed to get used promos:', usedPromosResult.error);
        setUsedPromos([]);
      }
    } catch (error) {
      console.error('Error checking used promos:', error);
      setUsedPromos([]);
    } finally {
      setLoading(false);
    }
  }, [user, promos]);

  useEffect(() => {
    loadUsedPromos();
  }, [loadUsedPromos]);

  const handleViewQR = (promo: Promo) => {
    const url = business 
      ? `/${locale}/coupons/${promo.id}?businessId=${business.id}`
      : `/${locale}/coupons/${promo.id}`;
    navigate(url);
  };

  const handleShowMap = (promo: Promo) => {
    setSelectedPromo(promo);
    setShowMapDialog(true);
  };

  const getPromoBusinesses = (promo: Promo): Business[] => {
    const businessIds = promo.businessIds || (promo.businessId ? [promo.businessId] : []);
    return businesses.filter(b => businessIds.includes(b.id));
  };

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    if (value === 'history' && user) {
      loadUsedPromos();
    }
  }, [user, loadUsedPromos]);

  // Filter out used coupons from available list
  const availablePromos = promos.filter(promo => !usedPromoIds.has(promo.id));

  const renderPromoCard = (promo: Promo) => (
    <Card 
      key={promo.id} 
      className="overflow-hidden hover:shadow-lg transition-shadow relative cursor-pointer"
      onClick={() => handleViewQR(promo)}
    >
      {promo.imageUrl && (
        <div className="relative w-full h-48">
          <img
            src={promo.imageUrl}
            alt={promo.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{promo.name}</h3>
          <Tag className="w-5 h-5 text-primary flex-shrink-0" />
        </div>
        
        {promo.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{promo.description}</p>
        )}

        {promo.endDate && (
          <p className="text-xs text-gray-500 mb-3">
            {text.validUntil}: {new Date(promo.endDate).toLocaleDateString(isHebrew ? 'he-IL' : 'en-US')}
          </p>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              handleViewQR(promo);
            }}
            className="flex-1"
            size="sm"
          >
            <QrCode className="w-4 h-4 mr-2" />
            {text.viewQR}
          </Button>
          {getPromoBusinesses(promo).length > 0 && (
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                handleShowMap(promo);
              }}
              variant="outline"
              size="sm"
            >
              <MapPin className="w-4 h-4" />
            </Button>
          )}
        </div>

        {getPromoBusinesses(promo).length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            {text.acceptedAt}: {getPromoBusinesses(promo).map(b => b.name).join(', ')}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Tag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600">{text.pleaseSignIn}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{text.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{text.title}</h1>
        <p className="text-gray-600">{text.description}</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="available" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            {text.availableCoupons}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            {text.usedCoupons}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-0">
          {availablePromos.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">{text.noCoupons}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availablePromos.map(renderPromoCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          {usedPromos.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">{text.noUsedCoupons}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {usedPromos.map(userPromo => userPromo.promo && renderPromoCard(userPromo.promo))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Map Dialog */}
      <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPromo 
                ? `${text.mapFor} ${selectedPromo.name}`
                : text.showMap
              }
            </DialogTitle>
          </DialogHeader>
          {selectedPromo && getPromoBusinesses(selectedPromo).length > 0 ? (
            <div className="p-4">
              {/* TODO: Implement MapCard component */}
              <p className="text-gray-600">Map will be displayed here</p>
            </div>
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

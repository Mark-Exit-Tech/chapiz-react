'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, Wallet, Calendar, ShoppingCart, History, Share2, Copy, Check, Tag, Eye, MapPin, QrCode } from 'lucide-react';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { getContactInfo, getBusinesses } from '@/lib/actions/admin';
import { Business } from '@/types/promo';
import MapCard from '@/components/cards/MapCard';
import { getUserPoints, deductPointsFromCategory, addPointsToCategory } from '@/lib/firebase/database/points';
import { getActiveVouchers, purchaseVoucher, getUserVouchers, markVoucherAsUsed, type Voucher, type UserVoucher } from '@/lib/firebase/database/vouchers';
import { useShopRedirect } from '@/hooks/use-shop-redirect';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

export default function UserVouchersPage() {
  const { i18n } = useTranslation('components.UserCoupons');

  // Get locale from i18n (works correctly on root path without locale prefix)
  const locale = i18n.language || 'en';
  const isHebrew = locale === 'he';
  
  // HARDCODED TEXT - NO TRANSLATION KEYS!
  const text = {
    loading: isHebrew ? 'טוען...' : 'Loading...',
    title: isHebrew ? 'שוברים' : 'Vouchers',
    description: isHebrew ? 'עיינו וקנו בשוברים באמצעות הנקודות שלכם!' : 'Browse and purchase vouchers using your points!',
    share: isHebrew ? 'שתף' : 'Share',
    myPoints: isHebrew ? 'הנקודות שלי' : 'My Points',
    pointsDescription: isHebrew ? 'השתמשו בנקודות שלכם כדי לקנות שוברים!' : 'Use your points to purchase vouchers!',
    shop: isHebrew ? 'חנות' : 'Shop',
    myVouchers: isHebrew ? 'השוברים שלי' : 'My Vouchers',
    availableVouchers: isHebrew ? 'שוברים זמינים' : 'Available Vouchers',
    noVouchers: isHebrew ? 'אין שוברים זמינים כרגע' : 'No vouchers available at the moment',
    validUntil: isHebrew ? 'תקף עד' : 'Valid until',
    pointsRequired: isHebrew ? 'נקודות נדרשות' : 'Points required',
    price: isHebrew ? 'מחיר' : 'Price',
    free: isHebrew ? 'חינם' : 'Free',
    getFree: isHebrew ? 'קבל חינם' : 'Get Free',
    purchase: isHebrew ? 'רכוש' : 'Purchase',
    insufficientPoints: isHebrew ? 'אין מספיק נקודות' : 'Insufficient Points',
    showMap: isHebrew ? 'הצג במפה' : 'Show Map',
    noHistory: isHebrew ? 'אין שוברים' : 'No vouchers yet',
    historyDescription: isHebrew ? 'השוברים שרכשת יופיעו כאן' : 'Vouchers you purchase will appear here',
    active: isHebrew ? 'פעיל' : 'Active',
    expired: isHebrew ? 'פג תוקף' : 'Expired',
    used: isHebrew ? 'משומש' : 'Used',
    showQR: isHebrew ? 'הצג QR' : 'Show QR',
    back: isHebrew ? 'חזור' : 'Back',
    validFrom: isHebrew ? 'תקף מ' : 'Valid from',
    qrCodeDescription: isHebrew ? 'סרקו את קוד ה-QR הזה כדי לצפות בשובר' : 'Scan this QR code to view this voucher',
    acceptedAt: isHebrew ? 'תקף ב' : 'Accepted at',
    storeLocation: isHebrew ? 'מיקום החנות' : 'Store Location',
    noBusinessesFound: isHebrew ? 'לא נמצאו עסקים עבור שובר זה' : 'No businesses found for this voucher',
    // Toast messages
    pleaseSignIn: isHebrew ? 'אנא התחבר כדי לרכוש שוברים' : 'Please sign in to purchase vouchers',
    pleaseSignInShare: isHebrew ? 'אנא התחבר כדי לשתף' : 'Please sign in to share',
    failedToLoad: isHebrew ? 'נכשל בטעינת הנתונים' : 'Failed to load data',
    purchaseSuccess: isHebrew ? 'השובר נרכש בהצלחה!' : 'Voucher purchased successfully!',
    failedToPurchase: isHebrew ? 'נכשל ברכישת השובר' : 'Failed to purchase voucher',
    codeCopied: isHebrew ? 'הקוד הועתק ללוח!' : 'Code copied to clipboard!',
    failedToCopy: isHebrew ? 'נכשל בהעתקת הקוד' : 'Failed to copy code',
    sharedSuccessfully: isHebrew ? 'שותף בהצלחה!' : 'Shared successfully!',
    linkCopied: isHebrew ? 'הלינק הועתק ללוח!' : 'Link copied to clipboard!',
    failedToShare: isHebrew ? 'נכשל בשיתוף' : 'Failed to share',
    couponMarkedAsUsed: isHebrew ? 'השובר סומן כמשומש והועבר להיסטוריה' : 'Voucher marked as used and moved to history',
    failedToMarkAsUsed: isHebrew ? 'נכשל בסימון השובר כמשומש' : 'Failed to mark voucher as used',
    shareShopTitle: isHebrew ? 'בדקו את החנות שלנו!' : 'Check out our shop!',
    shareShopText: isHebrew ? 'בדקו את החנות שלנו עם הקישור המיוחד הזה!' : 'Check out our shop with this special link!',
    purchaseLimitReached: isHebrew ? 'הגעת למגבלת הרכישות עבור שובר זה' : 'You have reached the purchase limit for this voucher',
  };
  
  const navigate = useNavigate();
  const { user, dbUser } = useAuth();
  const [vouchers, setVouchers] = useState<Voucher[]>([]); // Available vouchers (vouchers collection only)
  const [userVouchers, setUserVouchers] = useState<UserVoucher[]>([]); // Purchased vouchers (userVouchers collection)
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('shop');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [shopUrl, setShopUrl] = useState<string>('');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [justPurchasedVoucherId, setJustPurchasedVoucherId] = useState<string | null>(null); // Triggers success animation on My Vouchers card
  const { redirectToShop, getShopUrl } = useShopRedirect();

  useEffect(() => {
    fetchData();
  }, [user]);
  

  const fetchData = async (options?: { skipLoadingState?: boolean }) => {
    const skipLoading = options?.skipLoadingState === true;
    try {
      if (!skipLoading) setLoading(true);

      // Vouchers page: only vouchers DB (strict separation from coupons)
      const activeVouchers = await getActiveVouchers();
      const sorted = [...activeVouchers].sort((a, b) => {
        const aIsFree = a.price === 0;
        const bIsFree = b.price === 0;
        if (aIsFree && !bIsFree) return -1;
        if (!aIsFree && bIsFree) return 1;
        return a.price - b.price;
      });
      setVouchers(sorted);

      const contactInfo = await getContactInfo();
      if (contactInfo?.storeUrl) setShopUrl(contactInfo.storeUrl);

      const businessesResult = await getBusinesses();
      if (businessesResult.success && businessesResult.businesses) {
        const validBusinesses = businessesResult.businesses.filter((b: any) => b.id && b.name) as Business[];
        setBusinesses(validBusinesses);
      }

      if (user) {
        const pointsResult = await getUserPoints(user);
        if (pointsResult.success) {
          setUserPoints(pointsResult.totalPoints || pointsResult.points || 0);
        } else {
          setUserPoints(0);
        }
        const purchasedVouchers = await getUserVouchers(user.uid);
        setUserVouchers(purchasedVouchers);
      } else {
        setUserVouchers([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (!skipLoading) toast.error(text.failedToLoad);
    } finally {
      if (!skipLoading) setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!user) {
      toast.error(text.pleaseSignInShare);
      return;
    }

    if (!shopUrl) {
      toast.error(isHebrew ? 'כתובת החנות לא הוגדרה' : 'Shop URL is not configured');
      return;
    }

    const shareUrl = shopUrl || (typeof window !== 'undefined' ? window.location.href : '');

    const shareData = {
      title: text.shareShopTitle,
      text: text.shareShopText,
      url: shareUrl
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success(text.sharedSuccessfully);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast.success(text.linkCopied);
      }
      // Note: Points will be awarded when someone actually uses the callback URL,
      // not when the link is shared. This is handled by the shop callback API endpoint.
    } catch (err) {
      console.error('Failed to share:', err);
      // Only show error if it's not a user cancellation
      if ((err as any).name !== 'AbortError') {
        toast.error(text.failedToShare);
      }
    }
  };

  const handlePurchaseVoucher = async (voucher: Voucher) => {
    if (!user) {
      toast.error(text.pleaseSignIn);
      return;
    }

    const pointsNeeded = voucher.points ?? 0;
    if (userPoints < pointsNeeded) {
      toast.error(text.insufficientPoints);
      return;
    }

    try {
      if (pointsNeeded > 0) {
        const deductResult = await deductPointsFromCategory(user, 'share', pointsNeeded);
        if (!deductResult.success) {
          toast.error(deductResult.error || text.failedToPurchase);
          return;
        }
      }

      const purchaseResult = await purchaseVoucher(user.uid, voucher.id, pointsNeeded);

      if (!purchaseResult.success) {
        if (pointsNeeded > 0) {
          await addPointsToCategory(user, 'share', pointsNeeded);
        }
        toast.error(purchaseResult.error || text.failedToPurchase);
        return;
      }

      setActiveTab('myVouchers');

      const successMessage = isHebrew ? `השובר "${voucher.name}" נרכש בהצלחה!` : `Voucher "${voucher.name}" purchased successfully!`;
      toast.success(successMessage, { duration: 4000 });

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.5 },
      });

      const optimisticUserVoucher: UserVoucher = {
        id: `pending-${voucher.id}-${Date.now()}`,
        userId: user.uid,
        voucherId: voucher.id,
        status: 'active',
        purchasedAt: new Date(),
        voucher,
      };
      setUserVouchers((prev) => [optimisticUserVoucher, ...prev]);
      setJustPurchasedVoucherId(voucher.id);
      setTimeout(() => setJustPurchasedVoucherId(null), 3500);

      fetchData({ skipLoadingState: true }).catch(() => {});
    } catch (error) {
      console.error('Error purchasing voucher:', error);
      toast.error(text.failedToPurchase);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(text.codeCopied);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
      toast.error(text.failedToCopy);
    }
  };

  const handleUseVoucher = async (userVoucher: UserVoucher) => {
    const result = await markVoucherAsUsed(userVoucher.id);
    if (result.success) {
      toast.success(text.couponMarkedAsUsed);
      if (user) {
        const purchasedVouchers = await getUserVouchers(user.uid);
        setUserVouchers(purchasedVouchers);
      }
      setActiveTab('myVouchers');
    } else {
      toast.error(text.failedToMarkAsUsed);
    }
  };



  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale === 'he' ? 'he-IL' : 'en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8" dir={isHebrew ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">{text.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isHebrew ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes voucher-purchase-success {
          0% { transform: scale(0.96); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
          50% { transform: scale(1.02); box-shadow: 0 0 0 12px rgba(34, 197, 94, 0); }
          100% { transform: scale(1); box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
        }
        .voucher-purchase-success-animation { animation: voucher-purchase-success 0.6s ease-out; }
      `}</style>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 pb-24 md:pb-12 max-w-7xl">
        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {text.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">{text.description}</p>
        </div>

        {/* User Points Section */}
        <div className="mb-8 lg:mb-10">
          <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl lg:text-2xl">
                <div className="p-2 rounded-full bg-yellow-100">
                  <Coins className="h-6 w-6 text-yellow-600" />
                </div>
                {text.myPoints}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}>
                <div>
                  <div className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
                    {userPoints.toLocaleString()}
                  </div>
                  <p className="text-base text-gray-600 mt-2">{text.pointsDescription}</p>
                </div>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="lg"
                  style={{ alignSelf: 'center', marginTop: '-55px' }}
                >
                  <Share2 className="h-5 w-5" />
                  {text.share}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
      }} className="w-full">
        <div className="flex justify-end mb-8 lg:mb-10">
        <TabsList className="grid max-w-md w-full grid-cols-2 h-12 lg:h-14 bg-gray-100/50 p-1 rounded-xl">
          {isHebrew ? (
            <>
              <TabsTrigger 
                value="myVouchers" 
                className="flex items-center gap-2 text-sm lg:text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-md transition-all rounded-lg"
              >
                <Wallet className="h-4 w-4 lg:h-5 lg:w-5" />
                {text.myVouchers}
              </TabsTrigger>
              <TabsTrigger 
                value="shop" 
                className="flex items-center gap-2 text-sm lg:text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-md transition-all rounded-lg"
              >
                <ShoppingCart className="h-4 w-4 lg:h-5 lg:w-5" />
                {text.shop}
              </TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger 
                value="shop" 
                className="flex items-center gap-2 text-sm lg:text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-md transition-all rounded-lg"
              >
                <ShoppingCart className="h-4 w-4 lg:h-5 lg:w-5" />
                {text.shop}
              </TabsTrigger>
              <TabsTrigger 
                value="myVouchers" 
                className="flex items-center gap-2 text-sm lg:text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-md transition-all rounded-lg"
              >
                <Wallet className="h-4 w-4 lg:h-5 lg:w-5" />
                {text.myVouchers}
              </TabsTrigger>
            </>
          )}
        </TabsList>
        </div>

        {/* Shop Tab */}
        <TabsContent value="shop" className="space-y-6">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 lg:mb-8 text-gray-900 text-end" style={isHebrew ? { textAlign: 'right' } : {}}>{text.availableVouchers}</h2>
        {vouchers.length === 0 ? (
          <div className="text-center py-16 lg:py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4">
              <Wallet className="h-12 w-12 lg:h-16 lg:w-16 text-gray-400" />
            </div>
            <p className="text-lg lg:text-xl text-gray-500 font-medium">{text.noVouchers}</p>
          </div>
        ) : (
          <div className={`flex flex-wrap gap-6 lg:gap-8 pb-24 ${isHebrew ? 'flex-row-reverse' : ''}`}>
            {vouchers.map((voucher) => (
              <div key={voucher.id} className="w-full md:w-[calc(50%-12px)] xl:w-[calc(33.333%-16px)] 2xl:w-[calc(25%-18px)]">
              <Card
                className="relative group hover:shadow-2xl transition-all duration-300 border-2 overflow-hidden bg-white hover:border-primary/20 flex flex-col"
                style={isHebrew ? { transform: 'scaleX(-1)' } : {}}
              >
                {voucher.imageUrl && (
                  <div 
                    className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 cursor-pointer"
                    onClick={() => navigate(`/${locale}/vouchers/${voucher.id}`)}
                  >
                    <img 
                      src={voucher.imageUrl} 
                      alt={voucher.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/${locale}/vouchers/${voucher.id}`);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm px-3 py-2">
                      <div className="flex items-center gap-1.5 text-white text-sm font-medium" style={isHebrew ? { transform: 'scaleX(-1)', textAlign: 'right', flexDirection: 'row-reverse' } : {}}>
                        <Calendar className="h-4 w-4" />
                        <span style={isHebrew ? { textAlign: 'right' } : {}}>{text.validUntil}: {formatDate(voucher.validTo)}</span>
                      </div>
                    </div>
                  </div>
                )}
                <CardHeader className={voucher.imageUrl ? "pb-3" : ""} style={isHebrew ? { transform: 'scaleX(-1)', textAlign: 'right' } : {}}>
                  {!voucher.imageUrl && (
                    <div className="flex items-start justify-between gap-3 mb-2" style={isHebrew ? { flexDirection: 'row-reverse' } : {}}>
                      <CardTitle className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight flex-1" style={isHebrew ? { textAlign: 'right' } : {}}>
                        {voucher.name}
                      </CardTitle>
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex-shrink-0">
                        <Wallet className="w-full h-full p-3 text-primary/40" />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2 text-sm" style={isHebrew ? { flexDirection: 'row-reverse' } : {}}>
                    <div className="flex items-center gap-2 flex-1 min-w-0" style={isHebrew ? { justifyContent: 'flex-end' } : {}}>
                      <span className="font-semibold text-gray-900 truncate" style={isHebrew ? { textAlign: 'right', width: '100%' } : {}}>{voucher.name}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {(voucher.points ?? 0) > 0 && (
                        <Badge variant="outline" className="flex items-center gap-1 px-2 py-0.5 text-xs border-amber-200 text-amber-700">
                          <Coins className="h-3 w-3" />
                          <span>{voucher.points}</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                  {voucher.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-1" style={isHebrew ? { textAlign: 'right' } : {}}>{voucher.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4" onClick={(e) => e.stopPropagation()} style={isHebrew ? { transform: 'scaleX(-1)', textAlign: 'right' } : {}}>
                  <div className="space-y-3">
                    <div className={`flex items-center justify-between p-3 rounded-lg ${(voucher.points ?? 0) === 0 ? 'bg-green-50' : 'bg-amber-50'}`} style={isHebrew ? { flexDirection: 'row-reverse' } : {}}>
                      <span className="text-sm font-medium text-gray-600" style={isHebrew ? { textAlign: 'right' } : {}}>{text.pointsRequired}</span>
                      {(voucher.points ?? 0) === 0 ? (
                        <Badge className="bg-green-500 text-white hover:bg-green-600 px-3 py-1">
                          <span className="font-bold">{text.free}</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1.5 bg-white px-3 py-1 border-amber-200 text-amber-700">
                          <Coins className="h-4 w-4" />
                          <span className="font-semibold">{voucher.points}</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 mt-auto flex flex-col gap-2" onClick={(e) => e.stopPropagation()} style={isHebrew ? { transform: 'scaleX(-1)' } : {}}>
                  <Button 
                    onClick={() => handlePurchaseVoucher(voucher)}
                    disabled={userPoints < (voucher.points ?? 0)}
                    className="w-full flex items-center justify-center gap-2 h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {(voucher.points ?? 0) === 0 ? text.getFree : (userPoints < (voucher.points ?? 0) ? text.insufficientPoints : text.purchase)}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full h-12 flex items-center justify-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      const businessIds = voucher.businessIds && Array.isArray(voucher.businessIds) ? voucher.businessIds.filter(id => id != null && id !== '') : [];
                      if (businessIds.length > 0) {
                        navigate(`/${locale}/services?businessId=${businessIds.join(',')}`);
                      } else {
                        navigate(`/${locale}/services`);
                      }
                    }}
                  >
                    <MapPin className="h-5 w-5" />
                    {text.showMap}
                  </Button>
                </CardFooter>
              </Card>
              </div>
            ))}
            </div>
          )}
        </TabsContent>

        {/* My Vouchers Tab */}
        <TabsContent value="myVouchers" className="space-y-6">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 lg:mb-8 text-gray-900 text-end" style={isHebrew ? { textAlign: 'right' } : {}}>{text.myVouchers}</h2>
          {userVouchers.length === 0 ? (
            <div className="text-center py-16 lg:py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4">
                <History className="h-12 w-12 lg:h-16 lg:w-16 text-gray-400" />
              </div>
              <p className="text-lg lg:text-xl text-gray-500 font-medium mb-2">{text.noHistory}</p>
              <p className="text-sm lg:text-base text-gray-400">{text.historyDescription}</p>
            </div>
          ) : (
            <div className={`flex flex-wrap gap-6 lg:gap-8 ${isHebrew ? 'flex-row-reverse' : ''}`}>
              {userVouchers
                .sort((a, b) => (b.purchasedAt?.getTime?.() ?? 0) - (a.purchasedAt?.getTime?.() ?? 0))
                .map((userVoucherItem) => {
                const coupon = userVoucherItem.voucher;
                const status = userVoucherItem.status || 'active';
                // Only mark as expired if status is explicitly 'expired', not based on date
                // Vouchers stay active until explicitly used or expired
                const isActive = status === 'active';
                const isExpired = status === 'expired';
                const isUsed = status === 'used';
                const couponCode = coupon.description;
                const isCodeCopied = copiedCode === couponCode;

                const isJustPurchased = justPurchasedVoucherId === userVoucherItem.voucherId;
                return (
                  <div key={userVoucherItem.id} className="w-full md:w-[calc(50%-12px)] xl:w-[calc(33.333%-16px)] 2xl:w-[calc(25%-18px)]" style={isHebrew ? { transform: 'scaleX(-1)' } : undefined}>
                  <Card
                    className={`relative group hover:shadow-xl transition-all duration-300 border-2 overflow-hidden flex flex-col ${
                      isJustPurchased ? 'voucher-purchase-success-animation border-green-400 ring-2 ring-green-400/50' : ''
                    } ${
                      isActive && !isExpired && !isJustPurchased
                        ? 'border-green-200 hover:border-green-300 bg-gradient-to-br from-white to-green-50/30 opacity-100' 
                        : !isJustPurchased
                        ? 'opacity-75 hover:opacity-90 border-gray-200 bg-gradient-to-br from-gray-50 to-white'
                        : 'border-green-200 bg-gradient-to-br from-white to-green-50/30 opacity-100'
                    }`}
                  >
                    <div className="absolute top-4 end-4 z-10" onClick={(e) => e.stopPropagation()}>
                      <Badge 
                        variant={isActive && !isExpired ? 'default' : isExpired ? 'destructive' : 'secondary'} 
                        className={`shadow-md ${isActive && !isExpired ? 'bg-green-500' : ''}`}
                        style={isHebrew ? { transform: 'scaleX(-1)' } : {}}
                      >
                        {isActive && !isExpired ? text.active : isExpired ? text.expired : text.used}
                      </Badge>
                    </div>
                    {coupon.imageUrl && (
                      <div 
                        className={`relative h-48 overflow-hidden bg-gradient-to-br cursor-pointer ${
                          isActive && !isExpired ? 'from-green-100 to-green-200' : 'from-gray-100 to-gray-200'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/${locale}/vouchers/${userVoucherItem.id}`);
                        }}
                      >
                        <img 
                          src={coupon.imageUrl} 
                          alt={coupon.name}
                          className={`w-full h-full object-cover transition-transform duration-300 ${
                            isActive && !isExpired ? 'group-hover:scale-110' : 'grayscale'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/${locale}/vouchers/${userVoucherItem.id}`);
                          }}
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${
                          isActive && !isExpired ? 'from-black/20' : 'from-black/30'
                        } to-transparent`} />
                        {/* Date Overlay */}
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm px-3 py-2">
                          <div className="flex items-center gap-1.5 text-white text-sm font-medium" style={isHebrew ? { transform: 'scaleX(-1)', textAlign: 'right', flexDirection: 'row-reverse' } : {}}>
                            <Calendar className="h-4 w-4" />
                            <span style={isHebrew ? { textAlign: 'right' } : {}}>{text.validUntil}: {formatDate(coupon.validTo)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <CardHeader className={coupon.imageUrl ? "pb-3" : "pt-6"} style={isHebrew ? { transform: 'scaleX(-1)', textAlign: 'right' } : {}}>
                      {!coupon.imageUrl && (
                        <div className="flex items-start justify-between gap-3 mb-2" style={isHebrew ? { flexDirection: 'row-reverse' } : {}}>
                          <CardTitle className={`text-xl lg:text-2xl font-bold leading-tight flex-1 ${
                            isActive && !isExpired ? 'text-gray-900' : 'text-gray-600'
                          }`} style={isHebrew ? { textAlign: 'right' } : {}}>
                            {coupon.name}
                          </CardTitle>
                          <div className={`w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br flex-shrink-0 ${
                            isActive && !isExpired 
                              ? 'from-green-100 to-green-200' 
                              : 'from-gray-100 to-gray-200 grayscale'
                          }`}>
                            <Wallet className={`w-full h-full p-3 ${
                              isActive && !isExpired ? 'text-green-600' : 'text-gray-400'
                            }`} />
                          </div>
                        </div>
                      )}
                      {/* One-row summary info */}
                      <div className="flex items-center justify-between gap-2 text-sm" style={isHebrew ? { flexDirection: 'row-reverse' } : {}}>
                        <div className="flex items-center gap-2 flex-1 min-w-0" style={isHebrew ? { justifyContent: 'flex-end' } : {}}>
                          <span className={`font-semibold truncate ${
                            isActive && !isExpired ? 'text-gray-900' : 'text-gray-600'
                          }`} style={isHebrew ? { textAlign: 'right', width: '100%' } : {}}>
                            {coupon.name}
                          </span>
                        </div>
                      </div>
                      {coupon.description && (
                        <p className={`text-sm mt-2 line-clamp-1 ${
                          isActive && !isExpired ? 'text-gray-600' : 'text-gray-500'
                        }`} style={isHebrew ? { textAlign: 'right' } : {}}>
                          {coupon.description}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1 flex flex-col" onClick={(e) => e.stopPropagation()} style={isHebrew ? { transform: 'scaleX(-1)', textAlign: 'right' } : {}}>
                      <div className="space-y-4 flex-1">
                        {coupon.description && (
                          <p className="text-sm text-gray-600 line-clamp-1" style={isHebrew ? { textAlign: 'right' } : {}}>{coupon.description}</p>
                        )}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" style={isHebrew ? { flexDirection: 'row-reverse' } : {}}>
                          <span className={`text-sm font-medium ${
                            isActive && !isExpired ? 'text-gray-600' : 'text-gray-500'
                          }`} style={isHebrew ? { textAlign: 'right' } : {}}>
                            {text.price}
                          </span>
                          <span className={`text-lg font-bold ${
                            isActive && !isExpired 
                              ? (coupon.price === 0 ? 'text-green-600' : 'text-primary')
                              : 'text-gray-600 line-through'
                          }`}>
                            {coupon.price === 0 ? text.free : formatPrice(coupon.price)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-4 flex flex-col gap-2 mt-auto" onClick={(e) => e.stopPropagation()} style={isHebrew ? { transform: 'scaleX(-1)' } : {}}>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => navigate(`/${locale}/vouchers/${userVoucherItem.id}`)}
                        className="w-full h-12 flex items-center justify-center gap-2"
                      >
                        <QrCode className="h-5 w-5" />
                        {text.showQR}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full h-12 flex items-center justify-center gap-2"
                        onClick={() => {
                          const businessIds = coupon.businessIds && Array.isArray(coupon.businessIds) ? coupon.businessIds.filter((id: string) => id != null && id !== '') : [];
                          if (businessIds.length > 0) {
                            navigate(`/${locale}/services?businessId=${businessIds.join(',')}`);
                          } else {
                            navigate(`/${locale}/services`);
                          }
                        }}
                      >
                        <MapPin className="h-5 w-5" />
                        {text.showMap}
                      </Button>
                    </CardFooter>
                  </Card>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

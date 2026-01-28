'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '@/hooks/use-locale';
import { purchaseVoucher, type Voucher } from '@/lib/firebase/database/vouchers';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { getUserPoints, deductPointsFromCategory, addPointsToCategory } from '@/lib/firebase/database/points';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins } from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

interface VoucherShopViewClientProps {
  voucher: Voucher;
}

export default function VoucherShopViewClient({ voucher }: VoucherShopViewClientProps) {
  const navigate = useNavigate();
  const locale = useLocale();
  const { user } = useAuth();
  const isHebrew = locale === 'he';
  const [userPoints, setUserPoints] = useState(0);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const text = {
    back: isHebrew ? 'חזור' : 'Back',
    validUntil: isHebrew ? 'תקף עד' : 'Valid until',
    pointsRequired: isHebrew ? 'נקודות נדרשות' : 'Points required',
    free: isHebrew ? 'חינם' : 'Free',
    purchase: isHebrew ? 'רכוש' : 'Purchase',
    getFree: isHebrew ? 'קבל חינם' : 'Get Free',
    insufficientPoints: isHebrew ? 'אין מספיק נקודות' : 'Insufficient Points',
    pleaseSignIn: isHebrew ? 'אנא התחבר כדי לרכוש שוברים' : 'Please sign in to purchase vouchers',
    purchaseSuccess: isHebrew ? 'השובר נרכש בהצלחה!' : 'Voucher purchased successfully!',
    failedToPurchase: isHebrew ? 'נכשל ברכישת השובר' : 'Failed to purchase voucher',
  };

  useEffect(() => {
    if (user) {
      getUserPoints(user).then((res) => {
        if (res.success) setUserPoints(res.totalPoints ?? res.points ?? 0);
      });
    }
  }, [user]);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat(isHebrew ? 'he-IL' : 'en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);

  const handlePurchase = async () => {
    if (!user) {
      toast.error(text.pleaseSignIn);
      return;
    }
    const pointsNeeded = voucher.points ?? 0;
    if (userPoints < pointsNeeded) {
      toast.error(text.insufficientPoints);
      return;
    }
    setIsPurchasing(true);
    try {
      if (pointsNeeded > 0) {
        const deductResult = await deductPointsFromCategory(user, 'share', pointsNeeded);
        if (!deductResult.success) {
          toast.error(deductResult.error || text.failedToPurchase);
          setIsPurchasing(false);
          return;
        }
      }
      const result = await purchaseVoucher(user.uid, voucher.id, pointsNeeded);
      if (!result.success) {
        if (pointsNeeded > 0) await addPointsToCategory(user, 'share', pointsNeeded);
        toast.error(result.error || text.failedToPurchase);
        setIsPurchasing(false);
        return;
      }
      toast.success(text.purchaseSuccess, { duration: 4000 });
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.5 } });
      navigate(`/${locale}/vouchers`);
    } catch (error) {
      console.error('Error purchasing voucher:', error);
      toast.error(text.failedToPurchase);
      setIsPurchasing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={isHebrew ? 'rtl' : 'ltr'}>
      <Navbar />

      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-4xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          {locale === 'he' ? (
            <ArrowRight className="h-4 w-4 me-2" />
          ) : (
            <ArrowLeft className="h-4 w-4 me-2" />
          )}
          {text.back}
        </Button>

        <Card className="overflow-hidden">
          <CardContent className="p-8">
            {voucher.imageUrl && (
              <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden">
                <img
                  src={voucher.imageUrl}
                  alt={voucher.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">{voucher.name}</h1>
              {voucher.description && (
                <p className="text-gray-600 mb-4">{voucher.description}</p>
              )}
              <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
                <span className="text-sm">{text.validUntil}: {formatDate(voucher.validTo)}</span>
              </div>
              <div className="inline-flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                <span className="text-sm font-medium text-gray-600">{text.pointsRequired}</span>
                {voucher.price === 0 ? (
                  <Badge className="bg-green-500 text-white">{text.free}</Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1.5 border-amber-200 text-amber-700">
                    <Coins className="h-4 w-4" />
                    <span>{voucher.points}</span>
                  </Badge>
                )}
              </div>
            </div>

            {user ? (
              <Button
                size="lg"
                onClick={handlePurchase}
                disabled={isPurchasing || (voucher.price > 0 && userPoints < voucher.points)}
                className="w-full flex items-center justify-center gap-2 h-12"
              >
                {isPurchasing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin me-2" />
                    {isHebrew ? 'רוכש...' : 'Purchasing...'}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 me-2" />
                    {voucher.price === 0 ? text.getFree : (userPoints < voucher.points ? text.insufficientPoints : text.purchase)}
                  </>
                )}
              </Button>
            ) : (
              <p className="text-center text-gray-600 mb-4">{text.pleaseSignIn}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

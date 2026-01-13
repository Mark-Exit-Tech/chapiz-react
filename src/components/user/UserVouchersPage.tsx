'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { getUserVouchers, markVoucherAsUsed, type UserVoucher } from '@/lib/firebase/database/vouchers';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket, Calendar, Check, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserVouchersPage() {
  const { t } = useTranslation('components.UserVouchers');
  
  // Get locale from URL or default to 'en'
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';
  
  // HARDCODED TEXT - NO TRANSLATION KEYS!
  const text = {
    loading: isHebrew ? 'טוען...' : 'Loading...',
    title: isHebrew ? 'השוברים שלי' : 'My Vouchers',
    description: isHebrew ? 'השוברים שרכשתם - צפו וממשו את השוברים שלכם' : 'Your purchased vouchers - view and redeem your vouchers',
    noVouchers: isHebrew ? 'אין שוברים' : 'No vouchers yet',
    noVouchersDescription: isHebrew ? 'השוברים שרכשתם יופיעו כאן' : 'Vouchers you purchase will appear here',
    validUntil: isHebrew ? 'תקף עד' : 'Valid until',
    purchasedOn: isHebrew ? 'נרכש ב' : 'Purchased on',
    active: isHebrew ? 'פעיל' : 'Active',
    used: isHebrew ? 'משומש' : 'Used',
    expired: isHebrew ? 'פג תוקף' : 'Expired',
    markAsUsed: isHebrew ? 'סמן כמשומש' : 'Mark as Used',
    voucherMarkedAsUsed: isHebrew ? 'השובר סומן כמשומש' : 'Voucher marked as used',
    failedToMarkAsUsed: isHebrew ? 'נכשל בסימון השובר כמשומש' : 'Failed to mark voucher as used',
  };

  const { user } = useAuth();
  const [vouchers, setVouchers] = useState<UserVoucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchVouchers();
    }
  }, [user]);

  const fetchVouchers = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userVouchers = await getUserVouchers(user.uid);
      setVouchers(userVouchers);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      toast.error(isHebrew ? 'שגיאה בטעינת שוברים' : 'Error loading vouchers');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsUsed = async (voucherId: string) => {
    const result = await markVoucherAsUsed(voucherId);
    
    if (result.success) {
      toast.success(text.voucherMarkedAsUsed);
      fetchVouchers();
    } else {
      toast.error(text.failedToMarkAsUsed);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale === 'he' ? 'he-IL' : 'en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const isExpired = (validTo: Date) => {
    return new Date() > new Date(validTo);
  };

  if (loading) {
    return (
      <div className="flex grow flex-col items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">{text.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex grow flex-col pb-16 md:pb-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-8 lg:mb-12 text-right">
          <h1 className="text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {text.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl ml-auto">{text.description}</p>
        </div>

        {/* Vouchers Grid */}
        {vouchers.length === 0 ? (
          <div className="text-center py-16 lg:py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="mb-4">
              <Ticket className="h-12 w-12 lg:h-16 lg:w-16 text-gray-400 mx-auto" />
            </div>
            <p className="text-lg lg:text-xl text-gray-500 font-medium mb-2">{text.noVouchers}</p>
            <p className="text-sm lg:text-base text-gray-400">{text.noVouchersDescription}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vouchers.map((userVoucher) => {
              const { voucher } = userVoucher;
              const expired = isExpired(voucher.validTo);
              const isUsed = userVoucher.status === 'used';
              const isActive = userVoucher.status === 'active' && !expired;

              return (
                <Card key={userVoucher.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Voucher Image */}
                  {voucher.imageUrl && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={voucher.imageUrl}
                        alt={voucher.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className={`shadow-md ${isActive ? 'bg-green-500' : isUsed ? 'bg-gray-500' : 'bg-red-500'}`}>
                          {isActive ? text.active : isUsed ? text.used : text.expired}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Voucher Details */}
                  <CardHeader>
                    <h3 className="text-xl font-bold">{voucher.name}</h3>
                    <p className="text-sm text-gray-600">{voucher.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Purchase Date */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{text.purchasedOn}: {formatDate(userVoucher.purchasedAt)}</span>
                    </div>

                    {/* Valid Until */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{text.validUntil}: {formatDate(voucher.validTo)}</span>
                    </div>
                  </CardContent>

                  {/* Actions */}
                  {isActive && (
                    <CardFooter>
                      <Button
                        onClick={() => handleMarkAsUsed(userVoucher.id)}
                        variant="outline"
                        className="w-full"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        {text.markAsUsed}
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

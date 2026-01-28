import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUserVoucherById, getVoucherById } from '@/lib/firebase/database/vouchers';
import VoucherViewPageClient from '@/components/pages/VoucherViewPageClient';
import VoucherShopViewClient from '@/components/pages/VoucherShopViewClient';
import Navbar from '@/components/layout/Navbar';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import type { UserVoucher, Voucher } from '@/lib/firebase/database/vouchers';

export default function VoucherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [userVoucher, setUserVoucher] = useState<UserVoucher | null>(null);
  const [catalogVoucher, setCatalogVoucher] = useState<Voucher | null>(null);
  const [loading, setLoading] = useState(true);

  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';

  const text = {
    loading: isHebrew ? 'טוען...' : 'Loading...',
    notFound: isHebrew ? 'שובר לא נמצא' : 'Voucher not found',
    goBack: isHebrew ? 'חזור' : 'Go Back',
    pleaseSignIn: isHebrew ? 'יש להתחבר כדי לצפות בשובר' : 'Please sign in to view voucher',
  };

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userVoucherData = user ? await getUserVoucherById(id) : null;
        if (userVoucherData) {
          setUserVoucher(userVoucherData);
          setCatalogVoucher(null);
          return;
        }
        const voucherData = await getVoucherById(id);
        if (voucherData) {
          setCatalogVoucher(voucherData);
          setUserVoucher(null);
        }
      } catch (error) {
        console.error('Error loading voucher:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, user]);

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

  if (userVoucher) {
    return (
      <>
        <VoucherViewPageClient userVoucher={userVoucher} />
        <div className="md:hidden">
          <BottomNavigation />
        </div>
      </>
    );
  }

  if (catalogVoucher) {
    return (
      <>
        <VoucherShopViewClient voucher={catalogVoucher} />
        <div className="md:hidden">
          <BottomNavigation />
        </div>
      </>
    );
  }

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

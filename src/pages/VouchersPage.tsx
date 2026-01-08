import Navbar from '@/components/layout/Navbar';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useSearchParams } from 'react-router-dom';
import { Suspense } from 'react';

// Placeholder component - TODO: implement vouchers display
const VouchersContent = () => {
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get('businessId');

  return (
    <div className="flex grow flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] pb-16 md:pb-0 items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Vouchers & Gifts</h1>
        <p className="text-gray-600">Vouchers page coming soon...</p>
        {businessId && <p className="text-sm text-gray-500 mt-2">Business ID: {businessId}</p>}
      </div>
    </div>
  );
};

export default function VouchersPage() {
  return (
    <>
      {/* Navbar - only visible on md and above */}
      <div className="hidden md:block">
        <Navbar />
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <VouchersContent />
      </Suspense>
      {/* Bottom Navigation - only visible on mobile */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </>
  );
}

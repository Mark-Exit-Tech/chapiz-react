import Navbar from '@/components/layout/Navbar';
import BottomNavigation from '@/components/layout/BottomNavigation';
import UserCouponsPage from '@/components/user/UserCouponsPage';

export default function VouchersPage() {
  return (
    <>
      {/* Navbar - visible on all screen sizes */}
      <Navbar />
      <UserCouponsPage />
      {/* Bottom Navigation - only visible on mobile */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </>
  );
}

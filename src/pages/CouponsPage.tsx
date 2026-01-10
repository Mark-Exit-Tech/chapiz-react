import Navbar from '@/components/layout/Navbar';
import BottomNavigation from '@/components/layout/BottomNavigation';
import UserCouponsPage from '@/components/user/UserCouponsPage';

export default function CouponsPage() {
  return (
    <>
      {/* Navbar - only visible on md and above */}
      <div className="hidden md:block">
        <Navbar />
      </div>
      <UserCouponsPage />
      {/* Bottom Navigation - only visible on mobile */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </>
  );
}

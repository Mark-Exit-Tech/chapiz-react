import Navbar from '@/components/layout/Navbar';
import BottomNavigation from '@/components/layout/BottomNavigation';
import UserVouchersPage from '@/components/user/UserVouchersPage';

export default function VouchersPage() {
  return (
    <>
      {/* Navbar - only visible on md and above */}
      <div className="hidden md:block">
        <Navbar />
      </div>
      <UserVouchersPage />
      {/* Bottom Navigation - only visible on mobile */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </>
  );
}

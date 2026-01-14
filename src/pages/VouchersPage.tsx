import Navbar from '@/components/layout/Navbar';
import BottomNavigation from '@/components/layout/BottomNavigation';
import UserVouchersPage from '@/components/user/UserVouchersPage';

export default function VouchersPage() {
  return (
    <>
      {/* Navbar - visible on all screen sizes */}
      <Navbar />
      <UserVouchersPage />
      {/* Bottom Navigation - only visible on mobile */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </>
  );
}

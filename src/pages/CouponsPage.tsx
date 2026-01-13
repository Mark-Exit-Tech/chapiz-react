import Navbar from '@/components/layout/Navbar';
import BottomNavigation from '@/components/layout/BottomNavigation';
import PromosPageClient from '@/components/pages/PromosPageClient';

export default function CouponsPage() {
  return (
    <>
      {/* Navbar - only visible on md and above */}
      <div className="hidden md:block">
        <Navbar />
      </div>
      <PromosPageClient />
      {/* Bottom Navigation - only visible on mobile */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </>
  );
}

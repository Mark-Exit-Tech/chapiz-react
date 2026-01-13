import Navbar from '@/components/layout/Navbar';
import BottomNavigation from '@/components/layout/BottomNavigation';
import PromosPageClient from '@/components/pages/PromosPageClient';

export default function CouponsPage() {
  return (
    <>
      {/* Navbar - visible on all screen sizes */}
      <Navbar />
      <PromosPageClient />
      {/* Bottom Navigation - only visible on mobile */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </>
  );
}

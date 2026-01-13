import Navbar from '@/components/layout/Navbar';
import BottomNavigation from '@/components/layout/BottomNavigation';
import ServicesPageContent from '@/components/pages/servicesPage';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAllBusinesses } from '@/lib/firebase/database/businesses';
import type { Business } from '@/lib/firebase/database/businesses';

interface Ad {
  id: string;
  title: string;
  type: string;
  content: string;
  duration: number;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  phone?: string;
  location?: string;
  description?: string;
  tags?: string[];
  reviews?: any[];
  averageRating?: number;
  totalReviews?: number;
}

// Convert Business to Ad format
const convertBusinessToAd = (business: Business): Ad => {
  return {
    id: business.id,
    title: business.name,
    type: 'image',
    content: business.logoUrl || 'https://via.placeholder.com/300x200?text=Service',
    duration: 30,
    status: 'active',
    startDate: null,
    endDate: null,
    createdAt: business.createdAt,
    phone: business.phone,
    location: business.address,
    description: business.description,
    tags: [],
    reviews: [],
    averageRating: 0,
    totalReviews: 0
  };
};

export default function ServicesPage() {
  const [searchParams] = useSearchParams();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  const businessId = searchParams.get('businessId') || undefined;

  // Fetch businesses from Firebase and convert to Ad format
  useEffect(() => {
    const fetchAds = async () => {
      try {
        console.log('📡 Fetching services from businesses collection...');
        const businesses = await getAllBusinesses();
        
        if (businesses.length === 0) {
          console.warn('⚠️ No businesses found in businesses collection');
        } else {
          console.log(`✅ Successfully loaded ${businesses.length} businesses from Firebase`);
        }
        
        // Convert businesses to Ad format
        const businessAds = businesses.map(convertBusinessToAd);
        setAds(businessAds);
      } catch (error) {
        console.error('❌ Error fetching businesses:', error);
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  return (
    <>
      <Navbar />
      <div
        className="flex grow flex-col h-[calc(100vh-64px)] pb-16 md:pb-0"
        style={{ overflow: 'hidden', touchAction: 'none' }}
      >
        <ServicesPageContent ads={ads} businessId={businessId} />
      </div>
      <BottomNavigation />
    </>
  );
}

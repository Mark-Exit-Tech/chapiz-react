import Navbar from '@/components/layout/Navbar';
import BottomNavigation from '@/components/layout/BottomNavigation';
import ServicesPageContent from '@/components/pages/servicesPage';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

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

export default function ServicesPage() {
  const [searchParams] = useSearchParams();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  const businessId = searchParams.get('businessId') || undefined;

  // TODO: Fetch ads from Supabase
  useEffect(() => {
    const fetchAds = async () => {
      try {
        // Replace this with actual Supabase fetch
        // const { data } = await supabase
        //   .from('ads')
        //   .select('*')
        //   .eq('status', 'active');
        // setAds(data || []);
        setAds([]); // Placeholder
      } catch (error) {
        console.error('Error fetching ads:', error);
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

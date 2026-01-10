import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import BottomNavigation from '@/components/layout/BottomNavigation';
import ServiceDetailsPageClient from '@/components/pages/ServiceDetailsPageClient';
import { getAdById } from '@/lib/supabase/database/ads';
import { useLocale } from '@/hooks/use-locale';

interface Service {
  id: string;
  title: string;
  description?: string;
  content?: string;
  phone?: string;
  location?: string;
  tags?: string[];
  imageUrl?: string;
}

export default function ServiceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const locale = useLocale();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const ad = await getAdById(id);

        if (ad) {
          setService({
            id: ad.id,
            title: ad.title,
            description: ad.description,
            content: ad.content,
            phone: ad.phone,
            location: ad.location,
            tags: ad.tags,
            imageUrl: ad.image_url || ad.content,
          });
        } else {
          setService(null);
        }
      } catch (error) {
        console.error('Error fetching service:', error);
        setService(null);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex grow flex-col h-[calc(100vh-64px)] pb-16 md:pb-0 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <BottomNavigation />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex grow flex-col h-[calc(100vh-64px)] pb-16 md:pb-0">
        <ServiceDetailsPageClient service={service} />
      </div>
      <BottomNavigation />
    </>
  );
}

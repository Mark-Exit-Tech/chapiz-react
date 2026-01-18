import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import ServiceDetailsPageClient from '@/components/pages/ServiceDetailsPageClient';
import { getBusinessById } from '@/lib/firebase/database/businesses';
import { getAdById } from '@/lib/firebase/database/advertisements';
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
        console.log(`📡 Fetching service details for ID: ${id}`);
        
        // Try fetching from businesses collection first
        const business = await getBusinessById(id);

        if (business) {
          console.log('✅ Found business:', business.name);
          setService({
            id: business.id,
            title: business.name,
            description: business.description || '',
            content: business.imageUrl || business.logoUrl,
            phone: business.contactInfo?.phone || business.phone,
            location: business.contactInfo?.address || business.address,
            tags: business.tags || [],
            imageUrl: business.imageUrl || business.logoUrl,
          });
        } else {
          // Fallback: try advertisements collection
          console.log('⚠️ Business not found, trying advertisements collection...');
          const ad = await getAdById(id);
          
          if (ad) {
            console.log('✅ Found advertisement:', ad.title);
            setService({
              id: ad.id,
              title: ad.title,
              description: ad.description,
              content: ad.content,
              phone: ad.phone,
              location: ad.location,
              tags: ad.tags,
              imageUrl: ad.imageUrl || ad.content,
            });
          } else {
            console.warn('❌ Service not found in either collection');
            setService(null);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching service:', error);
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
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex grow flex-col h-[calc(100vh-64px)] pb-16 md:pb-0">
        <ServiceDetailsPageClient service={service} />
      </div>
    </>
  );
}

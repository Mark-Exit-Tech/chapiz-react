import { useEffect, useMemo, useState } from 'react';
import PetsPageClient from './PetsPageClient';
import { getAllPetsForAdmin } from '@/lib/actions/admin';

export default function AdminPetsPage() {
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useMemo(() => {
    if (typeof window === 'undefined') return {};
    const params = new URLSearchParams(window.location.search);
    return {
      page: params.get('page') || undefined,
      limit: params.get('limit') || undefined,
      search: params.get('search') || undefined,
      sort: params.get('sort') || undefined,
      order: (params.get('order') as 'asc' | 'desc' | null) || undefined,
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadPets = async () => {
      try {
        const result = await getAllPetsForAdmin();
        if (cancelled) return;

        setPets(result.map((pet: any) => ({
          id: pet.id,
          name: pet.name || pet.petName || '',
          type: pet.type || '',
          breed: pet.breedName || pet.breed || '',
          gender: pet.gender || '',
          weight: pet.weight || '',
          imageUrl: pet.imageUrl || pet.image_url || '',
          ownerName: pet.ownerFullName || pet.ownerName || pet.userEmail || '',
          ownerId: pet.ownerId || '',
          isLost: Boolean(pet.isLost),
          createdAt: pet.createdAt || new Date(),
        })));
      } catch (error) {
        console.error('Error loading admin pets:', error);
        if (!cancelled) setPets([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPets();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return <PetsPageClient pets={pets} searchParams={searchParams} />;
}

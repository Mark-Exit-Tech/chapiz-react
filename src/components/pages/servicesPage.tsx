'use client';

import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/use-locale';
import { useNavigate, useSearchParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { FilterChips, FilterChip } from '../ui/filter-chips';
import { TagsFilter } from '../ui/tags-filter';
import { Button } from '../ui/button';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { getUserFavorites } from '@/lib/firebase/database/favorites';
import { HEBREW_SERVICE_TAGS, SERVICE_TAGS_TRANSLATIONS } from '@/lib/constants/hebrew-service-tags';
import ServicesMapView from './ServicesMapView';

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
  coordinates?: { lat: number; lng: number };
}

interface ServicesPageProps {
  ads: Ad[];
  businessId?: string;
}



// Function to convert ad to service format
const convertAdToService = (ad: Ad & { imageUrl?: string }) => {
  return {
    id: ad.id, // Add ad ID for comments
    location: ad.location || 'ישראל',
    image: ad.imageUrl || ad.content || 'https://via.placeholder.com/300x200?text=Service+Image',
    name: ad.title,
    // Use real tags from the ad - if no tags exist, use empty array instead of fallback
    tags: ad.tags || [],
    // Use real description from the ad - if no description exists, use empty string instead of fallback
    description: ad.description || '',
    phone: ad.phone || '',
    address: ad.location || '',
    // Pass through coordinates from ad
    coordinates: ad.coordinates
  };
};

const ServicesPage: React.FC<ServicesPageProps> = ({ ads, businessId }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, dbUser } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [favoriteAdIds, setFavoriteAdIds] = useState<string[]>([]);
  // Initialize filterType from URL parameter, default to 'all'
  const [filterType, setFilterType] = useState<'all' | 'favorites'>(() => {
    const filterParam = searchParams.get('filter');
    return filterParam === 'favorites' ? 'favorites' : 'all';
  });
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  
  const isHebrew = locale === 'he';

  // HARDCODED TEXT - NO TRANSLATION KEYS!
  const text = {
    title: isHebrew ? 'שירותים' : 'Services',
    loading: isHebrew ? 'טוען...' : 'Loading...',
    filterByProfession: isHebrew ? 'סנן לפי מקצוע' : 'Filter by profession',
    searchPlaceholder: isHebrew ? 'חפש שירותים...' : 'Search services...',
    removeFilter: isHebrew ? 'הסר סינון' : 'Remove Filter',
    filters: {
      all: isHebrew ? 'הכל' : 'All',
      favorites: isHebrew ? 'מועדפים' : 'Favorites',
    },
    tags: {
      clearAll: isHebrew ? 'נקה הכל' : 'Clear All',
      searchPlaceholder: isHebrew ? 'חפש תגיות...' : 'Search tags...',
      selected: isHebrew ? '{count} תגית נבחרה' : '{count} tag selected',
      selectedPlural: isHebrew ? '{count} תגיות נבחרו' : '{count} tags selected',
      noTagsFound: isHebrew ? 'לא נמצאו תגיות.' : 'No tags found.',
    }
  };

  // Function to translate tags for display
  const translateTag = (tag: string): string => {
    if (locale === 'en' && SERVICE_TAGS_TRANSLATIONS[tag as keyof typeof SERVICE_TAGS_TRANSLATIONS]) {
      return SERVICE_TAGS_TRANSLATIONS[tag as keyof typeof SERVICE_TAGS_TRANSLATIONS];
    }
    return tag;
  };

  // Convert ads to services
  const services = ads.map(convertAdToService);

  // Load available tags and user favorites - prioritize favorites if filter is active
  useEffect(() => {
    const loadData = async () => {
      try {
        // Use predefined Hebrew service tags (same as admin panel)
        setAvailableTags(HEBREW_SERVICE_TAGS);
        setIsLoadingTags(false);

        // Load user favorites if logged in - prioritize if favorites filter is active
        if (user) {
          const favorites = await getUserFavorites(user.uid);
          // Extract just the service IDs from the favorites
          const favoriteIds = favorites.map(fav => fav.serviceId);
          setFavoriteAdIds(favoriteIds);
          
          // If favorites filter is active and we have favorite IDs, we're ready to show
          // (services will be filtered immediately when ads load)
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoadingTags(false);
      }
    };

    loadData();
  }, [user, filterType]);

  // Filter services based on businessId, search, tags, and favorites
  const filteredServices = services.filter((service) => {
    // Business ID filter - if businessId is provided, only show matching businesses
    // Support comma-separated business IDs for multiple businesses
    if (businessId) {
      const businessIds = businessId.split(',').map(id => id.trim());
      if (!businessIds.includes(service.id)) {
        return false;
      }
    }

    // Search filter
    const matchesSearch = service.name.toLowerCase().includes(search.toLowerCase()) ||
      service.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));

    // Tags filter
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.some(selectedTag => service.tags.includes(selectedTag));

    // Favorites filter
    const matchesFavorites = filterType === 'all' ||
      (filterType === 'favorites' && favoriteAdIds.includes(service.id || ''));

    return matchesSearch && matchesTags && matchesFavorites;
  });

  // Filter chips configuration
  const filterChips: FilterChip[] = [
    {
      id: 'all',
      label: text.filters.all,
      active: filterType === 'all'
    },
    {
      id: 'favorites',
      label: text.filters.favorites,
      active: filterType === 'favorites'
    }
  ];

  const handleChipClick = (chipId: string) => {
    const newFilterType = chipId as 'all' | 'favorites';
    setFilterType(newFilterType);
    // Update URL parameter
    const newSearchParams = new URLSearchParams(searchParams);
    if (newFilterType === 'favorites') {
      newSearchParams.set('filter', 'favorites');
    } else {
      newSearchParams.delete('filter');
    }
    setSearchParams(newSearchParams, { replace: true });
  };

  // Sync filterType with URL parameter when it changes externally
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam === 'favorites' && filterType !== 'favorites') {
      setFilterType('favorites');
    } else if (filterParam !== 'favorites' && filterType === 'favorites' && !filterParam) {
      setFilterType('all');
    }
  }, [searchParams]);


  // When favorites is active and we have favorite IDs but no ads yet, show empty array
  // This prevents glitching while waiting for all businesses to load
  const servicesToDisplay = filterType === 'favorites' && ads.length === 0 && favoriteAdIds.length > 0
    ? []
    : filteredServices;

  return (
    <>
      {/* Combined Map and List View */}
      <div className="w-full h-full">
        <ServicesMapView
          services={servicesToDisplay}
          initialHighlightedServiceId={businessId}
          filterType={filterType}
          headerContent={
            <div className="space-y-4">
              {/* Title and Filter Chips on Same Row */}
              <div className="mb-4 flex flex-row items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">{text.title}</h1>
                <FilterChips
                  chips={filterChips}
                  onChipClick={handleChipClick}
                />
              </div>

              {/* Search Bar and Filter Row */}
              <div className="flex flex-row gap-3">
                {/* Tags Filter */}
                <div className="w-[200px] shrink-0">
                  <TagsFilter
                    tags={availableTags}
                    selectedTags={selectedTags}
                    onTagsChange={setSelectedTags}
                    placeholder={isLoadingTags ? text.loading : text.filterByProfession}
                    clearAllText={text.tags.clearAll}
                    searchTagsPlaceholder={text.tags.searchPlaceholder}
                    tagsSelectedText={text.tags.selected}
                    tagsSelectedPluralText={text.tags.selectedPlural}
                    noTagsFoundText={text.tags.noTagsFound}
                    className="w-full"
                    translateTag={translateTag}
                  />
                </div>

                {/* Search Bar */}
                <div className="relative h-9 grow rounded-lg bg-white border border-gray-200">
                  <Search
                    className="absolute top-1/2 -translate-y-1/2 transform text-gray-400 ltr:left-3 rtl:right-3"
                    size={16}
                  />
                  <Input
                    placeholder={text.searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg p-2 ltr:pl-10 rtl:pr-10 border-none focus-visible:ring-0"
                  />
                </div>
              </div>

              {/* Remove Filter Button - New Row */}
              {businessId && (
                <div className="flex justify-start">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/${locale}/services`)}
                    className="flex items-center gap-2 border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-600"
                  >
                    <X className="h-4 w-4" />
                    {text.removeFilter}
                  </Button>
                </div>
              )}
            </div>
          }
        />
      </div>
    </>
  );
};

export default ServicesPage;

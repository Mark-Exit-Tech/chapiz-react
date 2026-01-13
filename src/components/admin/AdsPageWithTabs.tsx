'use client';

import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import AddAdForm from '@/components/admin/AddAdForm';
import AdsTable from '@/components/admin/AdsTable';

interface AdsPageProps {
  searchParams?: {
    page?: string;
    limit?: string;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    tab?: string;
  };
}

export default function AdsPage({ searchParams: propsSearchParams }: AdsPageProps) {
  const { t } = useTranslation('Admin');
  const [urlSearchParams] = useSearchParams();
  
  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';
  
  // HARDCODED TEXT
  const text = {
    title: isHebrew ? 'ניהול מודעות' : 'Ads Management',
    description: isHebrew ? 'נהלו וערכו את כל המודעות בפלטפורמה' : 'Manage and edit all ads on the platform'
  };
  
  // Use searchParams from props if provided, otherwise get from URL
  const searchParams = propsSearchParams || {
    page: urlSearchParams.get('page') || undefined,
    limit: urlSearchParams.get('limit') || undefined,
    search: urlSearchParams.get('search') || undefined,
    sort: urlSearchParams.get('sort') || undefined,
    order: (urlSearchParams.get('order') as 'asc' | 'desc') || undefined,
    tab: urlSearchParams.get('tab') || undefined,
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 rtl:flex-row-reverse">
          <AddAdForm />
            <div className="text-left rtl:text-right">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {text.title}
            </h1>
              <p className="text-gray-600 mt-2 text-sm md:text-base">
              {text.description}
              </p>
          </div>
          </div>
          
        <AdsTable />
          </div>
    </div>
  );
}

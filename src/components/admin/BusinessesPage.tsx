'use client';

import { useTranslation } from 'react-i18next';
import AddBusinessForm from '@/components/admin/AddBusinessForm';
import BusinessesTable from '@/components/admin/BusinessesTable';
import AdminLayout from '@/components/admin/AdminLayout';

export default function BusinessesPage() {
  const { t } = useTranslation('Admin');
  
  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';
  
  // HARDCODED TEXT
  const text = {
    title: isHebrew ? 'ניהול עסקים' : 'Business Management',
    description: isHebrew ? 'הוסף וערוך עסקים בפלטפורמה' : 'Add and edit businesses on the platform'
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="text-left rtl:text-right order-2 rtl:order-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-left rtl:text-right">
              {text.title}
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base text-left rtl:text-right">
              {text.description}
            </p>
          </div>
          <div className="order-1 rtl:order-2">
            <AddBusinessForm />
          </div>
        </div>

        <BusinessesTable />
      </div>
    </AdminLayout>
  );
}


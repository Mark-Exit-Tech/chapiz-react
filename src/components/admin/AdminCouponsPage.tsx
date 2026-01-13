'use client';

import { useTranslation } from 'react-i18next';
import AddCouponForm from '@/components/admin/AddCouponForm';
import CouponsTable from '@/components/admin/CouponsTable';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminCouponsPage() {
  const { t } = useTranslation('Admin');
  
  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';
  
  // HARDCODED TEXT
  const text = {
    title: isHebrew ? 'ניהול קופונים' : 'Coupons Management',
    description: isHebrew ? 'נהלו וערכו את כל הקופונים בפלטפורמה' : 'Manage and edit all coupons on the platform'
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
            <AddCouponForm />
          </div>
        </div>

        <CouponsTable />
      </div>
    </AdminLayout>
  );
}
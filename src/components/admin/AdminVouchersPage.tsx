'use client';

import { useTranslation } from 'react-i18next';

export default function AdminVouchersPage() {
  const { t } = useTranslation('Admin');
  
  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';
  
  // HARDCODED TEXT
  const text = {
    title: isHebrew ? 'ניהול שוברים' : 'Vouchers Management',
    description: isHebrew ? 'נהלו וערכו את כל השוברים בפלטפורמה' : 'Manage and edit all vouchers on the platform',
    comingSoon: isHebrew ? 'בקרוב...' : 'Coming soon...',
    underDevelopment: isHebrew ? 'עמוד זה בפיתוח' : 'This page is under development'
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="text-left rtl:text-right">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-left rtl:text-right">
            {text.title}
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base text-left rtl:text-right">
            {text.description}
          </p>
        </div>
      </div>

      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🎫</div>
        <h2 className="text-xl font-semibold mb-2">{text.comingSoon}</h2>
        <p className="text-gray-500">{text.underDevelopment}</p>
      </div>
    </div>
  );
}

'use client';

import { Gift, Ticket, PawPrint, MapPin, Mail, LogIn } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePathname } from '@/i18n/routing';
import { useAuth } from '@/contexts/FirebaseAuthContext';

export default function BottomNavigation() {
  const pathname = usePathname();
  const { t, i18n } = useTranslation('components');
  const { user, dbUser } = useAuth();

  // Get locale from i18n (works correctly on root path without locale prefix)
  const locale = i18n.language || 'en';
  const isHebrew = locale === 'he';

  // Strip locale prefix from pathname for checking routes
  // pathname could be /he/services or /en/services, we want /services
  const pathWithoutLocale = pathname?.startsWith(`/${locale}/`) 
    ? pathname.substring(`/${locale}`.length) 
    : pathname?.startsWith('/he/') || pathname?.startsWith('/en/')
      ? pathname.substring(3) // Remove /he or /en
      : pathname || '';

  // Don't show bottom navigation on admin routes
  const isAdminRoute = pathWithoutLocale?.startsWith('/admin') || pathname?.startsWith('/admin');
  if (isAdminRoute) {
    return null;
  }

  // Don't show bottom navigation on detail pages
  // Check if pathname matches detail page patterns: /services/[id], /coupons/[id], /vouchers/[id], /pet/[id], /promos/[id]
  const isDetailPage = pathWithoutLocale && (
    (pathWithoutLocale.startsWith('/services/') && pathWithoutLocale !== '/services') || // /services/[id] but not /services
    (pathWithoutLocale.startsWith('/coupons/') && pathWithoutLocale !== '/coupons') || // /coupons/[id] but not /coupons
    (pathWithoutLocale.startsWith('/vouchers/') && pathWithoutLocale !== '/vouchers') || // /vouchers/[id] but not /vouchers
    (pathWithoutLocale.startsWith('/pet/') && pathWithoutLocale !== '/pet') || // /pet/[id] but not /pet
    (pathWithoutLocale.startsWith('/promos/') && pathWithoutLocale !== '/promos') // /promos/[id] but not /promos
  );
  if (isDetailPage) {
    return null;
  }

  // Navigation items for logged-in users
  const loggedInNavItems = [
    {
      href: `/${locale}/my-pets`,
      icon: PawPrint,
      label: isHebrew ? 'חיות המחמד שלי' : 'My Pets',
      isActive: pathWithoutLocale?.startsWith('/my-pets'),
    },
    {
      href: `/${locale}/coupons`,
      icon: Ticket,
      label: isHebrew ? 'קופונים' : 'Coupons',
      isActive: pathWithoutLocale?.startsWith('/coupons') && !pathWithoutLocale.startsWith('/coupons/'),
    },
    {
      href: `/${locale}/vouchers`,
      icon: Gift,
      label: isHebrew ? 'מתנות ושוברים' : 'Gifts & Vouchers',
      isActive: pathWithoutLocale?.startsWith('/vouchers') && !pathWithoutLocale.startsWith('/vouchers/'),
    },
    {
      href: `/${locale}/services`,
      icon: MapPin,
      label: isHebrew ? 'עסקים קרובים' : 'Businesses Nearby',
      isActive: pathWithoutLocale?.startsWith('/services') && !pathWithoutLocale.startsWith('/services/'),
    },
  ];

  // Don't show bottom navigation for non-logged-in users
  if (!user) {
    return null;
  }

  const navItems = loggedInNavItems;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[99999] bg-white border-t-2 border-gray-300 shadow-lg md:hidden"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}
    >
      <nav className="flex items-center justify-around px-1 pt-2 pb-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <RouterLink
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-all duration-200 ${item.isActive
                ? 'text-primary bg-primary/10'
                : 'text-gray-600 hover:text-primary hover:bg-primary/5 hover:scale-105 active:scale-95'
                }`}
            >
              <Icon className={`h-6 w-6 mb-1 transition-transform ${item.isActive ? 'text-primary' : ''}`} />
              <span className={`text-[10px] font-medium text-center leading-tight ${item.isActive ? 'text-primary' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </RouterLink>
          );
        })}
      </nav>
    </div>
  );
}

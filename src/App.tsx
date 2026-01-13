import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './contexts/FirebaseAuthContext';
import HomePage from './pages/HomePage';

// Lazy load pages - reduces initial bundle size
const AuthPage = lazy(() => import('./pages/AuthPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const MyPetsPage = lazy(() => import('./pages/MyPetsPage'));
const CouponsPage = lazy(() => import('./pages/CouponsPage'));
const VouchersPage = lazy(() => import('./pages/VouchersPage'));
const UserSettingsPage = lazy(() => import('./pages/UserSettingsPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ServiceDetailsPage = lazy(() => import('./pages/ServiceDetailsPage'));
const AddPetPage = lazy(() => import('./components/AddPetPage'));

// Admin sub-pages
const AdminUsersPage = lazy(() => import('./components/admin/AdminUsersPage'));
const AdsPageWithTabs = lazy(() => import('./components/admin/AdsPageWithTabs'));
const PromosPage = lazy(() => import('./components/admin/PromosPage'));
const AdminCouponsPage = lazy(() => import('./components/admin/AdminCouponsPage'));
const AdminBusinessesPage = lazy(() => import('./components/admin/AdminBusinessesPage'));
const ContactSubmissionsPage = lazy(() => import('./components/admin/ContactSubmissionsPage'));
const AdminPetsPage = lazy(() => import('./components/admin/AdminPetsPage'));
const AdminCommentsPage = lazy(() => import('./components/admin/AdminCommentsPage'));
const AdminVouchersPage = lazy(() => import('./components/admin/AdminVouchersPage'));
const AdminSettingsPage = lazy(() => import('./components/admin/AdminSettingsPage'));
const BusinessesPage = lazy(() => import('./components/admin/BusinessesPage'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function App() {
  const { i18n } = useTranslation();

  // Get current language from i18n
  const currentLang = i18n.language || 'en';

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Redirect root to default language */}
          <Route path="/" element={<Navigate to={`/${currentLang}`} replace />} />

          {/* Redirect non-locale routes to locale routes */}
          <Route path="/auth" element={<Navigate to={`/${currentLang}/auth`} replace />} />
          <Route path="/login" element={<Navigate to={`/${currentLang}/login`} replace />} />
          <Route path="/signup" element={<Navigate to={`/${currentLang}/signup`} replace />} />
          <Route path="/contact" element={<Navigate to={`/${currentLang}/contact`} replace />} />
          <Route path="/my-pets" element={<Navigate to={`/${currentLang}/my-pets`} replace />} />
          <Route path="/pages/my-pets" element={<Navigate to={`/${currentLang}/my-pets`} replace />} />
          <Route path="/add-pet" element={<Navigate to={`/${currentLang}/add-pet`} replace />} />
          <Route path="/coupons" element={<Navigate to={`/${currentLang}/coupons`} replace />} />
          <Route path="/vouchers" element={<Navigate to={`/${currentLang}/vouchers`} replace />} />
          <Route path="/user/settings" element={<Navigate to={`/${currentLang}/user/settings`} replace />} />
          
          {/* Admin route redirects */}
          <Route path="/admin" element={<Navigate to={`/${currentLang}/admin`} replace />} />
          <Route path="/admin/*" element={<Navigate to={`/${currentLang}/admin`} replace />} />
          
          <Route path="/services" element={<Navigate to={`/${currentLang}/services`} replace />} />
          <Route path="/privacy" element={<Navigate to={`/${currentLang}/privacy`} replace />} />
          <Route path="/terms" element={<Navigate to={`/${currentLang}/terms`} replace />} />

          {/* Locale-based routes */}
          <Route path="/:locale" element={<HomePage />} />
          <Route path="/:locale/auth" element={<Suspense fallback={<PageLoader />}><AuthPage /></Suspense>} />
          <Route path="/:locale/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
          <Route path="/:locale/signup" element={<Suspense fallback={<PageLoader />}><SignupPage /></Suspense>} />
          <Route path="/:locale/contact" element={<Suspense fallback={<PageLoader />}><ContactPage /></Suspense>} />
          <Route path="/:locale/my-pets" element={<Suspense fallback={<PageLoader />}><MyPetsPage /></Suspense>} />
          <Route path="/:locale/add-pet" element={<Suspense fallback={<PageLoader />}><AddPetPage /></Suspense>} />
          <Route path="/:locale/coupons" element={<Suspense fallback={<PageLoader />}><CouponsPage /></Suspense>} />
          <Route path="/:locale/vouchers" element={<Suspense fallback={<PageLoader />}><VouchersPage /></Suspense>} />
          <Route path="/:locale/user/settings" element={<Suspense fallback={<PageLoader />}><UserSettingsPage /></Suspense>} />
          
          {/* Admin routes */}
          <Route path="/:locale/admin" element={<Suspense fallback={<PageLoader />}><AdminPage /></Suspense>} />
          <Route path="/:locale/admin/users" element={<Suspense fallback={<PageLoader />}><AdminUsersPage /></Suspense>} />
          <Route path="/:locale/admin/ads" element={<Suspense fallback={<PageLoader />}><AdsPageWithTabs /></Suspense>} />
          <Route path="/:locale/admin/promos" element={<Suspense fallback={<PageLoader />}><PromosPage /></Suspense>} />
          <Route path="/:locale/admin/coupons" element={<Suspense fallback={<PageLoader />}><AdminCouponsPage /></Suspense>} />
          <Route path="/:locale/admin/vouchers" element={<Suspense fallback={<PageLoader />}><AdminVouchersPage /></Suspense>} />
          <Route path="/:locale/admin/businesses" element={<Suspense fallback={<PageLoader />}><AdminBusinessesPage /></Suspense>} />
          <Route path="/:locale/admin/business" element={<Suspense fallback={<PageLoader />}><BusinessesPage /></Suspense>} />
          <Route path="/:locale/admin/contact-submissions" element={<Suspense fallback={<PageLoader />}><ContactSubmissionsPage /></Suspense>} />
          <Route path="/:locale/admin/pets" element={<Suspense fallback={<PageLoader />}><AdminPetsPage /></Suspense>} />
          <Route path="/:locale/admin/comments" element={<Suspense fallback={<PageLoader />}><AdminCommentsPage /></Suspense>} />
          <Route path="/:locale/admin/settings" element={<Suspense fallback={<PageLoader />}><AdminSettingsPage /></Suspense>} />
          
          <Route path="/:locale/services" element={<Suspense fallback={<PageLoader />}><ServicesPage /></Suspense>} />
          <Route path="/:locale/services/:id" element={<Suspense fallback={<PageLoader />}><ServiceDetailsPage /></Suspense>} />
          <Route path="/:locale/privacy" element={<Suspense fallback={<PageLoader />}><PrivacyPage /></Suspense>} />
          <Route path="/:locale/terms" element={<Suspense fallback={<PageLoader />}><TermsPage /></Suspense>} />
          <Route path="/:locale/*" element={<HomePage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ContactPage from './pages/ContactPage';
import MyPetsPage from './pages/MyPetsPage';
import CouponsPage from './pages/CouponsPage';
import VouchersPage from './pages/VouchersPage';
import UserSettingsPage from './pages/UserSettingsPage';
import AdminPage from './pages/AdminPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ServicesPage from './pages/ServicesPage';

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
          <Route path="/contact" element={<Navigate to={`/${currentLang}/contact`} replace />} />
          <Route path="/my-pets" element={<Navigate to={`/${currentLang}/my-pets`} replace />} />
          <Route path="/pages/my-pets" element={<Navigate to={`/${currentLang}/my-pets`} replace />} />
          <Route path="/coupons" element={<Navigate to={`/${currentLang}/coupons`} replace />} />
          <Route path="/vouchers" element={<Navigate to={`/${currentLang}/vouchers`} replace />} />
          <Route path="/user/settings" element={<Navigate to={`/${currentLang}/user/settings`} replace />} />
          <Route path="/admin" element={<Navigate to={`/${currentLang}/admin`} replace />} />
          <Route path="/services" element={<Navigate to={`/${currentLang}/services`} replace />} />
          <Route path="/privacy" element={<Navigate to={`/${currentLang}/privacy`} replace />} />
          <Route path="/terms" element={<Navigate to={`/${currentLang}/terms`} replace />} />

          {/* Locale-based routes */}
          <Route path="/:locale" element={<HomePage />} />
          <Route path="/:locale/auth" element={<AuthPage />} />
          <Route path="/:locale/contact" element={<ContactPage />} />
          <Route path="/:locale/my-pets" element={<MyPetsPage />} />
          <Route path="/:locale/coupons" element={<CouponsPage />} />
          <Route path="/:locale/vouchers" element={<VouchersPage />} />
          <Route path="/:locale/user/settings" element={<UserSettingsPage />} />
          <Route path="/:locale/admin" element={<AdminPage />} />
          <Route path="/:locale/services" element={<ServicesPage />} />
          <Route path="/:locale/privacy" element={<PrivacyPage />} />
          <Route path="/:locale/terms" element={<TermsPage />} />
          <Route path="/:locale/*" element={<HomePage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

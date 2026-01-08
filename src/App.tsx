import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

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

          {/* Locale-based routes */}
          <Route path="/:locale" element={<HomePage />} />
          <Route path="/:locale/contact" element={<ContactPage />} />
          <Route path="/:locale/privacy" element={<PrivacyPage />} />
          <Route path="/:locale/terms" element={<TermsPage />} />
          <Route path="/:locale/*" element={<HomePage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

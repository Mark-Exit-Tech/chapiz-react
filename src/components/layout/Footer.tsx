import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import LocaleSwitcher from '../LocaleSwitcher';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t">
      <div className="py-8">
        <div className="flex flex-col items-center gap-6">
          {/* Useful Links Section */}
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-sm font-semibold text-gray-700">{t('components.Footer.usefulLinks')}</h3>
            <div className="flex gap-6 text-sm">
              <Link to="/services" className="hover:text-primary transition-colors">
                {t('components.Footer.services')}
              </Link>
              <Link to="/terms" className="hover:text-primary transition-colors">
                {t('components.Footer.termsOfService')}
              </Link>
              <Link to="/privacy" className="hover:text-primary transition-colors">
                {t('components.Footer.privacyPolicy')}
              </Link>
            </div>
          </div>

          {/* Language Switcher Row */}
          <div className="flex items-center justify-center">
            <LocaleSwitcher />
          </div>

          {/* Love Message Row */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="opacity-90">{t('components.Footer.madeWithLove')}</span>
            <Heart className="text-primary m-1 h-4 w-4" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

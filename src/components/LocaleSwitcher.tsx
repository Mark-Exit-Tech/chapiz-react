import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import React from 'react';

const LocaleSwitcher: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const currentLocale = i18n.language || 'en';

  const handleLocaleChange = (newLocale: string) => {
    // Change i18n language
    i18n.changeLanguage(newLocale);
    localStorage.setItem('i18nextLng', newLocale);

    // Update URL
    const pathParts = location.pathname.split('/');
    pathParts[1] = newLocale; // Replace locale in path
    navigate(pathParts.join('/'));
  };

  return (
    <Select value={currentLocale} onValueChange={handleLocaleChange}>
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="Select Locale" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">🇺🇸 English</SelectItem>
        <SelectItem value="he">🇮🇱 עברית</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default LocaleSwitcher;


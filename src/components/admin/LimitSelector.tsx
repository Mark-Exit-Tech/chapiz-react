'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface LimitSelectorProps {
  currentLimit: number;
  baseUrl: string;
  searchParams: Record<string, string>;
  translationPath?: string;
}

export function LimitSelector({
  currentLimit,
  baseUrl,
  searchParams,
  translationPath = 'adsManagement'
}: LimitSelectorProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('Admin');

  const handleLimitChange = (value: string) => {
    const params = new URLSearchParams();

    // Add all existing search params except page and limit
    for (const [key, val] of Object.entries(searchParams)) {
      if (key !== 'page' && key !== 'limit') {
        params.set(key, val);
      }
    }

    // Set the new limit and reset to page 1
    params.set('limit', value);
    params.set('page', '1');

    // Navigate to the new URL
    navigate(`${baseUrl}?${params.toString()}`);
  };

  return (
    <Select
      defaultValue={currentLimit.toString()}
      onValueChange={handleLimitChange}
    >
      <SelectTrigger className="w-[120px] bg-white">
        <SelectValue placeholder={t(`${translationPath}.pagination.10PerPage`)} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="5">{t(`${translationPath}.pagination.5PerPage`)}</SelectItem>
        <SelectItem value="10">{t(`${translationPath}.pagination.10PerPage`)}</SelectItem>
        <SelectItem value="20">{t(`${translationPath}.pagination.20PerPage`)}</SelectItem>
        <SelectItem value="50">{t(`${translationPath}.pagination.50PerPage`)}</SelectItem>
      </SelectContent>
    </Select>
  );
}

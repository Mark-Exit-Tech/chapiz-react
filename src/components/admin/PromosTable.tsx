'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Youtube } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Promo, Business } from '@/types/promo';
import { getPromos, getBusinesses, updatePromo, deletePromo } from '@/lib/actions/admin';
import EditPromoDialog from './EditPromoDialog';
import { getYouTubeThumbnailUrl } from '@/lib/utils/youtube';

export default function PromosTable() {
  const { t } = useTranslation('Admin');

  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';

  // HARDCODED TEXT
  const text = {
    actions: isHebrew ? 'פעולות' : 'Actions',
    edit: isHebrew ? 'ערוך' : 'Edit',
    delete: isHebrew ? 'מחק' : 'Delete'
  };

  const [promos, setPromos] = useState<Promo[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [promosResult, businessesResult] = await Promise.all([
        getPromos(),
        getBusinesses()
      ]);

      if (promosResult.success) {
        setPromos(promosResult.promos);
      } else {
        setError(promosResult.error || 'Failed to fetch promos');
      }

      if (businessesResult.success) {
        setBusinesses(businessesResult.businesses);
      }
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (promo: Promo) => {
    try {
      const result = await updatePromo(promo.id, { isActive: !promo.isActive });
      if (result.success) {
        setPromos(prev => 
          prev.map(p => 
            p.id === promo.id ? { ...p, isActive: !p.isActive } : p
          )
        );
      } else {
        setError(result.error || 'Failed to update promo');
      }
    } catch (err) {
      setError('Failed to update promo');
      console.error(err);
    }
  };

  const handleEdit = (promo: Promo) => {
    console.log('Edit clicked for promo:', promo);
    setEditingPromo(promo);
    setIsEditOpen(true);
  };

  const handleEditSuccess = () => {
    fetchData();
    setIsEditOpen(false);
    setEditingPromo(null);
  };

  const handleDelete = async (promo: Promo) => {
    if (!confirm(t('promoManagement.confirmDelete', { name: promo.name }))) {
      return;
    }

    try {
      const result = await deletePromo(promo.id);
      if (result.success) {
        setPromos(prev => prev.filter(p => p.id !== promo.id));
      } else {
        setError(result.error || 'Failed to delete promo');
      }
    } catch (err) {
      setError('Failed to delete promo');
      console.error(err);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getBusinessName = (businessId?: string) => {
    if (!businessId) return null;
    const business = businesses.find(b => b.id === businessId);
    return business ? business.name : t('promoManagement.unknownBusiness');
  };

  const getBusinessNames = (promo: Promo) => {
    // Support both old businessId and new businessIds format
    const businessIds = promo.businessIds || (promo.businessId ? [promo.businessId] : []);
    
    if (businessIds.length === 0) {
      return [t('promoManagement.unknownBusiness')];
    }
    
    return businessIds.map(id => {
      const business = businesses.find(b => b.id === id);
      return business ? business.name : t('promoManagement.unknownBusiness');
    });
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded border border-red-400 bg-red-100 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={isHebrew ? 'text-right' : ''}>{t('promoManagement.name')}</TableHead>
              <TableHead className={isHebrew ? 'text-right' : ''}>{t('promoManagement.image')}</TableHead>
              <TableHead className={isHebrew ? 'text-right' : ''}>{t('promoManagement.description')}</TableHead>
              <TableHead className={isHebrew ? 'text-right' : ''}>{t('promoManagement.business')}</TableHead>
              <TableHead className={isHebrew ? 'text-right' : ''}>{t('promoManagement.status')}</TableHead>
              <TableHead className={isHebrew ? 'text-right' : ''}>{t('promoManagement.createdAt')}</TableHead>
              <TableHead className={`w-[50px] ${isHebrew ? 'text-right' : 'text-center'}`}>{text.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  {t('promoManagement.noPromos')}
                </TableCell>
              </TableRow>
            ) : (
              promos.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className={`font-medium ${isHebrew ? 'text-right' : ''}`}>{promo.name}</TableCell>
                  <TableCell className={isHebrew ? 'text-right' : ''}>
                    {promo.youtubeUrl ? (
                      <div className="relative w-16 h-10 rounded-md overflow-hidden">
                        <img
                          src={getYouTubeThumbnailUrl(promo.youtubeUrl) || ''}
                          alt={promo.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Youtube className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    ) : promo.imageUrl ? (
                      <div className="w-16 h-10 rounded-md overflow-hidden">
                        <img
                          src={promo.imageUrl}
                          alt={promo.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                        <img className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className={`max-w-xs truncate ${isHebrew ? 'text-right' : ''}`}>
                    {promo.description}
                  </TableCell>
                  <TableCell className={isHebrew ? 'text-right' : ''}>
                    <div className="flex flex-wrap gap-1">
                      {getBusinessNames(promo).map((businessName, index) => (
                        <Badge key={index} variant="outline">
                          {businessName}
                    </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className={isHebrew ? 'text-right' : ''}>
                    <Badge variant={promo.isActive ? 'default' : 'secondary'}>
                    {promo.isActive ? t('status.active') : t('status.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-sm text-gray-500 ${isHebrew ? 'text-right' : ''}`}>
                    {formatDate(promo.createdAt)}
                  </TableCell>
                  <TableCell className={isHebrew ? 'text-right' : 'text-center'}>
                    <select
                      className="h-8 w-8 p-0 border-0 bg-transparent cursor-pointer appearance-none text-center"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === 'edit') handleEdit(promo);
                        if (value === 'delete') handleDelete(promo);
                        e.target.value = '';
                      }}
                      value=""
                      title={text.actions}
                    >
                      <option value="" disabled>⋮</option>
                      <option value="edit">{text.edit}</option>
                      <option value="delete">{text.delete}</option>
                    </select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {editingPromo && (
        <EditPromoDialog
          promo={editingPromo}
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setEditingPromo(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}

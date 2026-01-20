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
import { useTranslation } from 'react-i18next';
import { Filter, Audience } from '@/types/promo';
import { getFilters, updateFilter, deleteFilter, getAudiences } from '@/lib/actions/admin';
import EditFilterDialog from './EditFilterDialog';

export default function FiltersTable() {
  const { t } = useTranslation('Admin');
  const [filters, setFilters] = useState<Filter[]>([]);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingFilter, setEditingFilter] = useState<Filter | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [filtersResult, audiencesResult] = await Promise.all([
        getFilters(),
        getAudiences()
      ]);
      
      if (filtersResult.success) {
        setFilters(filtersResult.filters);
      } else {
        setError(filtersResult.error || 'Failed to fetch filters');
      }

      if (audiencesResult.success) {
        setAudiences(audiencesResult.audiences);
      }
    } catch (err) {
      setError('Failed to fetch filters');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (filter: Filter) => {
    try {
      const result = await updateFilter(filter.id, { isActive: !filter.isActive });
      if (result.success) {
        setFilters(prev => 
          prev.map(f => 
            f.id === filter.id ? { ...f, isActive: !f.isActive } : f
          )
        );
      } else {
        setError(result.error || 'Failed to update filter');
      }
    } catch (err) {
      setError('Failed to update filter');
      console.error(err);
    }
  };

  const handleEdit = (filter: Filter) => {
    console.log('Edit clicked for filter:', filter);
    setEditingFilter(filter);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    fetchData();
    setIsEditDialogOpen(false);
    setEditingFilter(null);
  };

  const handleDelete = async (filter: Filter) => {
    if (!confirm(`Are you sure you want to delete the filter "${filter.name}"?`)) {
      return;
    }

    try {
      const result = await deleteFilter(filter.id);
      if (result.success) {
        setFilters(prev => prev.filter(f => f.id !== filter.id));
      } else {
        setError(result.error || 'Failed to delete filter');
      }
    } catch (err) {
      setError('Failed to delete filter');
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

  const getAudienceNames = (audienceIds: string[]) => {
    return audiences
      .filter(a => audienceIds.includes(a.id))
      .map(a => a.name);
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
              <TableHead className={isHebrew ? 'text-right' : ''}>{t('filterManagement.name') || 'Name'}</TableHead>
              <TableHead className={isHebrew ? 'text-right' : ''}>{t('filterManagement.audiences') || 'Audiences'}</TableHead>
              <TableHead className={isHebrew ? 'text-right' : ''}>{t('filterManagement.status') || 'Status'}</TableHead>
              <TableHead className={isHebrew ? 'text-right' : ''}>{t('filterManagement.createdAt') || 'Created At'}</TableHead>
              <TableHead className={`w-[50px] ${isHebrew ? 'text-right' : 'text-center'}`}>{text.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  {t('filterManagement.noFilters') || 'No filters found.'}
                </TableCell>
              </TableRow>
            ) : (
              filters.map((filter) => {
                const audienceNames = getAudienceNames(filter.audienceIds);
                return (
                  <TableRow key={filter.id}>
                    <TableCell className={`font-medium ${isHebrew ? 'text-right' : ''}`}>{filter.name}</TableCell>
                    <TableCell className={isHebrew ? 'text-right' : ''}>
                      {audienceNames.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {audienceNames.slice(0, 3).map((name, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {name}
                            </Badge>
                          ))}
                          {audienceNames.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{audienceNames.length - 3}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No audiences</span>
                      )}
                    </TableCell>
                    <TableCell className={isHebrew ? 'text-right' : ''}>
                      <Badge variant={filter.isActive ? 'default' : 'secondary'}>
                        {filter.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-sm text-gray-500 ${isHebrew ? 'text-right' : ''}`}>
                      {formatDate(filter.createdAt)}
                    </TableCell>
                    <TableCell className={isHebrew ? 'text-right' : 'text-center'}>
                      <select
                        className="h-8 w-8 p-0 border-0 bg-transparent cursor-pointer appearance-none text-center"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === 'edit') handleEdit(filter);
                          if (value === 'delete') handleDelete(filter);
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
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {editingFilter && (
        <EditFilterDialog
          filter={editingFilter}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingFilter(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}

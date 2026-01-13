'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Edit, Trash2, Mail, Phone, MapPin, Image, Filter, X, Tags } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Business, Filter as FilterType } from '@/types/promo';
import {
  getBusinesses,
  updateBusiness,
  deleteBusiness,
  getFilters,
  bulkDeleteBusinesses,
  bulkUpdateBusinesses,
  bulkAssignTags
} from '@/lib/actions/admin';
import EditBusinessDialog from './EditBusinessDialog';
import BulkEditBusinessDialog from './BulkEditBusinessDialog';
import { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function BusinessesTable() {
  const { t } = useTranslation('Admin');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  
  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';
  
  // HARDCODED TEXT
  const text = {
    loading: isHebrew ? 'טוען...' : 'Loading...',
    selectedCount: isHebrew ? '{count} נבחרו' : '{count} selected',
    bulkAssignTags: isHebrew ? 'הוסף תגיות' : 'Assign Tags',
    bulkToggleStatus: isHebrew ? 'שנה סטטוס' : 'Toggle Status',
    bulkDelete: isHebrew ? 'מחק נבחרים' : 'Delete Selected',
    confirmBulkDelete: isHebrew ? 'האם למחוק {count} עסקים?' : 'Delete {count} businesses?',
    bulkDeleteSuccess: isHebrew ? '{count} עסקים נמחקו' : '{count} businesses deleted',
    bulkDeleteError: isHebrew ? 'שגיאה במחיקה' : 'Delete failed',
    bulkUpdateSuccess: isHebrew ? '{count} עסקים עודכנו' : '{count} businesses updated',
    bulkUpdateError: isHebrew ? 'שגיאה בעדכון' : 'Update failed',
    name: isHebrew ? 'שם' : 'Name',
    tags: isHebrew ? 'תגיות' : 'Tags',
    contact: isHebrew ? 'יצירת קשר' : 'Contact',
    created: isHebrew ? 'נוצר' : 'Created',
    status: isHebrew ? 'סטטוס' : 'Status',
    actions: isHebrew ? 'פעולות' : 'Actions',
    active: isHebrew ? 'פעיל' : 'Active',
    inactive: isHebrew ? 'לא פעיל' : 'Inactive',
    edit: isHebrew ? 'ערוך' : 'Edit',
    delete: isHebrew ? 'מחק' : 'Delete',
    confirmDelete: isHebrew ? 'למחוק את {name}?' : 'Delete {name}?',
    noBusinesses: isHebrew ? 'אין עסקים' : 'No businesses'
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const businessesResult = await getBusinesses();

      if (businessesResult.success) {
        setBusinesses(businessesResult.businesses);
      } else {
        setError(businessesResult.error || (isHebrew ? 'שגיאה בטעינת עסקים' : 'Failed to fetch businesses'));
      }
    } catch (err) {
      setError(isHebrew ? 'שגיאה בטעינת נתונים' : 'Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (business: Business) => {
    try {
      const result = await updateBusiness(business.id, { isActive: !business.isActive });
      if (result.success) {
        setBusinesses(prev =>
          prev.map(b =>
            b.id === business.id ? { ...b, isActive: !b.isActive } : b
          )
        );
      } else {
        setError(result.error || 'Failed to update business');
      }
    } catch (err) {
      setError('Failed to update business');
      console.error(err);
    }
  };

  const handleEdit = (business: Business) => {
    console.log('Edit clicked for business:', business);
    setEditingBusiness(business);
    setIsEditOpen(true);
  };

  const handleEditSuccess = () => {
    fetchData();
    setIsEditOpen(false);
    setEditingBusiness(null);
  };

  const handleDelete = async (business: Business) => {
    if (!confirm(`Are you sure you want to delete the business "${business.name}"?`)) {
      return;
    }

    try {
      const result = await deleteBusiness(business.id);
      if (result.success) {
        setBusinesses(prev => prev.filter(b => b.id !== business.id));
      } else {
        setError(result.error || 'Failed to delete business');
      }
    } catch (err) {
      setError('Failed to delete business');
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

  // Bulk operation handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredBusinesses.map(b => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const confirmMessage = text.confirmBulkDelete.replace('{count}', String(selectedIds.length));
    if (!confirm(confirmMessage)) return;

    try {
      const result = await bulkDeleteBusinesses(selectedIds);
      if (result.success) {
        setBusinesses(prev => prev.filter(b => !selectedIds.includes(b.id)));
        setSelectedIds([]);
        alert(text.bulkDeleteSuccess.replace('{count}', String(selectedIds.length)));
      } else {
        setError(result.error || text.bulkDeleteError);
      }
    } catch (err) {
      setError(text.bulkDeleteError);
      console.error(err);
    }
  };

  const handleBulkToggleStatus = async () => {
    if (selectedIds.length === 0) return;

    try {
      // Get current status of selected businesses
      const selectedBusinesses = businesses.filter(b => selectedIds.includes(b.id));
      const allActive = selectedBusinesses.every(b => b.isActive);
      const newStatus = !allActive;

      const result = await bulkUpdateBusinesses(selectedIds, { isActive: newStatus });
      if (result.success) {
        setBusinesses(prev =>
          prev.map(b =>
            selectedIds.includes(b.id) ? { ...b, isActive: newStatus } : b
          )
        );
        setSelectedIds([]);
        alert(text.bulkUpdateSuccess.replace('{count}', String(selectedIds.length)));
      } else {
        setError(result.error || text.bulkUpdateError);
      }
    } catch (err) {
      setError(text.bulkUpdateError);
      console.error(err);
    }
  };

  const handleBulkEditTags = async (tagsToAdd: string[], tagsToRemove: string[]) => {
    if (selectedIds.length === 0) return;

    try {
      const result = await bulkAssignTags(selectedIds, tagsToAdd, tagsToRemove);
      if (result.success) {
        // Refresh data to get updated tags
        await fetchData();
        setSelectedIds([]);
        alert(text.bulkUpdateSuccess.replace('{count}', String(selectedIds.length)));
      } else {
        setError(result.error || text.bulkUpdateError);
      }
    } catch (err) {
      setError(text.bulkUpdateError);
      console.error(err);
    }
  };

  // No filtering needed - show all businesses
  const filteredBusinesses = businesses;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">{text.loading}</p>
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

  // Table view for all screen sizes
  return (
    <div className="space-y-4">
      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedIds.length === filteredBusinesses.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="font-medium text-blue-900">
              {text.selectedCount.replace('{count}', String(selectedIds.length))}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBulkEditOpen(true)}
              className="gap-2"
            >
              <Tags className="h-4 w-4" />
              {text.bulkAssignTags}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkToggleStatus}
              className="gap-2"
            >
              {text.bulkToggleStatus}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {text.bulkDelete}
            </Button>
          </div>
        </div>
      )}

      {/* Results count */}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedIds.length > 0 && selectedIds.length === filteredBusinesses.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>{text.name}</TableHead>
              <TableHead>{isHebrew ? 'תיאור' : 'Description'}</TableHead>
              <TableHead>{isHebrew ? 'תמונה' : 'Image'}</TableHead>
              <TableHead>{text.contact}</TableHead>
              <TableHead>{text.status}</TableHead>
              <TableHead>{text.created}</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBusinesses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  {text.noBusinesses}
                </TableCell>
              </TableRow>
            ) : (
              filteredBusinesses.map((business) => (
                <TableRow
                  key={business.id}
                  className={selectedIds.includes(business.id) ? 'bg-blue-50' : ''}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(business.id)}
                      onCheckedChange={(checked) => handleSelectOne(business.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{business.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {business.description}
                  </TableCell>
                  <TableCell>
                    {business.imageUrl ? (
                      <div className="w-10 h-10 rounded-md overflow-hidden">
                        <img
                          src={business.imageUrl}
                          alt={business.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                        <img className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="truncate max-w-[150px]">{business.contactInfo.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span>{business.contactInfo.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="truncate max-w-[150px]">{business.contactInfo.address}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={business.isActive ? 'default' : 'secondary'}>
                      {business.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(business.createdAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(business)}>
                          <Edit className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                          {text.edit}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(business)}>
                          {business.isActive ? text.inactive : text.active}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(business)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                          {text.delete}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingBusiness && (
        <EditBusinessDialog
          business={editingBusiness}
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setEditingBusiness(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      <BulkEditBusinessDialog
        isOpen={isBulkEditOpen}
        onClose={() => setIsBulkEditOpen(false)}
        selectedCount={selectedIds.length}
        onApply={handleBulkEditTags}
      />
    </div>
  );
}

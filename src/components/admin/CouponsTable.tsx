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
import { Badge } from '@/components/ui/badge';
import { Coupon } from '@/types/coupon';
import { getCoupons, updateCoupon, deleteCoupon, getBusinesses } from '@/lib/actions/admin';
import EditCouponDialog from './EditCouponDialog';
import { Business } from '@/types/promo';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function CouponsTable() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [previewCoupon, setPreviewCoupon] = useState<Coupon | null>(null);

  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';
  
  // HARDCODED TEXT
  const text = {
    noCoupons: isHebrew ? 'לא נמצאו קופונים' : 'No coupons found',
    loading: isHebrew ? 'טוען...' : 'Loading...',
    name: isHebrew ? 'שם' : 'Name',
    description: isHebrew ? 'תיאור' : 'Description',
    image: isHebrew ? 'תמונה' : 'Image',
    points: isHebrew ? 'נקודות' : 'Points',
    price: isHebrew ? 'מחיר' : 'Price',
    business: isHebrew ? 'עסק' : 'Business',
    validPeriod: isHebrew ? 'תקופת תוקף' : 'Valid Period',
    validFrom: isHebrew ? 'תקף מ' : 'Valid From',
    validTo: isHebrew ? 'תקף עד' : 'Valid To',
    status: isHebrew ? 'סטטוס' : 'Status',
    edit: isHebrew ? 'ערוך' : 'Edit',
    delete: isHebrew ? 'מחק' : 'Delete',
    preview: isHebrew ? 'תצוגה מקדימה' : 'Preview',
    activate: isHebrew ? 'הפעל' : 'Activate',
    deactivate: isHebrew ? 'השבת' : 'Deactivate',
    active: isHebrew ? 'פעיל' : 'Active',
    inactive: isHebrew ? 'לא פעיל' : 'Inactive',
    expired: isHebrew ? 'פג תוקף' : 'Expired',
    deleteConfirm: isHebrew ? 'האם אתה בטוח שברצונך למחוק קופון זה?' : 'Are you sure you want to delete this coupon?',
    close: isHebrew ? 'סגור' : 'Close',
    actions: isHebrew ? 'פעולות' : 'Actions'
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchCoupons(), fetchBusinesses()]);
  };

  const fetchBusinesses = async () => {
    try {
      const result = await getBusinesses();
      if (result.success && result.businesses) {
        setBusinesses(result.businesses);
      }
    } catch (err) {
      console.error('Error fetching businesses:', err);
    }
  };

  const isCouponExpired = (c: Coupon) => {
    const validTo = c.validTo instanceof Date ? c.validTo : new Date(c.validTo as any);
    return validTo.getTime() < Date.now();
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const result = await getCoupons();
      if (result.success) {
        // Convert ISO string dates back to Date objects
        const couponsWithDates = result.coupons.map(coupon => ({
          ...coupon,
          createdAt: coupon.createdAt ? new Date(coupon.createdAt as any) : new Date(),
          updatedAt: coupon.updatedAt ? new Date(coupon.updatedAt as any) : new Date(),
          validFrom: coupon.validFrom ? new Date(coupon.validFrom as any) : new Date(),
          validTo: coupon.validTo ? new Date(coupon.validTo as any) : new Date(),
        }));
        setCoupons(couponsWithDates);
      } else {
        setError(result.error || 'Failed to fetch coupons');
      }
    } catch (err) {
      setError('Failed to fetch coupons');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const result = await updateCoupon(coupon.id, { isActive: !coupon.isActive });
      if (result.success) {
        setCoupons(prev => 
          prev.map(c => 
            c.id === coupon.id ? { ...c, isActive: !c.isActive } : c
          )
        );
      } else {
        setError(result.error || 'Failed to update coupon');
      }
    } catch (err) {
      setError('Failed to update coupon');
      console.error(err);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    console.log('Edit clicked for coupon:', coupon);
    setEditingCoupon(coupon);
    setIsEditOpen(true);
  };

  const handleEditSuccess = () => {
    fetchCoupons();
    setIsEditOpen(false);
    setEditingCoupon(null);
  };

  const handleDelete = async (coupon: Coupon) => {
    const confirmMessage = isHebrew ? `האם אתה בטוח שברצונך למחוק את ${coupon.name}?` : `Are you sure you want to delete ${coupon.name}?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const result = await deleteCoupon(coupon.id);
      if (result.success) {
        setCoupons(prev => prev.filter(c => c.id !== coupon.id));
      } else {
        setError(result.error || 'Failed to delete coupon');
      }
    } catch (err) {
      setError('Failed to delete coupon');
      console.error(err);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(price);
  };

  const getBusinessName = (businessId?: string) => {
    if (!businessId) return 'General';
    const business = businesses.find(b => b.id === businessId);
    return business ? business.name : 'Unknown';
  };

  const getBusinessNames = (coupon: Coupon) => {
    // Support both old businessId and new businessIds format
    const businessIds = coupon.businessIds || (coupon.businessId ? [coupon.businessId] : []);

    if (businessIds.length === 0) {
      return ['General'];
    }

    return businessIds.map(id => {
      const business = businesses.find(b => b.id === id);
      return business ? business.name : 'Unknown';
    });
  };

  const formatDate = (date: Date | string | null | undefined) => {
    // Handle null, undefined, or invalid dates
    if (!date) {
      return 'N/A';
    }

    // Convert ISO string to Date if needed
    let dateObj: Date;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
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
              <TableHead className={isHebrew ? 'text-right' : ''}>{text.name}</TableHead>
              <TableHead className={isHebrew ? 'text-right' : ''}>{text.description}</TableHead>
              <TableHead className={isHebrew ? 'text-right' : ''}>{text.price}</TableHead>
              <TableHead className={isHebrew ? 'text-right' : ''}>{text.points}</TableHead>
              <TableHead className={isHebrew ? 'text-right' : ''}>{text.image}</TableHead>
              <TableHead className={isHebrew ? 'text-right' : ''}>{text.validPeriod}</TableHead>
              <TableHead className={isHebrew ? 'text-right' : ''}>{text.status}</TableHead>
              <TableHead className={`w-[50px] ${isHebrew ? 'text-right' : 'text-center'}`}>{text.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  {text.noCoupons}
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow
                  key={coupon.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setPreviewCoupon(coupon)}
                >
                  <TableCell className={`font-medium ${isHebrew ? 'text-right' : ''}`}>
                    {coupon.name}
                  </TableCell>
                  <TableCell className={`max-w-xs truncate ${isHebrew ? 'text-right' : ''}`}>
                    {coupon.description}
                  </TableCell>
                  <TableCell className={isHebrew ? 'text-right' : ''}>{formatPrice(coupon.price)}</TableCell>
                  <TableCell className={isHebrew ? 'text-right' : ''}>
                    <Badge variant="outline">
                      {coupon.points} pts
                    </Badge>
                  </TableCell>
                  <TableCell className={isHebrew ? 'text-right' : ''}>
                    {coupon.imageUrl ? (
                      <div className="w-10 h-10 rounded-md overflow-hidden">
                        <img
                          src={coupon.imageUrl}
                          alt={coupon.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                        <img className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className={`text-sm ${isHebrew ? 'text-right' : ''}`}>
                    <div className="space-y-1">
                      <div>From: {formatDate(coupon.validFrom)}</div>
                      <div>To: {formatDate(coupon.validTo)}</div>
                    </div>
                  </TableCell>
                  <TableCell className={isHebrew ? 'text-right' : ''}>
                    {isCouponExpired(coupon) ? (
                      <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                        {text.expired}
                      </Badge>
                    ) : (
                      <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                        {coupon.isActive ? text.active : text.inactive}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell
                    className={isHebrew ? 'text-right' : 'text-center'}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      className="h-8 w-8 p-0 border-0 bg-transparent cursor-pointer appearance-none text-center"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === 'edit') handleEdit(coupon);
                        if (value === 'delete') handleDelete(coupon);
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
      
      {editingCoupon && (
        <EditCouponDialog
          coupon={editingCoupon}
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setEditingCoupon(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewCoupon} onOpenChange={(open) => !open && setPreviewCoupon(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {previewCoupon && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{previewCoupon.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Image */}
                {previewCoupon.imageUrl && (
                  <div className="rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={previewCoupon.imageUrl} 
                      alt={previewCoupon.name}
                      className="w-full h-auto object-contain max-h-[400px] mx-auto"
                    />
                  </div>
                )}
                
                {/* Description */}
                {previewCoupon.description && (
                  <div>
                    <p className="text-base text-gray-700">{previewCoupon.description}</p>
                  </div>
                )}
                
                {/* Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-600">{text.price}: </span>
                    <span>{formatPrice(previewCoupon.price)}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">{text.points}: </span>
                    <span>{previewCoupon.points} pts</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">{text.validFrom}: </span>
                    <span>{formatDate(previewCoupon.validFrom)}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">{text.validTo}: </span>
                    <span>{formatDate(previewCoupon.validTo)}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">{text.status}: </span>
                    {isCouponExpired(previewCoupon) ? (
                      <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                        {text.expired}
                      </Badge>
                    ) : (
                      <Badge variant={previewCoupon.isActive ? 'default' : 'secondary'}>
                        {previewCoupon.isActive ? text.active : text.inactive}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Businesses */}
                {getBusinessNames(previewCoupon).length > 0 && (
                  <div>
                    <span className="font-semibold text-gray-600 block mb-2">{text.business}:</span>
                    <div className="flex flex-wrap gap-2">
                      {getBusinessNames(previewCoupon).map((businessName, index) => (
                        <Badge key={index} variant="outline">
                          {businessName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

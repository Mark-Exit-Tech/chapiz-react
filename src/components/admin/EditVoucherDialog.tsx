'use client';

import MediaUpload from '@/components/admin/MediaUpload';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RtlMultiselect } from '@/components/ui/rtl-multiselect';
import { updateVoucher, getBusinesses } from '@/lib/actions/admin';
import { useState, useEffect, useMemo } from 'react';
import { Voucher } from '@/lib/firebase/database/vouchers';
import { Business } from '@/types/promo';

interface EditVoucherDialogProps {
  voucher: Voucher;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditVoucherDialog({ voucher, isOpen, onClose, onSuccess }: EditVoucherDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    points: '',
    imageUrl: '',
    stock: '',
    businessIds: [] as string[],
    validFrom: '',
    validTo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);

  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';

  // HARDCODED TEXT
  const text = {
    title: isHebrew ? 'ערוך שובר' : 'Edit Voucher',
    name: isHebrew ? 'שם' : 'Name',
    namePlaceholder: isHebrew ? 'הזן שם שובר' : 'Enter voucher name',
    description: isHebrew ? 'תיאור' : 'Description',
    descriptionPlaceholder: isHebrew ? 'הזן תיאור' : 'Enter description',
    price: isHebrew ? 'מחיר (0 לחינם)' : 'Price (0 for free)',
    pricePlaceholder: isHebrew ? 'הזן מחיר' : 'Enter price',
    points: isHebrew ? 'נקודות' : 'Points',
    pointsPlaceholder: isHebrew ? 'הזן נקודות' : 'Enter points',
    image: isHebrew ? 'תמונה' : 'Image',
    business: isHebrew ? 'עסקים' : 'Businesses',
    businessPlaceholder: isHebrew ? 'בחר עסקים (אופציונלי)' : 'Select businesses (optional)',
    search: isHebrew ? 'חיפוש...' : 'Search...',
    noBusinesses: isHebrew ? 'לא נמצאו עסקים' : 'No businesses found',
    validFrom: isHebrew ? 'תקף מ' : 'Valid From',
    validTo: isHebrew ? 'תקף עד' : 'Valid To',
    stock: isHebrew ? 'מלאי' : 'Stock',
    stockPlaceholder: isHebrew ? 'ריק = ללא הגבלה' : 'Empty = unlimited',
    cancel: isHebrew ? 'ביטול' : 'Cancel',
    update: isHebrew ? 'עדכן' : 'Update',
    updating: isHebrew ? 'מעדכן...' : 'Updating...',
    errorValidToPast: isHebrew ? 'תאריך "תקף עד" לא יכול להיות בעבר' : 'Valid To date cannot be in the past',
    errorValidToBeforeFrom: isHebrew ? '"תקף עד" חייב להיות ביום או אחרי "תקף מ"' : 'Valid To must be on or after Valid From',
    requiredField: isHebrew ? 'שדה חובה' : 'Required field'
  };

  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen && voucher) {
      setFormData({
        name: voucher.name || '',
        description: voucher.description || '',
        price: voucher.price?.toString() || '',
        points: voucher.points?.toString() || '',
        imageUrl: voucher.imageUrl || '',
        stock: voucher.stock != null ? String(voucher.stock) : '',
        businessIds: (voucher as any).businessIds || [],
        validFrom: voucher.validFrom ? new Date(voucher.validFrom).toISOString().slice(0, 16) : '',
        validTo: voucher.validTo ? new Date(voucher.validTo).toISOString().slice(0, 16) : ''
      });
      setError(null);
    }
  }, [isOpen, voucher]);

  useEffect(() => {
    if (isOpen) {
      fetchBusinesses();
    }
  }, [isOpen]);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const result = await getBusinesses();
      if (result.success && result.businesses) {
        setBusinesses(result.businesses);
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessIdsChange = (selectedIds: string[]) => {
    setFormData((prev) => ({ ...prev, businessIds: selectedIds }));
  };

  // Convert businesses to dropdown options
  const businessOptions = useMemo(() => {
    return businesses.map(business => ({
      value: business.id,
      label: business.name
    }));
  }, [businesses]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFieldErrors((prev) => ({ ...prev, [name]: false }));
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const required: Record<string, boolean> = {
      name: !formData.name.trim(),
      description: !formData.description.trim(),
      imageUrl: !formData.imageUrl.trim(),
      validFrom: !formData.validFrom.trim(),
      validTo: !formData.validTo.trim()
    };
    if (Object.values(required).some(Boolean)) {
      setFieldErrors(required);
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const now = new Date();
      const validFrom = formData.validFrom ? new Date(formData.validFrom) : null;
      const validTo = formData.validTo ? new Date(formData.validTo) : null;
      if (validTo && validTo.getTime() < now.getTime()) {
        setError(text.errorValidToPast);
        setIsSubmitting(false);
        return;
      }
      if (validFrom && validTo && validTo.getTime() < validFrom.getTime()) {
        setError(text.errorValidToBeforeFrom);
        setIsSubmitting(false);
        return;
      }
      const result = await updateVoucher(voucher.id, formData);

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Failed to update voucher');
      }
    } catch (err: any) {
      console.error('Error updating voucher:', err);
      setError(err.message || 'Failed to update voucher');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto" dir={isHebrew ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{text.title}</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded bg-red-100 text-red-800 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{text.name}</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={text.namePlaceholder}
              className={fieldErrors.name ? 'border-red-500 ring-2 ring-red-200' : ''}
            />
            {fieldErrors.name && <p className="text-sm text-red-600">{text.requiredField}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{text.description}</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={text.descriptionPlaceholder}
              rows={3}
              className={fieldErrors.description ? 'border-red-500 ring-2 ring-red-200' : ''}
            />
            {fieldErrors.description && <p className="text-sm text-red-600">{text.requiredField}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">{text.price}</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder={text.pricePlaceholder}
              />
            </div>

            {(formData.price !== '' && parseFloat(formData.price) > 0) && (
              <div className="space-y-2">
                <Label htmlFor="points">{text.points}</Label>
                <Input
                  id="points"
                  name="points"
                  type="number"
                  min="0"
                  value={formData.points}
                  onChange={handleChange}
                  placeholder={text.pointsPlaceholder}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">{text.image}</Label>
            <div className={fieldErrors.imageUrl ? 'rounded-md ring-2 ring-red-200 ring-offset-0' : ''}>
              <MediaUpload
                type="image"
                value={formData.imageUrl}
                onChange={(filePath) => {
                  setFieldErrors((prev) => ({ ...prev, imageUrl: false }));
                  setFormData((prev) => ({ ...prev, imageUrl: filePath }));
                }}
                className="w-1/5"
              />
            </div>
            {fieldErrors.imageUrl && <p className="text-sm text-red-600">{text.requiredField}</p>}
          </div>

          <div className="space-y-2">
            <Label>{text.business}</Label>
            <RtlMultiselect
              options={businessOptions}
              selectedValues={formData.businessIds}
              onSelectionChange={handleBusinessIdsChange}
              placeholder={text.businessPlaceholder}
              searchPlaceholder={text.search}
              noOptionsText={text.noBusinesses}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">{text.stock}</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={handleChange}
              placeholder={text.stockPlaceholder}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validFrom">{text.validFrom}</Label>
              <Input
                id="validFrom"
                name="validFrom"
                type="datetime-local"
                value={formData.validFrom}
                onChange={handleChange}
                className={fieldErrors.validFrom ? 'border-red-500 ring-2 ring-red-200' : ''}
              />
              {fieldErrors.validFrom && <p className="text-sm text-red-600">{text.requiredField}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="validTo">{text.validTo}</Label>
              <Input
                id="validTo"
                name="validTo"
                type="datetime-local"
                value={formData.validTo}
                onChange={handleChange}
                className={fieldErrors.validTo ? 'border-red-500 ring-2 ring-red-200' : ''}
              />
              {fieldErrors.validTo && <p className="text-sm text-red-600">{text.requiredField}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {text.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? text.updating : text.update}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

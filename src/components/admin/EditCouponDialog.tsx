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
import { updateCoupon, getBusinesses } from '@/lib/actions/admin';
import { roundDatetimeLocalTo15Min } from '@/lib/utils/date';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo } from 'react';
import { Coupon } from '@/types/coupon';
import { Business } from '@/types/promo';

interface EditCouponDialogProps {
  coupon: Coupon;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditCouponDialog({ coupon, isOpen, onClose, onSuccess }: EditCouponDialogProps) {
  const { t } = useTranslation('Admin');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    stock: '',
    validFrom: '',
    validTo: '',
    businessIds: [] as string[],
    purchaseLimit: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  
  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';
  
  // HARDCODED TEXT
  const text = {
    title: isHebrew ? 'ערוך קופון' : 'Edit Coupon',
    name: isHebrew ? 'שם' : 'Name',
    namePlaceholder: isHebrew ? 'הזן שם קופון' : 'Enter coupon name',
    description: isHebrew ? 'תיאור' : 'Description',
    descriptionPlaceholder: isHebrew ? 'הזן תיאור' : 'Enter description',
    image: isHebrew ? 'תמונה' : 'Image',
    business: isHebrew ? 'עסק' : 'Business',
    businessPlaceholder: isHebrew ? 'בחר עסקים' : 'Select businesses',
    search: isHebrew ? 'חיפוש...' : 'Search...',
    noBusinesses: isHebrew ? 'לא נמצאו עסקים' : 'No businesses found',
    validFrom: isHebrew ? 'תקף מ' : 'Valid From',
    validTo: isHebrew ? 'תקף עד' : 'Valid To',
    stock: isHebrew ? 'מלאי' : 'Stock',
    stockPlaceholder: isHebrew ? 'ריק = ללא הגבלה' : 'Empty = unlimited',
    purchaseLimit: isHebrew ? 'מגבלת רכישה' : 'Purchase Limit',
    purchaseLimitPlaceholder: isHebrew ? 'הזן מגבלה (אופציונלי)' : 'Enter limit (optional)',
    purchaseLimitHelp: isHebrew ? 'מספר פעמים שמשתמש יכול לרכוש קופון זה' : 'Number of times a user can purchase this coupon',
    cancel: isHebrew ? 'ביטול' : 'Cancel',
    update: isHebrew ? 'עדכן' : 'Update',
    updating: isHebrew ? 'מעדכן...' : 'Updating...',
    errorValidToPast: isHebrew ? 'תאריך "תקף עד" לא יכול להיות בעבר' : 'Valid To date cannot be in the past',
    errorValidToBeforeFrom: isHebrew ? '"תקף עד" חייב להיות ביום או אחרי "תקף מ"' : 'Valid To must be on or after Valid From',
    requiredField: isHebrew ? 'שדה חובה' : 'Required field'
  };

  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      fetchBusinesses();
      if (coupon) {
        // Support both old businessId and new businessIds format
        const businessIds = coupon.businessIds || (coupon.businessId ? [coupon.businessId] : []);

        console.log('🔍 EditCouponDialog - Coupon data received:', {
          couponId: coupon.id,
          couponName: coupon.name,
          hasBusinessId: !!coupon.businessId,
          hasBusinessIds: !!coupon.businessIds,
          businessId: coupon.businessId,
          businessIds: coupon.businessIds,
          extractedBusinessIds: businessIds
        });

        setFormData({
          name: coupon.name || '',
          description: coupon.description || '',
          imageUrl: coupon.imageUrl || '',
          stock: coupon.stock != null ? String(coupon.stock) : '',
          validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().slice(0, 16) : '',
          validTo: coupon.validTo ? new Date(coupon.validTo).toISOString().slice(0, 16) : '',
          businessIds: businessIds,
          purchaseLimit: coupon.purchaseLimit?.toString() || ''
        });
      }
    }
  }, [isOpen, coupon]);

  const fetchBusinesses = async () => {
    try {
      setLoadingBusinesses(true);
      const result = await getBusinesses();
      if (result.success && result.businesses) {
        setBusinesses(result.businesses);
      }
    } catch (err) {
      console.error('Error fetching businesses:', err);
    } finally {
      setLoadingBusinesses(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFieldErrors((prev) => ({ ...prev, [name]: false }));
    const isDatetime = name === 'validFrom' || name === 'validTo';
    const finalValue = isDatetime && value ? roundDatetimeLocalTo15Min(value) : value;
    setFormData((prev) => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleBusinessIdsChange = (selectedIds: string[]) => {
    setFormData((prev) => ({
      ...prev,
      businessIds: selectedIds
    }));
  };

  // Convert businesses to dropdown options
  const businessOptions = useMemo(() => {
    return businesses.map(business => ({
      value: business.id,
      label: business.name
    }));
  }, [businesses]);

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
      console.log('🔍 EditCouponDialog - Submitting with businessIds:', {
        couponId: coupon.id,
        businessIds: formData.businessIds,
        businessIdsLength: formData.businessIds.length,
        willSend: formData.businessIds.length > 0 ? formData.businessIds : undefined
      });

      const purchaseLimit = formData.purchaseLimit === '' ? undefined : parseInt(formData.purchaseLimit);
      if (purchaseLimit !== undefined && (isNaN(purchaseLimit) || purchaseLimit < 1)) {
        throw new Error('Purchase limit must be a positive number or left empty for unlimited');
      }

      const now = new Date();
      const validFrom = formData.validFrom ? new Date(formData.validFrom) : null;
      const validTo = formData.validTo ? new Date(formData.validTo) : null;
      if (validTo && validTo.getTime() < now.getTime()) {
        throw new Error(text.errorValidToPast);
      }
      if (validFrom && validTo && validTo.getTime() < validFrom.getTime()) {
        throw new Error(text.errorValidToBeforeFrom);
      }

      const stock = formData.stock.trim() === '' ? undefined : Math.max(0, parseInt(formData.stock, 10));
      const purchaseLimitVal = formData.purchaseLimit.trim() === '' ? undefined : Math.max(0, parseInt(formData.purchaseLimit, 10));
      const result = await updateCoupon(coupon.id, {
        name: formData.name,
        description: formData.description,
        price: 0,
        points: 0,
        imageUrl: formData.imageUrl,
        stock: isNaN(stock as number) ? undefined : stock,
        validFrom: new Date(formData.validFrom),
        validTo: new Date(formData.validTo),
        businessIds: formData.businessIds.length > 0 ? formData.businessIds : undefined,
        purchaseLimit: purchaseLimitVal
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to update coupon');
      }

      // Verify the update was successful by fetching the coupon again
      console.log('✅ Update successful, verifying saved data...');
      const { getCouponById } = await import('@/lib/actions/admin');
      const verifyResult = await getCouponById(coupon.id);
      if (verifyResult.success && verifyResult.coupon) {
        console.log('🔍 Verification - Coupon after update:', {
          couponId: verifyResult.coupon.id,
          hasBusinessId: !!verifyResult.coupon.businessId,
          hasBusinessIds: !!verifyResult.coupon.businessIds,
          businessId: verifyResult.coupon.businessId,
          businessIds: verifyResult.coupon.businessIds
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error updating coupon:', err);
      setError(err.message || 'Failed to update coupon. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" dir={isHebrew ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{text.title}</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
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
              disabled={loadingBusinesses}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validFrom">{text.validFrom}</Label>
              <Input
                id="validFrom"
                name="validFrom"
                type="datetime-local"
                step={900}
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
                step={900}
                value={formData.validTo}
                onChange={handleChange}
                className={fieldErrors.validTo ? 'border-red-500 ring-2 ring-red-200' : ''}
              />
              {fieldErrors.validTo && <p className="text-sm text-red-600">{text.requiredField}</p>}
            </div>
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

          <div className="space-y-2">
            <Label htmlFor="purchaseLimit">{text.purchaseLimit}</Label>
            <Input
              id="purchaseLimit"
              name="purchaseLimit"
              type="number"
              min="1"
              value={formData.purchaseLimit}
              onChange={handleChange}
              placeholder={text.purchaseLimitPlaceholder}
            />
            <p className="text-xs text-gray-500">
              {text.purchaseLimitHelp}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
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

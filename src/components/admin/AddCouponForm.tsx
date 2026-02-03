'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { createCoupon, getBusinesses } from '@/lib/actions/admin';
import { getDefaultValidFromDateOnly, getDefaultValidToDateOnly, parseDateOnlyLocal, parseDateOnlyEndOfDay } from '@/lib/utils/date';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo } from 'react';
import MediaUpload from '@/components/admin/MediaUpload';
import { RtlMultiselect } from '@/components/ui/rtl-multiselect';
import { Business } from '@/types/promo';

export default function AddCouponForm() {
  const { t } = useTranslation('Admin');
  const { t: commonT } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  
  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';
  
  // HARDCODED TEXT
  const text = {
    addNewCoupon: isHebrew ? 'הוסף קופון חדש' : 'Add New Coupon',
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
    createCoupon: isHebrew ? 'צור קופון' : 'Create Coupon',
    creating: isHebrew ? 'יוצר...' : 'Creating...',
    cancel: isHebrew ? 'ביטול' : 'Cancel',
    clickToUpload: isHebrew ? 'לחץ להעלאת תמונה' : 'Click to upload image',
    fileFormats: isHebrew ? 'PNG, JPG, GIF עד 10MB' : 'PNG, JPG, GIF up to 10MB',
    errorValidFromPast: isHebrew ? 'תאריך "תקף מ" לא יכול להיות בעבר' : 'Valid From date cannot be in the past',
    errorValidToPast: isHebrew ? 'תאריך "תקף עד" לא יכול להיות בעבר' : 'Valid To date cannot be in the past',
    errorValidToBeforeFrom: isHebrew ? '"תקף עד" חייב להיות ביום או אחרי "תקף מ"' : 'Valid To must be on or after Valid From',
    requiredField: isHebrew ? 'שדה חובה' : 'Required field'
  };

  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
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

  const router = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchBusinesses();
      // Auto-select today and 2 weeks from today for Valid From / Valid To (date only, no time)
      const timer = setTimeout(() => {
        setFormData((prev) => ({
          ...prev,
          validFrom: getDefaultValidFromDateOnly(),
          validTo: getDefaultValidToDateOnly(),
        }));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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
    setFormData((prev) => ({
      ...prev,
      [name]: value
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
    const hasRequiredErrors = Object.values(required).some(Boolean);
    if (hasRequiredErrors) {
      setFieldErrors(required);
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      console.log('Submitting coupon data:', formData);

      const purchaseLimit = formData.purchaseLimit === '' ? undefined : parseInt(formData.purchaseLimit);
      if (purchaseLimit !== undefined && (isNaN(purchaseLimit) || purchaseLimit < 1)) {
        throw new Error('Purchase limit must be a positive number or left empty for unlimited');
      }

      // Parse date-only as local time. Allow validFrom = today or yesterday (1 day back).
      const validFrom = formData.validFrom ? parseDateOnlyLocal(formData.validFrom) : null;
      const validTo = formData.validTo ? parseDateOnlyLocal(formData.validTo) : null;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const oneDayBack = new Date(todayStart);
      oneDayBack.setDate(oneDayBack.getDate() - 1);
      if (validFrom && validFrom.getTime() < oneDayBack.getTime()) {
        throw new Error(text.errorValidFromPast);
      }
      if (validTo && validTo.getTime() < todayStart.getTime()) {
        throw new Error(text.errorValidToPast);
      }
      if (validFrom && validTo && validTo.getTime() < validFrom.getTime()) {
        throw new Error(text.errorValidToBeforeFrom);
      }

      const stock = formData.stock.trim() === '' ? undefined : Math.max(0, parseInt(formData.stock, 10));
      const result = await createCoupon({
        name: formData.name,
        description: formData.description,
        price: 0,
        points: 0,
        imageUrl: formData.imageUrl,
        validFrom: parseDateOnlyLocal(formData.validFrom),
        validTo: parseDateOnlyEndOfDay(formData.validTo),
        stock: isNaN(stock as number) ? undefined : stock,
        businessIds: formData.businessIds.length > 0 ? formData.businessIds : undefined,
        purchaseLimit: purchaseLimit
      }); // TODO: Get actual user ID

      console.log('Create coupon result:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to create coupon');
      }

      // Reset form and close
      setFormData({
        name: '',
        description: '',
        imageUrl: '',
        stock: '',
        validFrom: '',
        validTo: '',
        businessIds: [],
        purchaseLimit: ''
      });
      setIsOpen(false);

      // Refresh the page to show the new coupon
      window.location.reload();
    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      setError(err.message || 'Failed to create coupon. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          {text.addNewCoupon}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto" dir={isHebrew ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{text.addNewCoupon}</DialogTitle>
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
            <Label>{text.business || 'Businesses (Optional)'}</Label>
            <RtlMultiselect
              options={businessOptions}
              selectedValues={formData.businessIds}
              onSelectionChange={handleBusinessIdsChange}
              placeholder={text.businessPlaceholder || 'Select businesses (optional)'}
              searchPlaceholder={text.search}
              noOptionsText={text.noBusinesses}
              disabled={loadingBusinesses}
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
                type="date"
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
                type="date"
                value={formData.validTo}
                onChange={handleChange}
                className={fieldErrors.validTo ? 'border-red-500 ring-2 ring-red-200' : ''}
              />
              {fieldErrors.validTo && <p className="text-sm text-red-600">{text.requiredField}</p>}
            </div>
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              {text.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? text.creating : text.createCoupon}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

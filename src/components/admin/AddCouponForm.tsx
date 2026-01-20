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
    price: isHebrew ? 'מחיר (0 לחינם)' : 'Price (0 for free)',
    pricePlaceholder: isHebrew ? 'הזן מחיר' : 'Enter price',
    points: isHebrew ? 'נקודות' : 'Points',
    pointsPlaceholder: isHebrew ? 'הזן נקודות' : 'Enter points',
    image: isHebrew ? 'תמונה' : 'Image',
    business: isHebrew ? 'עסק' : 'Business',
    businessPlaceholder: isHebrew ? 'בחר עסקים' : 'Select businesses',
    search: isHebrew ? 'חיפוש...' : 'Search...',
    noBusinesses: isHebrew ? 'לא נמצאו עסקים' : 'No businesses found',
    validFrom: isHebrew ? 'תקף מ' : 'Valid From',
    validTo: isHebrew ? 'תקף עד' : 'Valid To',
    purchaseLimit: isHebrew ? 'מגבלת רכישה' : 'Purchase Limit',
    purchaseLimitPlaceholder: isHebrew ? 'הזן מגבלה (אופציונלי)' : 'Enter limit (optional)',
    purchaseLimitHelp: isHebrew ? 'מספר פעמים שמשתמש יכול לרכוש קופון זה' : 'Number of times a user can purchase this coupon',
    createCoupon: isHebrew ? 'צור קופון' : 'Create Coupon',
    creating: isHebrew ? 'יוצר...' : 'Creating...',
    cancel: isHebrew ? 'ביטול' : 'Cancel',
    clickToUpload: isHebrew ? 'לחץ להעלאת תמונה' : 'Click to upload image',
    fileFormats: isHebrew ? 'PNG, JPG, GIF עד 10MB' : 'PNG, JPG, GIF up to 10MB'
  };
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    points: '',
    imageUrl: '',
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
    setIsSubmitting(true);
    setError(null);

    try {
      // Allow empty price for free vouchers (defaults to 0)
      const price = formData.price === '' ? 0 : parseFloat(formData.price);

      // Default points to 0 if empty and price is 0
      let points = parseInt(formData.points);
      if (isNaN(points) && price === 0) {
        points = 0;
      }

      if (isNaN(price) || price < 0) {
        throw new Error('Please enter a valid price (0 for free vouchers)');
      }

      if (isNaN(points) || points < 0) {
        throw new Error('Please enter valid points');
      }

      console.log('Submitting coupon data:', formData);

      const purchaseLimit = formData.purchaseLimit === '' ? undefined : parseInt(formData.purchaseLimit);
      if (purchaseLimit !== undefined && (isNaN(purchaseLimit) || purchaseLimit < 1)) {
        throw new Error('Purchase limit must be a positive number or left empty for unlimited');
      }

      const result = await createCoupon({
        name: formData.name,
        description: formData.description,
        price: price,
        points: points,
        imageUrl: formData.imageUrl,
        validFrom: new Date(formData.validFrom),
        validTo: new Date(formData.validTo),
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
        price: '',
        points: '',
        imageUrl: '',
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
              required
            />
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
              required
            />
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
            <MediaUpload
              type="image"
              value={formData.imageUrl}
              onChange={(filePath) => {
                setFormData((prev) => ({ ...prev, imageUrl: filePath }));
              }}
              className="w-1/5"
            />
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validFrom">{text.validFrom}</Label>
              <Input
                id="validFrom"
                name="validFrom"
                type="datetime-local"
                value={formData.validFrom}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validTo">{text.validTo}</Label>
              <Input
                id="validTo"
                name="validTo"
                type="datetime-local"
                value={formData.validTo}
                onChange={handleChange}
                required
              />
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

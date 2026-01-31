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
import { RtlMultiselect } from '@/components/ui/rtl-multiselect';
import { Plus } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import MediaUpload from '@/components/admin/MediaUpload';
import { createVoucher, getBusinesses } from '@/lib/actions/admin';
import { getDefaultValidFromDateOnly, getDefaultValidToDateOnly, parseDateOnlyLocal, parseDateOnlyEndOfDay } from '@/lib/utils/date';
import { Business } from '@/types/promo';

interface AddVoucherFormProps {
  onSuccess?: () => void;
}

export default function AddVoucherForm({ onSuccess }: AddVoucherFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';
  
  // HARDCODED TEXT
  const text = {
    addNewVoucher: isHebrew ? 'הוסף שובר חדש' : 'Add New Voucher',
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
    createVoucher: isHebrew ? 'צור שובר' : 'Create Voucher',
    creating: isHebrew ? 'יוצר...' : 'Creating...',
    cancel: isHebrew ? 'ביטול' : 'Cancel',
    comingSoon: isHebrew ? 'בפיתוח - יתאפשר בקרוב' : 'Under Development - Coming Soon',
    errorValidFromPast: isHebrew ? 'תאריך "תקף מ" לא יכול להיות בעבר' : 'Valid From date cannot be in the past',
    errorValidToPast: isHebrew ? 'תאריך "תקף עד" לא יכול להיות בעבר' : 'Valid To date cannot be in the past',
    errorValidToBeforeFrom: isHebrew ? '"תקף עד" חייב להיות ביום או אחרי "תקף מ"' : 'Valid To must be on or after Valid From'
  };
  
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
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);

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
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Parse date-only as local time. Allow validFrom = today or yesterday (1 day back).
      const validFrom = formData.validFrom ? parseDateOnlyLocal(formData.validFrom) : null;
      const validTo = formData.validTo ? parseDateOnlyLocal(formData.validTo) : null;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const oneDayBack = new Date(todayStart);
      oneDayBack.setDate(oneDayBack.getDate() - 1);
      if (validFrom && validFrom.getTime() < oneDayBack.getTime()) {
        alert(text.errorValidFromPast);
        setIsSubmitting(false);
        return;
      }
      if (validTo && validTo.getTime() < todayStart.getTime()) {
        alert(text.errorValidToPast);
        setIsSubmitting(false);
        return;
      }
      if (validFrom && validTo && validTo.getTime() < validFrom.getTime()) {
        alert(text.errorValidToBeforeFrom);
        setIsSubmitting(false);
        return;
      }
      const result = await createVoucher({
        ...formData,
        validFrom: parseDateOnlyLocal(formData.validFrom).toISOString(),
        validTo: parseDateOnlyEndOfDay(formData.validTo).toISOString(),
      });
      
      if (result.success) {
        alert(isHebrew ? '✅ שובר נוצר בהצלחה!' : '✅ Voucher created successfully!');
        setIsOpen(false);
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '',
          points: '',
          imageUrl: '',
          stock: '',
          businessIds: [],
          validFrom: '',
          validTo: ''
        });
        
        // Refresh list without full page reload
        onSuccess?.();
      } else {
        alert(
          isHebrew 
            ? `❌ שגיאה ביצירת שובר: ${result.error}` 
            : `❌ Error creating voucher: ${result.error}`
        );
      }
    } catch (err: any) {
      console.error('Error creating voucher:', err);
      alert(
        isHebrew 
          ? '❌ שגיאה ביצירת שובר' 
          : '❌ Error creating voucher'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {text.addNewVoucher}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto" dir={isHebrew ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{text.addNewVoucher}</DialogTitle>
        </DialogHeader>

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
                type="date"
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
                type="date"
                value={formData.validTo}
                onChange={handleChange}
                required
              />
            </div>
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
              {isSubmitting ? text.creating : text.createVoucher}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

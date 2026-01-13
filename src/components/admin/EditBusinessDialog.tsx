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
import { updateBusiness, getFilters } from '@/lib/actions/admin';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Business, Filter } from '@/types/promo';
import { HEBREW_SERVICE_TAGS } from '@/lib/constants/hebrew-service-tags';

interface EditBusinessDialogProps {
  business: Business;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditBusinessDialog({ business, isOpen, onClose, onSuccess }: EditBusinessDialogProps) {
  const { t } = useTranslation('Admin');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    contactInfo: {
      email: '',
      phone: '',
      address: ''
    },
    tags: [] as string[],
    filterIds: [] as string[],
    rating: ''
  });
  const [filters, setFilters] = useState<Filter[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';
  
  // HARDCODED TEXT
  const text = {
    title: isHebrew ? 'ערוך עסק' : 'Edit Business',
    name: isHebrew ? 'שם' : 'Name',
    namePlaceholder: isHebrew ? 'הכנס שם עסק' : 'Enter business name',
    description: isHebrew ? 'תיאור' : 'Description',
    descriptionPlaceholder: isHebrew ? 'הכנס תיאור' : 'Enter description',
    image: isHebrew ? 'תמונה' : 'Image',
    tags: isHebrew ? 'תגיות' : 'Tags',
    selectedTags: isHebrew ? 'תגיות נבחרות' : 'Selected tags',
    rating: isHebrew ? 'דירוג' : 'Rating',
    ratingPlaceholder: isHebrew ? '1-5' : '1-5',
    contactInfo: isHebrew ? 'פרטי קשר' : 'Contact Information',
    email: isHebrew ? 'אימייל' : 'Email',
    emailPlaceholder: isHebrew ? 'example@email.com' : 'example@email.com',
    phone: isHebrew ? 'טלפון' : 'Phone',
    phonePlaceholder: isHebrew ? '+972-50-123-4567' : '+972-50-123-4567',
    address: isHebrew ? 'כתובת' : 'Address',
    addressPlaceholder: isHebrew ? 'הכנס כתובת' : 'Enter address',
    cancel: isHebrew ? 'ביטול' : 'Cancel',
    updating: isHebrew ? 'מעדכן...' : 'Updating...',
    update: isHebrew ? 'עדכן' : 'Update'
  };

  useEffect(() => {
    if (isOpen) {
      fetchFilters();
      if (business) {
        setFormData({
          name: business.name || '',
          description: business.description || '',
          imageUrl: business.imageUrl || '',
          contactInfo: {
            email: business.contactInfo?.email || '',
            phone: business.contactInfo?.phone || '',
            address: business.contactInfo?.address || ''
          },
          tags: business.tags || [],
          filterIds: business.filterIds || [],
          rating: business.rating?.toString() || ''
        });
      }
    }
  }, [isOpen, business]);

  const fetchFilters = async () => {
    setLoading(true);
    try {
      const filtersResult = await getFilters();
      if (filtersResult.success && filtersResult.filters) {
        setFilters(filtersResult.filters);
      }
    } catch (err) {
      console.error('Error fetching filters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => {
      if (prev.tags.includes(tag)) {
        return {
          ...prev,
          tags: prev.tags.filter(t => t !== tag)
        };
      } else {
        return {
          ...prev,
          tags: [...prev.tags, tag]
        };
      }
    });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilterChange = (selectedIds: string[]) => {
    setFormData((prev) => ({
      ...prev,
      filterIds: selectedIds
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await updateBusiness(business.id, {
        name: formData.name,
        description: formData.description,
        imageUrl: formData.imageUrl,
        contactInfo: formData.contactInfo,
        tags: formData.tags,
        filterIds: formData.filterIds && formData.filterIds.length > 0 ? formData.filterIds : undefined,
        rating: formData.rating ? Number(formData.rating) : undefined
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to update business');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error updating business:', err);
      setError(err.message || 'Failed to update business. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pr-8">
          <DialogTitle className="text-center">{text.title}</DialogTitle>
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

          <div className="space-y-2">
            <Label htmlFor="imageUrl">{text.image}</Label>
            <MediaUpload
              type="image"
              value={formData.imageUrl}
              onChange={(filePath) => {
                setFormData((prev) => ({ ...prev, imageUrl: filePath }));
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>{text.tags}</Label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-2">
              {HEBREW_SERVICE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`
                    text-left p-2 rounded text-sm transition-colors
                    ${formData.tags.includes(tag)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-100 hover:bg-gray-200'
                    }
                  `}
                >
                  {tag}
                </button>
              ))}
            </div>
            {formData.tags.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-1">{`${text.selectedTags} (${formData.tags.length})`}</p>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">{text.rating}</Label>
            <Input
              id="rating"
              name="rating"
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={handleChange}
              placeholder={text.ratingPlaceholder}
            />
          </div>

          <div className="space-y-4">
            <Label>{text.contactInfo}</Label>
            
            <div className="space-y-2">
              <Label htmlFor="email">{text.email}</Label>
              <Input
                id="email"
                name="contactInfo.email"
                type="email"
                value={formData.contactInfo.email}
                onChange={handleChange}
                placeholder={text.emailPlaceholder}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{text.phone}</Label>
              <Input
                id="phone"
                name="contactInfo.phone"
                value={formData.contactInfo.phone}
                onChange={handleChange}
                placeholder={text.phonePlaceholder}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{text.address}</Label>
              <Textarea
                id="address"
                name="contactInfo.address"
                value={formData.contactInfo.address}
                onChange={handleChange}
                placeholder={text.addressPlaceholder}
                rows={2}
                required
              />
            </div>
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

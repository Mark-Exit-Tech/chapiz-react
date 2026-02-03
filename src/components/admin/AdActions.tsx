'use client';

import MediaUpload from '@/components/admin/MediaUpload';
import { Button } from '@/components/ui/button';
import { getYouTubeEmbedUrl, getYouTubeVideoId } from '@/lib/utils/youtube';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { AdStatus, AdType, deleteAd, updateAd, Ad } from '@/lib/actions/admin';
import { MoreHorizontal } from 'lucide-react';

import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/use-locale';
import { useState, useEffect } from 'react';
import { HEBREW_SERVICE_TAGS } from '@/lib/constants/hebrew-service-tags';
import { getAreasForDropdown, getCitiesForDropdown, getAgeRangesForDropdown, getWeightRangesForDropdown } from '@/lib/firebase/database/pets';
import { RtlMultiselect } from '@/components/ui/rtl-multiselect';
import { PetFiltersBlock } from '@/components/admin/PetFiltersBlock';

interface AdActionsProps {
  ad: Ad;
  onDelete?: () => void;
  onUpdate?: () => void;
}

export default function AdActions({ ad, onDelete, onUpdate }: AdActionsProps) {
  const { t: tCommon } = useTranslation('common');
  const locale = useLocale() as 'en' | 'he';
  const isHebrew = locale === 'he';

  // HARDCODED TEXT
  const text = {
    actions: isHebrew ? 'פעולות' : 'Actions',
    edit: isHebrew ? 'עריכה' : 'Edit',
    delete: isHebrew ? 'מחיקה' : 'Delete',
    title: isHebrew ? 'כותרת' : 'Title',
    description: isHebrew ? 'תיאור' : 'Description',
    descriptionPlaceholder: isHebrew ? 'הזן תיאור למודעה' : 'Enter ad description',
    phoneNumber: isHebrew ? 'מספר טלפון' : 'Phone Number',
    phonePlaceholder: isHebrew ? 'הזן מספר טלפון' : 'Enter phone number',
    location: isHebrew ? 'מיקום' : 'Location',
    locationPlaceholder: isHebrew ? 'הזן מיקום' : 'Enter location',
    area: isHebrew ? 'אזור' : 'Area',
    areaPlaceholder: isHebrew ? 'בחר אזור' : 'Select area',
    city: isHebrew ? 'עיר' : 'City',
    cityPlaceholder: isHebrew ? 'בחר עיר' : 'Select city',
    petType: isHebrew ? 'סוג חיה' : 'Pet Type',
    petTypePlaceholder: isHebrew ? 'בחר סוג חיה' : 'Select pet type',
    otherSpecify: isHebrew ? 'אחר (פרט)' : 'Other (please specify)',
    breed: isHebrew ? 'גזע' : 'Breed',
    breedPlaceholder: isHebrew ? 'בחר גזע' : 'Select breed',
    ageRange: isHebrew ? 'טווח גיל' : 'Age Range',
    ageRangePlaceholder: isHebrew ? 'בחר טווח גיל' : 'Select age range',
    weight: isHebrew ? 'משקל' : 'Weight',
    weightPlaceholder: isHebrew ? 'בחר משקל' : 'Select weight',
    tags: isHebrew ? 'תגיות' : 'Tags',
    serviceTags: isHebrew ? 'תגיות שירות' : 'Service Tags',
    mediaType: isHebrew ? 'סוג מדיה' : 'Media Type',
    image: isHebrew ? 'תמונה' : 'Image',
    video: isHebrew ? 'וידאו' : 'Video',
    youtube: isHebrew ? 'יוטיוב' : 'YouTube',
    youtubeUrl: isHebrew ? 'קישור יוטיוב' : 'YouTube URL',
    youtubeUrlHelp: isHebrew ? 'הזן את קישור הסרטון מיוטיוב' : 'Enter the YouTube video URL',
    content: isHebrew ? 'תוכן' : 'Content',
    cancel: isHebrew ? 'ביטול' : 'Cancel',
    updateAd: isHebrew ? 'עדכן מודעה' : 'Update Ad',
    updating: isHebrew ? 'מעדכן...' : 'Updating...',
    confirmDeletion: isHebrew ? 'אישור מחיקה' : 'Confirm Deletion',
    deleteMessage: isHebrew ? 'האם אתה בטוח שברצונך למחוק מודעה זו? פעולה זו אינה ניתנת לביטול.' : 'Are you sure you want to delete this ad? This action cannot be undone.',
    deleteAd: isHebrew ? 'מחק מודעה' : 'Delete Ad',
    deleting: isHebrew ? 'מוחק...' : 'Deleting...',
    search: isHebrew ? 'חיפוש...' : 'Search...',
    noOptions: isHebrew ? 'לא נמצאו אפשרויות' : 'No options found',
    selectPetTypeFirst: isHebrew ? 'בחר סוג חיה מלבד "אחר" כדי לבחור גזע' : 'Select pet type(s) other than "Other" to choose breed',
    requiredField: isHebrew ? 'שדה חובה' : 'Required field'
  };

  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [areas, setAreas] = useState<Array<{ value: string; label: string }>>([]);
  const [cities, setCities] = useState<Array<{ value: string; label: string }>>([]);
  const [ageRanges, setAgeRanges] = useState<Array<{ value: string; label: string }>>([]);
  const [weightRanges, setWeightRanges] = useState<Array<{ value: string; label: string }>>([]);

  // Detect if content is a YouTube URL
  const isYouTubeUrl = (url: string) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be') || getYouTubeVideoId(url) !== null;
  };

  const [mediaType, setMediaType] = useState<'image' | 'video' | 'youtube'>(() => {
    if (isYouTubeUrl(ad.content)) return 'youtube';
    return ad.type === 'video' ? 'video' : 'image';
  });

  const ensureString = (value: string | string[] | undefined): string => {
    if (Array.isArray(value)) return value[0] || '';
    return value || '';
  };
  const ensureArray = (value: string | string[] | undefined): string[] => {
    if (Array.isArray(value)) return value.filter(Boolean);
    return value ? [value] : [];
  };

  const [formData, setFormData] = useState({
    title: ad.title,
    content: isYouTubeUrl(ad.content) ? '' : ad.content,
    youtubeUrl: isYouTubeUrl(ad.content) ? ad.content : '',
    type: ad.type,
    startDate: ad.startDate
      ? new Date(ad.startDate).toISOString().split('T')[0]
      : '',
    endDate: ad.endDate ? new Date(ad.endDate).toISOString().split('T')[0] : '',
    phone: ad.phone || '',
    location: ad.location || '',
    description: ad.description || '',
    tags: ad.tags || [],
    area: ensureString(ad.area),
    city: ad.city || [],
    petType: ensureArray(ad.petType),
    petTypeOther: (ad as any).petTypeOther || '',
    breed: ensureArray(ad.breed),
    ageRange: ad.ageRange || [],
    weight: ad.weight || []
  });

  // Load functions
  const loadAreas = async () => {
    const areaList = await getAreasForDropdown(locale);
    setAreas(areaList);
  };

  const loadCities = async () => {
    const cityList = await getCitiesForDropdown(locale);
    setCities(cityList);
  };

  const loadAgeRanges = async () => {
    const ageRangeList = await getAgeRangesForDropdown(locale);
    setAgeRanges(ageRangeList);
  };

  const loadWeightRanges = async () => {
    const weightRangeList = await getWeightRangesForDropdown(locale);
    setWeightRanges(weightRangeList);
  };

  // Effects
  useEffect(() => {
    if (isEditOpen) {
      loadAreas();
      loadCities();
      loadAgeRanges();
      loadWeightRanges();
    }
  }, [isEditOpen, locale]);

  useEffect(() => {
    if (isEditOpen && ad) {
      const isYouTube = isYouTubeUrl(ad.content);
      setMediaType(isYouTube ? 'youtube' : (ad.type === 'video' ? 'video' : 'image'));
      setFormData({
        title: ad.title,
        content: isYouTube ? '' : ad.content,
        youtubeUrl: isYouTube ? ad.content : '',
        type: ad.type,
        startDate: ad.startDate
          ? new Date(ad.startDate).toISOString().split('T')[0]
          : '',
        endDate: ad.endDate ? new Date(ad.endDate).toISOString().split('T')[0] : '',
        phone: ad.phone || '',
        location: ad.location || '',
        description: ad.description || '',
        tags: ad.tags || [],
        area: ensureString(ad.area),
        city: ad.city || [],
        petType: ensureArray(ad.petType),
        petTypeOther: (ad as any).petTypeOther || '',
        breed: ensureArray(ad.breed),
        ageRange: ad.ageRange || [],
        weight: ad.weight || []
      });
    }
  }, [isEditOpen, ad]);


  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFieldErrors((prev) => ({ ...prev, [name]: false }));
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };


  const addPredefinedTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };


  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const required: Record<string, boolean> = {
      title: !formData.title.trim(),
      youtubeUrl: mediaType === 'youtube' ? !formData.youtubeUrl.trim() : false,
      content: mediaType !== 'youtube' ? !formData.content.trim() : false
    };
    if (Object.values(required).some(Boolean)) {
      setFieldErrors(required);
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      // Determine ad type and content based on media type
      let adType: 'image' | 'video' = 'image';
      let adContent = formData.content;

      if (mediaType === 'youtube') {
        // For YouTube, store the YouTube URL in content and set type to video
        adType = 'video';
        adContent = formData.youtubeUrl || '';
      } else if (mediaType === 'video') {
        adType = 'video';
        adContent = formData.content;
      } else {
        adType = 'image';
        adContent = formData.content;
      }

      const updateResult = await updateAd(ad.id, {
        title: formData.title,
        content: adContent,
        type: adType,
        status: 'active' as AdStatus, // Always set to active
        startDate: null,
        endDate: null,
        phone: formData.phone,
        location: formData.location,
        description: formData.description,
        tags: formData.tags,
        area: formData.area,
        city: formData.city,
        petType: formData.petType,
        petTypeOther: formData.petType.includes('other') ? (formData.petTypeOther || undefined) : undefined,
        breed: formData.breed,
        ageRange: formData.ageRange,
        weight: formData.weight
      });

      setIsEditOpen(false);
      if (onUpdate) {
        onUpdate();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update advertisement');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmation) {
      setIsDeleting(true);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await deleteAd(ad.id);
      setIsDeleting(false);
      if (onDelete) {
        onDelete();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete advertisement');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Actions Button with native select */}
      <select
        className="h-8 w-8 p-0 border-0 bg-transparent cursor-pointer appearance-none text-center"
        onChange={(e) => {
          const value = e.target.value;
          if (value === 'edit') setIsEditOpen(true);
          if (value === 'delete') setIsDeleting(true);
          e.target.value = '';
        }}
        value=""
        title={text.actions}
      >
        <option value="" disabled>⋮</option>
        <option value="edit">{text.edit}</option>
        <option value="delete">{text.delete}</option>
      </select>

      {/* Edit Ad Dialog */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          if (!open) {
            // Reset form data when closing
            const isYouTube = isYouTubeUrl(ad.content);
            setMediaType(isYouTube ? 'youtube' : (ad.type === 'video' ? 'video' : 'image'));
            setFormData({
              title: ad.title,
              content: isYouTube ? '' : ad.content,
              youtubeUrl: isYouTube ? ad.content : '',
              type: ad.type,
              startDate: ad.startDate
                ? new Date(ad.startDate).toISOString().split('T')[0]
                : '',
              endDate: ad.endDate
                ? new Date(ad.endDate).toISOString().split('T')[0]
                : '',
              phone: ad.phone || '',
              location: ad.location || '',
              description: ad.description || '',
              tags: ad.tags || [],
              area: ad.area || '',
              city: ad.city || [],
              petType: ensureArray(ad.petType),
              petTypeOther: (ad as any).petTypeOther || '',
              breed: ensureArray(ad.breed),
              ageRange: ad.ageRange || [],
              weight: ad.weight || []
            });
            setError(null);
          }
          setIsEditOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" dir={isHebrew ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{text.edit}</DialogTitle>
          </DialogHeader>

          {error && (
            <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{text.title}</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={fieldErrors.title ? 'border-red-500 ring-2 ring-red-200' : ''}
              />
              {fieldErrors.title && <p className="text-sm text-red-600">{text.requiredField}</p>}
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
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{text.phoneNumber}</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={text.phonePlaceholder}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">{text.location}</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder={text.locationPlaceholder}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area">{text.area}</Label>
                <select
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">{text.areaPlaceholder}</option>
                  {areas.map((area) => (
                    <option key={area.value} value={area.value}>
                      {area.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">{text.city}</Label>
                <RtlMultiselect
                  options={cities}
                  selectedValues={formData.city}
                  onSelectionChange={(values) => {
                    setFormData((prev) => ({ ...prev, city: values }));
                  }}
                  placeholder={text.cityPlaceholder}
                  searchPlaceholder={text.search}
                  noOptionsText={text.noOptions}
                />
              </div>
            </div>

            <PetFiltersBlock
              locale={locale}
              selectedPetTypes={formData.petType}
              onPetTypesChange={(values) => setFormData((prev) => ({ ...prev, petType: values, breed: [], ...(values.includes('other') ? {} : { petTypeOther: '' }) }))}
              selectedBreeds={formData.breed}
              onBreedsChange={(values) => setFormData((prev) => ({ ...prev, breed: values }))}
              petTypeOther={formData.petTypeOther}
              onPetTypeOtherChange={(value) => setFormData((prev) => ({ ...prev, petTypeOther: value }))}
              text={{
                petType: text.petType,
                petTypePlaceholder: text.petTypePlaceholder,
                otherSpecify: text.otherSpecify,
                breed: text.breed,
                breedPlaceholder: text.breedPlaceholder,
                search: text.search,
                noOptions: text.noOptions,
                selectPetTypeFirst: text.selectPetTypeFirst
              }}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ageRange">{text.ageRange}</Label>
                <RtlMultiselect
                  options={ageRanges}
                  selectedValues={formData.ageRange}
                  onSelectionChange={(values) => {
                    setFormData((prev) => ({ ...prev, ageRange: values }));
                  }}
                  placeholder={text.ageRangePlaceholder}
                  searchPlaceholder={text.search}
                  noOptionsText={text.noOptions}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">{text.weight}</Label>
                <RtlMultiselect
                  options={weightRanges}
                  selectedValues={formData.weight}
                  onSelectionChange={(values) => {
                    setFormData((prev) => ({ ...prev, weight: values }));
                  }}
                  placeholder={text.weightPlaceholder}
                  searchPlaceholder={text.search}
                  noOptionsText={text.noOptions}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">{text.tags}</Label>

              {/* Predefined Hebrew Service Tags */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">{text.serviceTags}</Label>
                <div className="flex flex-wrap gap-2">
                  {HEBREW_SERVICE_TAGS.map((tag, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => addPredefinedTag(tag)}
                      disabled={formData.tags.includes(tag)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${formData.tags.includes(tag)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Tags */}
              {formData.tags.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">{tCommon('selectedTags')}</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm flex items-center gap-1">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-300">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>{text.mediaType}</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="image"
                    checked={mediaType === 'image'}
                    onChange={(e) => setMediaType(e.target.value as 'image' | 'video' | 'youtube')}
                    className="cursor-pointer"
                  />
                  <span>{text.image}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="video"
                    checked={mediaType === 'video'}
                    onChange={(e) => setMediaType(e.target.value as 'image' | 'video' | 'youtube')}
                    className="cursor-pointer"
                  />
                  <span>{text.video}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="youtube"
                    checked={mediaType === 'youtube'}
                    onChange={(e) => setMediaType(e.target.value as 'image' | 'video' | 'youtube')}
                    className="cursor-pointer"
                  />
                  <span>{text.youtube}</span>
                </label>
              </div>
            </div>

            {mediaType === 'youtube' ? (
              <div className="space-y-2">
                <Label htmlFor="youtubeUrl">{text.youtubeUrl}</Label>
                <Input
                  id="youtubeUrl"
                  name="youtubeUrl"
                  value={formData.youtubeUrl}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  type="url"
                  className={fieldErrors.youtubeUrl ? 'border-red-500 ring-2 ring-red-200' : ''}
                />
                {fieldErrors.youtubeUrl && <p className="text-sm text-red-600">{text.requiredField}</p>}
                <p className="text-sm text-gray-500">
                  {text.youtubeUrlHelp}
                </p>
                {formData.youtubeUrl && getYouTubeEmbedUrl(formData.youtubeUrl) && (
                  <div className="mt-4 rounded-md overflow-hidden border">
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={getYouTubeEmbedUrl(formData.youtubeUrl) || ''}
                        title="YouTube video preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="content">{text.content}</Label>
                <div className={fieldErrors.content ? 'rounded-md ring-2 ring-red-200 ring-offset-0' : ''}>
                  <MediaUpload
                    type={mediaType}
                    value={formData.content}
                    onChange={(filePath) => {
                      setFieldErrors((prev) => ({ ...prev, content: false }));
                      setFormData((prev) => ({ ...prev, content: filePath }));
                    }}
                  />
                </div>
                {fieldErrors.content && <p className="text-sm text-red-600">{text.requiredField}</p>}
              </div>
            )}



            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
              >
                {text.cancel}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? text.updating : text.updateAd}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleting}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirmation(false);
            setError(null);
          }
          setIsDeleting(open);
        }}
      >
        <DialogContent className="sm:max-w-md" dir={isHebrew ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{text.confirmDeletion}</DialogTitle>
            <DialogDescription>
              {text.deleteMessage}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)}>
              {text.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteConfirmation(true);
                handleDelete();
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? text.deleting : text.deleteAd}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

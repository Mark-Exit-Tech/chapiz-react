'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { uploadPetImage } from '@/lib/firebase/storage';
import { updatePetInFirestore, deletePet } from '@/lib/firebase/database/pets';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Upload, Loader2, CheckCircle, XCircle, Save, ArrowLeft, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getBreedsForDropdown, getGendersForDropdown, getPetTypesForDropdown } from '@/lib/firebase/database/pets';
import { motion } from 'framer-motion';
// Image removed;
import GetStartedDatePicker from './get-started/ui/GetStartedDatePicker';
import { AutocompleteBreedInput } from './ui/autocomplete-breed-input';
import { getLocalizedBreedsForType } from '@/lib/data/breeds';

interface Pet {
  id: string;
  name: string;
  type: string;
  breedName: string;
  breedId?: string;
  imageUrl?: string;
  description?: string;
  age?: string;
  gender?: string;
  weight?: string;
  notes?: string;
  birthDate?: string;
}

interface EditPetFormProps {
  pet: Pet;
}

interface PetFormData {
  name: string;
  type: string;
  breed: string;
  image: File | null;
  imageUrl: string;
  birthDate: string;
  gender: string;
  weight: string;
  notes: string;
}

interface UploadProgress {
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}


export default function EditPetForm({ pet }: EditPetFormProps) {
  const { user, dbUser } = useAuth();
  const navigate = useNavigate();

  // Get locale from URL - check if first path segment is a valid locale
  const getLocaleFromUrl = () => {
    if (typeof window === 'undefined') return 'en';
    const pathParts = window.location.pathname.split('/');
    const firstSegment = pathParts[1];
    if (firstSegment === 'he' || firstSegment === 'en') {
      return firstSegment;
    }
    const browserLang = navigator.language?.split('-')[0];
    return browserLang === 'he' ? 'he' : 'en';
  };
  const locale = getLocaleFromUrl() as 'en' | 'he';
  const isHebrew = locale === 'he';

  // HARDCODED TEXT
  const text = {
    edit: {
      title: isHebrew ? 'עריכת חיית מחמד' : 'Edit Pet',
      success: isHebrew ? 'חיית המחמד עודכנה בהצלחה' : 'Pet updated successfully',
      error: isHebrew ? 'שגיאה בעדכון חיית המחמד' : 'Error updating pet',
      deleteSuccess: isHebrew ? 'חיית המחמד נמחקה בהצלחה' : 'Pet deleted successfully',
      deleteError: isHebrew ? 'שגיאה במחיקת חיית המחמד' : 'Error deleting pet',
    },
    form: {
      name: isHebrew ? 'שם' : 'Name',
      type: isHebrew ? 'סוג' : 'Type',
      selectType: isHebrew ? 'בחר סוג' : 'Select type',
      breed: isHebrew ? 'גזע' : 'Breed',
      selectBreed: isHebrew ? 'בחר גזע' : 'Select breed',
      currentPhoto: isHebrew ? 'תמונה נוכחית' : 'Current Photo',
      changePhoto: isHebrew ? 'שנה תמונה' : 'Change Photo',
      uploadPhoto: isHebrew ? 'העלה תמונה' : 'Upload Photo',
      uploadPrompt: isHebrew ? 'לחץ להעלאה' : 'Click to upload',
      imageRequirements: isHebrew ? 'PNG, JPG עד 10MB' : 'PNG, JPG up to 10MB',
      updating: isHebrew ? 'מעדכן...' : 'Updating...',
      birthDate: isHebrew ? 'תאריך לידה' : 'Birth Date',
      gender: isHebrew ? 'מין' : 'Gender',
      selectGender: isHebrew ? 'בחר מין' : 'Select gender',
      weight: isHebrew ? 'משקל (ק"ג)' : 'Weight (kg)',
      weightPlaceholder: isHebrew ? 'הזן משקל' : 'Enter weight',
      notes: isHebrew ? 'הערות' : 'Notes',
      notesPlaceholder: isHebrew ? 'הזן הערות' : 'Enter notes',
      save: isHebrew ? 'שמור' : 'Save',
    },
    delete: isHebrew ? 'מחק' : 'Delete',
    deleteConfirm: {
      title: isHebrew ? 'מחיקת חיית מחמד' : 'Delete Pet',
      message: isHebrew ? 'האם אתה בטוח שברצונך למחוק את חיית המחמד הזו? פעולה זו אינה ניתנת לביטול.' : 'Are you sure you want to delete this pet? This action cannot be undone.',
      cancel: isHebrew ? 'ביטול' : 'Cancel',
      delete: isHebrew ? 'מחק' : 'Delete',
      deleting: isHebrew ? 'מוחק...' : 'Deleting...',
    },
  };
  // Map numeric pet type IDs to string types for breed selection
  // Only dog, cat, and other are supported
  const petTypeIdToString: Record<string, string> = {
    '1': 'dog',
    '2': 'cat',
    '3': 'other',
    '4': 'other',
    '5': 'other',
    'dog': 'dog',
    'cat': 'cat',
    'other': 'other',
  };

  // Get the string type for breed lookup
  const getPetTypeString = (type: string): 'dog' | 'cat' | 'other' => {
    const typeStr = petTypeIdToString[type] || type;
    if (typeStr === 'dog' || typeStr === 'cat') {
      return typeStr;
    }
    return 'other';
  };

  const [formData, setFormData] = useState<PetFormData>({
    name: pet.name || '',
    type: pet.type || '',
    breed: pet.breedName || '',
    image: null,
    imageUrl: pet.imageUrl || '',
    birthDate: pet.birthDate || '',
    gender: pet.gender || '',
    weight: pet.weight || '',
    notes: pet.notes || '',
  });
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    status: 'completed',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [breeds, setBreeds] = useState<{ value: string; label: string }[]>([]);
  const [genders, setGenders] = useState<{ value: string; label: string }[]>([]);
  const [petTypes, setPetTypes] = useState<{ value: string; label: string }[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);
  const [breedId, setBreedId] = useState<string>(pet.breedId || '');

  // Fetch dropdown data from database
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setIsLoadingDropdowns(true);
        const [breedsData, gendersData, typesData] = await Promise.all([
          getBreedsForDropdown(locale),
          getGendersForDropdown(locale),
          getPetTypesForDropdown(locale)
        ]);

        setBreeds(breedsData);
        setGenders(gendersData);
        setPetTypes(typesData);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
        toast.error('Failed to load form data');
      } finally {
        setIsLoadingDropdowns(false);
      }
    };

    fetchDropdownData();
  }, [locale]);

  // Update breed ID when type or breed name changes (only if breedId is not already set)
  useEffect(() => {
    // Skip if breedId is already set from pet data
    if (breedId && !formData.breed) {
      // If we have a breedId but no breed name, try to find the breed name
      const petTypeStr = getPetTypeString(formData.type);
      if (petTypeStr === 'dog' || petTypeStr === 'cat') {
        try {
          const localizedBreeds = getLocalizedBreedsForType(petTypeStr, locale);
          const matchingBreed = localizedBreeds.find(breed => breed.id === breedId);
          if (matchingBreed) {
            setFormData(prev => ({ ...prev, breed: matchingBreed.name }));
          }
        } catch (error) {
          console.error('Error finding breed name from ID:', error);
        }
      }
      return;
    }

    if (formData.type && formData.breed) {
      try {
        const petTypeStr = getPetTypeString(formData.type);
        const localizedBreeds = getLocalizedBreedsForType(petTypeStr, locale);
        const matchingBreed = localizedBreeds.find(
          breed => breed.name.toLowerCase() === formData.breed.toLowerCase() ||
            breed.name === formData.breed
        );
        if (matchingBreed) {
          setBreedId(matchingBreed.id);
        } else {
          // Don't clear breedId if breed name doesn't match - might be custom
          if (!breedId) {
            setBreedId('');
          }
        }
      } catch (error) {
        console.error('Error finding breed ID:', error);
      }
    }
  }, [formData.type, formData.breed, locale, breedId]);

  const handleInputChange = (field: keyof PetFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Reset breed when type changes
    if (field === 'type') {
      setFormData(prev => ({
        ...prev,
        breed: '',
      }));
      setBreedId('');
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user) {
      toast.error('Please log in to upload images');
      return;
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setFormData(prev => ({
      ...prev,
      image: file,
    }));

    setUploadProgress({ progress: 0, status: 'uploading' });

    try {
      const result = await uploadPetImage(file, pet.id);

      if (result.success && result.downloadURL) {
        setFormData(prev => ({
          ...prev,
          imageUrl: result.downloadURL!
        }));
        setUploadProgress({ progress: 100, status: 'completed' });
        toast.success('Image uploaded successfully');
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress({ progress: 0, status: 'error' });
      toast.error('Upload failed. Please try again.');
    }
  };

  const handleDeletePet = async () => {
    if (!pet.id) {
      toast.error('Pet ID not found');
      return;
    }

    setIsDeleting(true);
    try {
      const success = await deletePet(pet.id);

      if (success) {
        toast.success(text.edit.deleteSuccess);
        navigate(`/${locale}/my-pets`);
      } else {
        toast.error(text.edit.deleteError);
      }
    } catch (error) {
      console.error('Delete pet error:', error);
      toast.error(text.edit.deleteError);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      const petData = {
        name: formData.name,
        type: formData.type,
        breedName: formData.breed,
        breedId: breedId, // Include breedId so it can be used for localization
        imageUrl: formData.imageUrl, // Use the already uploaded image URL
        birthDate: formData.birthDate,
        gender: formData.gender,
        weight: formData.weight,
        notes: formData.notes,
      };

      console.log('Updating pet with data:', petData);
      console.log('Original pet name:', pet.name);
      console.log('Form data name:', formData.name);
      console.log('Pet data name being sent:', petData.name);

      const updateResult = await updatePetInFirestore(pet.id, petData);
      console.log('Update result:', updateResult);

      if (updateResult.success) {
        toast.success(text.edit.success);
        // Force refresh the page to ensure updated data is displayed
        window.location.href = `/${locale}/my-pets`;
      } else {
        throw new Error(updateResult.error || 'Failed to update pet');
      }
    } catch (error) {
      console.error('Error updating pet:', error);
      toast.error(text.edit.error);
      setUploadProgress({ progress: 0, status: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-lg">
            <CardHeader className="text-center relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2"
              >
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              </Button>
              <CardTitle className="text-2xl font-bold text-gray-800">
                {text.edit.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Pet Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    {text.form.name} *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder={text.form.name}
                    required
                    className="w-full"
                  />
                </div>

                {/* Pet Type */}
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                    {text.form.type} *
                  </Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    required
                    disabled={isLoadingDropdowns}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option value="">{isLoadingDropdowns ? 'Loading...' : text.form.selectType}</option>
                    {petTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Breed Selection - Show autocomplete for dog/cat types */}
                {formData.type && (getPetTypeString(formData.type) === 'dog' || getPetTypeString(formData.type) === 'cat') && (
                  <div className="space-y-2">
                    <AutocompleteBreedInput
                      petType={getPetTypeString(formData.type) as 'dog' | 'cat'}
                      value={breedId}
                      onValueChange={(id) => {
                        setBreedId(id);
                        // Find breed name from ID
                        try {
                          const petTypeStr = getPetTypeString(formData.type);
                          const localizedBreeds = getLocalizedBreedsForType(petTypeStr, locale);
                          const selectedBreed = localizedBreeds.find(breed => breed.id === id);
                          if (selectedBreed) {
                            setFormData(prev => ({ ...prev, breed: selectedBreed.name }));
                          } else {
                            setFormData(prev => ({ ...prev, breed: '' }));
                          }
                        } catch (error) {
                          console.error('Error finding breed name:', error);
                          setFormData(prev => ({ ...prev, breed: '' }));
                        }
                      }}
                      placeholder={text.form.selectBreed}
                      label={text.form.breed}
                      disabled={isLoadingDropdowns}
                      className="w-full"
                    />
                  </div>
                )}
                {/* Custom breed input for "other" type */}
                {formData.type && getPetTypeString(formData.type) === 'other' && (
                  <div className="space-y-2">
                    <Label htmlFor="breed" className="text-sm font-medium text-gray-700">
                      {text.form.breed}
                    </Label>
                    <Input
                      id="breed"
                      type="text"
                      value={formData.breed}
                      onChange={(e) => handleInputChange('breed', e.target.value)}
                      placeholder={text.form.breed}
                      disabled={isLoadingDropdowns}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Current Image Display */}
                {formData.imageUrl && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      {text.form.currentPhoto}
                    </Label>
                    <div className="relative w-32 h-32 mx-auto">
                      <img
                        src={formData.imageUrl}
                        alt={formData.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image" className="text-sm font-medium text-gray-700">
                    {formData.imageUrl ? text.form.changePhoto : text.form.uploadPhoto}
                  </Label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="image"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">{text.form.uploadPrompt}</span>
                        </p>
                        <p className="text-xs text-gray-500">{text.form.imageRequirements}</p>
                      </div>
                      <input
                        id="image"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>

                {/* Upload Progress */}
                {uploadProgress.status === 'uploading' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{text.form.updating}</span>
                      <span className="text-gray-600">{uploadProgress.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress.progress}%` }}
                      />
                    </div>
                  </div>
                )}


                {/* Birth Date and Gender */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div className="space-y-2">
                    <GetStartedDatePicker
                      label={text.form.birthDate}
                      id="birthDate"
                      value={formData.birthDate}
                      maxDate={new Date()}
                      onChange={(date) => {
                        if (date) {
                          handleInputChange('birthDate', date.toISOString());
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                      {text.form.gender}
                    </Label>
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      disabled={isLoadingDropdowns}
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    >
                      <option value="">{isLoadingDropdowns ? 'Loading...' : text.form.selectGender}</option>
                      {genders.map((gender) => (
                        <option key={gender.value} value={gender.value}>
                          {gender.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Weight and Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
                      {text.form.weight}
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      placeholder={text.form.weightPlaceholder}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                      {text.form.notes}
                    </Label>
                    <Input
                      id="notes"
                      type="text"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder={text.form.notesPlaceholder}
                      className="w-full"
                    />
                  </div>
                </div>



                {/* Action Buttons */}
                <div className="flex justify-between pt-6">
                  {/* Save Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || uploadProgress.status === 'uploading'}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2" />
                        {text.form.updating}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {text.form.save}
                      </>
                    )}
                  </Button>

                  {/* Delete Button */}
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isSubmitting || isDeleting || uploadProgress.status === 'uploading'}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {text.delete}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {text.deleteConfirm.title}
            </h3>
            <p className="text-gray-600 mb-6">
              {text.deleteConfirm.message}
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                {text.deleteConfirm.cancel}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeletePet}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {text.deleteConfirm.deleting}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {text.deleteConfirm.delete}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

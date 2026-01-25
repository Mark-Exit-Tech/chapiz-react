'use client';

import OwnerDetailsPage from '@/components/get-started/OwnerDetailsPage';
import PetDetailsPage from '@/components/get-started/PetDetailsPage';
import VetDetailsPage from '@/components/get-started/VetDetailsPage';
import GetStartedFloatingActionButton from '@/components/get-started/ui/GetStartedFloatingActionButton';
import GetStartedProgressDots from '@/components/get-started/ui/GetStartedProgressDots';
import { useLocale } from '@/hooks/use-locale';
import { useNavigate } from 'react-router-dom';
import { usePetId } from '@/hooks/use-pet-id';
import { useParams } from 'react-router-dom';
import { createPetInFirestore } from '@/lib/firebase/database/pets';
import { getUserFromFirestore } from '@/lib/firebase/database/users';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { getPetRegisterSchemas } from '@/utils/validation/petRegister';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import BackButton from './ui/BackButton';

export default function ClientRegisterPetPage({
  genders,
  breeds,
  userDetails,
  locale: localeProp
}: {
  genders: { id: number; labels: { en: string; he: string } }[];
  breeds: { id: number; labels: { en: string; he: string } }[];
  userDetails: { fullName: string; phone: string; email: string };
  locale?: string;
}) {
  const navigate = useNavigate();
  const localeFromHook = useLocale() as string;
  const locale = (localeProp || localeFromHook || 'en') as 'en' | 'he';
  const isHebrew = locale === 'he';
  const { t } = useTranslation('');

  const text = {
    loading: isHebrew ? 'טוען...' : 'Loading...',
    noPetId: isHebrew ? 'אין מזהה חיית מחמד זמין' : 'No pet ID available',
    createError: isHebrew ? 'אירעה שגיאה ביצירת חיית המחמד שלך' : 'An error occurred while creating your pet',
    unexpectedError: isHebrew ? 'אירעה שגיאה לא צפויה' : 'An unexpected error occurred',
    failedCreate: isHebrew ? 'יצירת הפרופיל נכשלה' : 'Failed to create pet profile',
  };
  const { user, dbUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const { petId: localStoragePetId, clearPetId } = usePetId();
  const params = useParams<{ id: string }>();
  const petId = params.id; // Get pet ID from URL parameters
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Note: PetDetailsPage now fetches its own dropdown data from the database

  // Get the internationalized schemas.
  const schemas = useMemo(
    () => getPetRegisterSchemas(t),
    [t]
  );

  // Order of steps: petDetails, ownerDetails, vetDetails.
  const schemaSteps = useMemo(
    () => [schemas.petDetails, schemas.ownerDetails, schemas.vetDetails],
    [schemas]
  );

  // Define form default values.
  const initialFormData = useMemo(
    () => ({
      id: petId || '', // Add required id field
      imageUrl: '',
      petName: '',
      type: '', // String-based type field
      breed: '', // String-based breed field
      breedId: 0, // Add required breedId field
      gender: '', // String-based gender field
      genderId: 0, // Add required genderId field
      birthDate: null as Date | null,
      weight: '', // Add weight field
      notes: '',
      // Use authenticated user data if available, otherwise use userDetails
      ownerFullName: dbUser?.full_name || dbUser?.name || userDetails.fullName || '',
      ownerPhoneNumber: userDetails.phone || '',
      ownerEmailAddress: user?.email || userDetails.email || '',
      ownerHomeAddress: '',
      ownerCoordinates: undefined,
      vetId: '',
      vetName: '',
      vetPhoneNumber: '',
      vetEmailAddress: '',
      vetAddress: '',
      vetCoordinates: undefined,
      vetPlaceId: undefined
    }),
    [user, userDetails, petId]
  );

  const [formData, setFormData] = useState(initialFormData);

  const methods = useForm({
    resolver: zodResolver(schemaSteps[currentStep]),
    defaultValues: initialFormData,
    mode: 'onChange'
  });

  // Fetch user details from Firestore when user is available
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user && isHydrated) {
        try {
          const userResult = await getUserFromFirestore(user.uid);
          if (userResult.success && userResult.user) {
            // Format phone number to include country code if it doesn't have one
            let phoneNumber = userResult.user.phone || userDetails.phone || '';
            if (phoneNumber && !phoneNumber.startsWith('+')) {
              // If phone number doesn't start with +, assume it's Israeli and add +972
              if (phoneNumber.startsWith('0')) {
                phoneNumber = '+972' + phoneNumber.substring(1);
              } else {
                phoneNumber = '+972' + phoneNumber;
              }
            }

            const updatedData = {
              ownerFullName: dbUser?.full_name || dbUser?.name || userResult.user.display_name || userResult.user.full_name || userDetails.fullName || '',
              ownerEmailAddress: user.email || userResult.user.email || userDetails.email || '',
              ownerPhoneNumber: phoneNumber,
              ownerHomeAddress: userResult.user.address || '' // Fetch address from user profile
            };

            console.log('Fetched user data for form:', {
              originalPhone: userResult.user.phone,
              formattedPhone: phoneNumber,
              address: userResult.user.address,
              allFields: Object.keys(userResult.user)
            });

            // Update form data
            setFormData(prev => ({ ...prev, ...updatedData }));

            // Reset form with updated data
            methods.reset(prev => ({ ...prev, ...updatedData }));
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
          // Fallback to userDetails if Firestore fetch fails
          const updatedData = {
            ownerFullName: dbUser?.full_name || dbUser?.name || userDetails.fullName || '',
            ownerEmailAddress: user.email || userDetails.email || '',
            ownerPhoneNumber: userDetails.phone || ''
          };

          setFormData(prev => ({ ...prev, ...updatedData }));
          methods.reset(prev => ({ ...prev, ...updatedData }));
        }
      }
    };

    fetchUserDetails();
  }, [user, isHydrated, userDetails, methods]);

  const handleSubmit = async (allFormData: typeof formData): Promise<void> => {
    if (!petId) {
      setError(text.noPetId);
      toast.error(text.noPetId);
      navigate('/pet/get-started');
      return;
    }

    if (!user) {
      setError(text.unexpectedError);
      toast.error(isHebrew ? 'יש להתחבר כדי לרשום חיית מחמד' : 'Please log in to register a pet');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Transform form data to match Pet interface
      // Cast to any for accessing dynamically added form fields
      const formDataForBreed = allFormData as any;

      // Import breed data to get the breed name from breed ID
      let breedName = formDataForBreed.breed || '';
      let breedIdForStorage = formDataForBreed.breed || '';

      // If breed is a breed ID (like "dog-3"), get the localized name
      if (formDataForBreed.breed && (formDataForBreed.breed.startsWith('dog-') || formDataForBreed.breed.startsWith('cat-'))) {
        try {
          const { getLocalizedBreedsForType } = await import('@/lib/data/breeds');
          const petTypeStr = formDataForBreed.type as 'dog' | 'cat' | 'other';
          if (petTypeStr === 'dog' || petTypeStr === 'cat') {
            const breeds = getLocalizedBreedsForType(petTypeStr, locale);
            const matchingBreed = breeds.find(b => b.id === formDataForBreed.breed);
            if (matchingBreed) {
              breedName = matchingBreed.name;
            }
          }
        } catch (e) {
          console.error('Error getting breed name:', e);
        }
      }

      // Cast to any for accessing dynamically added form fields
      const formDataAny = allFormData as any;

      const petData = {
        // Map petName to name (what Pet interface expects)
        name: formDataAny.petName || '',
        // Store both breedId and breedName for proper display
        breedId: breedIdForStorage,
        breedName: breedName,
        breed: breedName, // Fallback field
        // Other pet details
        type: formDataAny.type || '',
        gender: formDataAny.gender || '',
        birthDate: formDataAny.birthDate ? formDataAny.birthDate.toISOString() : '',
        weight: formDataAny.weight || '',
        notes: formDataAny.notes || '',
        imageUrl: formDataAny.imageUrl || '',
        // Owner details
        ownerFullName: formDataAny.ownerFullName || '',
        ownerPhoneNumber: formDataAny.ownerPhoneNumber || '',
        ownerEmailAddress: formDataAny.ownerEmailAddress || '',
        ownerHomeAddress: formDataAny.ownerHomeAddress || '',
        ownerCoordinates: formDataAny.ownerCoordinates,
        ownerPlaceId: formDataAny.ownerPlaceId,
        isOwnerFullNamePrivate: formDataAny.isOwnerFullNamePrivate || false,
        isOwnerPhonePrivate: formDataAny.isOwnerPhonePrivate || false,
        isOwnerEmailPrivate: formDataAny.isOwnerEmailPrivate || false,
        isOwnerAddressPrivate: formDataAny.isOwnerAddressPrivate || false,
        // Vet details
        vetName: formDataAny.vetName || '',
        vetPhoneNumber: formDataAny.vetPhoneNumber || '',
        vetEmailAddress: formDataAny.vetEmailAddress || '',
        vetAddress: formDataAny.vetAddress || '',
        vetCoordinates: formDataAny.vetCoordinates,
        vetPlaceId: formDataAny.vetPlaceId,
        isVetNamePrivate: formDataAny.isVetNamePrivate || false,
        isVetPhonePrivate: formDataAny.isVetPhonePrivate || false,
        isVetEmailPrivate: formDataAny.isVetEmailPrivate || false,
        isVetAddressPrivate: formDataAny.isVetAddressPrivate || false,
        // User info
        userEmail: user.email || '',
        ownerId: user.uid
      };

      const result = await createPetInFirestore(petData);

      if (result.success) {
        clearPetId();
        navigate(`/${locale}/pet/${result.petId || petId}/done`);
      } else {
        setError(result.error || text.createError);
        toast.error(result.error || text.failedCreate);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(text.unexpectedError);
      toast.error(text.unexpectedError);
    } finally {
      setLoading(false);
    }
  };

  // Save current step's data and navigate forward.
  const handleNext = (stepData: Partial<typeof formData>) => {
    const updatedFormData = { ...formData, ...stepData };
    setFormData(updatedFormData);

    if (currentStep < schemaSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit(updatedFormData);
    }
  };

  // Save current step's data and navigate backward.
  const handleBack = () => {
    const currentData = methods.getValues();
    setFormData((prev) => ({ ...prev, ...currentData }));

    if (currentStep === 0) {
      navigate(`/${locale}/my-pets`);
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Reset the form with the updated formData when the step changes.
  useEffect(() => {
    methods.reset(formData);
  }, [currentStep, formData, methods]);

  const StepComponent = [
    <PetDetailsPage
      key="pet-details"
    />,
    <OwnerDetailsPage key="owner-details" />,
    <VetDetailsPage key="vet-details" />
  ][currentStep];

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <div className="flex h-full grow flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ltr:ml-2 rtl:mr-2 text-gray-600">{text.loading}</span>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleNext)}
        className="flex h-full grow flex-col p-4"
      >
        <div className="flex w-full justify-start">
          <BackButton handleBack={handleBack} />
        </div>
        <div className="grow">{StepComponent}</div>
        <div className="flex w-full flex-row items-center justify-between">
          <GetStartedProgressDots
            numberOfDots={schemaSteps.length}
            currentDot={currentStep}
          />
          <GetStartedFloatingActionButton
            isLastStep={currentStep === schemaSteps.length - 1}
            loading={loading}
          />
        </div>
      </form>
    </FormProvider>
  );
}
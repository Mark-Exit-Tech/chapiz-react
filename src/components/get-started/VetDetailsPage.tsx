import GetStartedHeader from '@/components/get-started/ui/GetStartedHeader';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/use-locale';
import { Controller, useFormContext } from 'react-hook-form';
import he from 'react-phone-number-input/locale/he';
import GetStartedInput from './ui/GetStartedInput';
import { GetStartedPhoneInput } from './ui/GetStartedPhoneInput';
import PrivacyLockToggle from './ui/PrivacyLockToggle';
import LocationAutocompleteComboSelect from './ui/LocationAutocompleteSelector';

const VetDetailsPage = () => {
  const {
    control,
    formState: { errors },
    setValue
  } = useFormContext();
  const { t } = useTranslation('translation', { keyPrefix: 'pages.VetDetailsPage' });
  const locale = useLocale();

  return (
    <div className="flex h-full grow flex-col">
      <GetStartedHeader title={t('title')} />

      {/* Form */}
      <Card className="border-none bg-transparent shadow-none">
        <CardContent className="space-y-10 px-0 pt-8">
          {/* Vet Name - Can be private */}
          <div className="flex items-center gap-2 ">
            <div className="flex-grow min-w-0">
              <Controller
                name="vetName"
                control={control}
                render={({ field }) => (
                  <GetStartedInput
                    label={t('form.VeterinaryName')}
                    id="vetName"
                    {...field}
                    hasError={!!errors.vetName}
                    errorMessage={errors.vetName?.message as string}
                  />
                )}
              />
            </div>
            <Controller
              name="isVetNamePrivate"
              control={control}
              render={({ field: { value, onChange } }) => (
                <PrivacyLockToggle
                  isPrivate={value}
                  onChange={onChange}
                  className="flex-shrink-0"
                />
              )}
            />
          </div>

          {/* Phone Number - Can be private */}
          <div className="flex items-center gap-2 ">
            <div className="flex-grow min-w-0">
              <Controller
                name="vetPhoneNumber"
                control={control}
                render={({ field }) => (
                  <GetStartedPhoneInput
                    label={t('form.PhoneNumber')}
                    id="phoneNumber"
                    {...field}
                    hasError={!!errors.vetPhoneNumber}
                    labels={locale === 'he' ? he : undefined}
                    defaultCountry="IL"
                    international={true}
                  />
                )}
              />
            </div>
            <Controller
              name="isVetPhonePrivate"
              control={control}
              render={({ field: { value, onChange } }) => (
                <PrivacyLockToggle
                  isPrivate={value}
                  onChange={onChange}
                  className="flex-shrink-0"
                />
              )}
            />
          </div>

          {/* Email - Can be private */}
          <div className="flex items-center gap-2 ">
            <div className="flex-grow min-w-0">
              <Controller
                name="vetEmailAddress"
                control={control}
                render={({ field }) => (
                  <GetStartedInput
                    label={t('form.EmailAddress')}
                    id="emailAddress"
                    hasError={!!errors.vetEmailAddress}
                    errorMessage={errors.vetEmailAddress?.message as string}
                    {...field}
                  />
                )}
              />
            </div>
            <Controller
              name="isVetEmailPrivate"
              control={control}
              render={({ field: { value, onChange } }) => (
                <PrivacyLockToggle
                  isPrivate={value}
                  onChange={onChange}
                  className="flex-shrink-0"
                />
              )}
            />
          </div>

          {/* Address - Can be private */}
          <div className="flex items-center gap-2 ">
            <div className="flex-grow min-w-0 overflow-auto">
              <Controller
                name="vetAddress"
                control={control}
                render={({ field }) => (
                  <LocationAutocompleteComboSelect
                    label={t('form.VeterinaryAddress')}
                    id="vetAddress"
                    value={field.value || ''}
                    onChange={field.onChange}
                    onCoordinatesChange={(coords, placeId) => {
                      setValue('vetCoordinates', coords);
                      setValue('vetPlaceId', placeId);
                    }}
                    onBlur={field.onBlur}
                    hasError={!!errors.vetAddress}
                    required
                  />
                )}
              />
            </div>
            <Controller
              name="isVetAddressPrivate"
              control={control}
              render={({ field: { value, onChange } }) => (
                <PrivacyLockToggle
                  isPrivate={value}
                  onChange={onChange}
                  className="flex-shrink-0"
                />
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VetDetailsPage;

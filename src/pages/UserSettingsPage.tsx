import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, User, Phone, Camera, Loader2, Save, Globe, Upload, CheckCircle, XCircle, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadProfileImage, testStorageConnection } from '@/lib/supabase/storage';
import { updateUserByUid, getUserFromFirestore } from '@/lib/supabase/database/users';
import LocationAutocompleteComboSelect from '@/components/get-started/ui/LocationAutocompleteSelector';
import DeletionVerificationPage from '@/components/auth/DeletionVerificationPage';
import Navbar from '@/components/layout/Navbar';
import BottomNavigation from '@/components/layout/BottomNavigation';

const ProfileContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const locale = i18n.language || 'en';
  const { user, dbUser, loading: authLoading, sendDeletionVerificationCode, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ progress: number; status: string; downloadURL?: string; error?: string } | null>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeletionVerification, setShowDeletionVerification] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    profileImage: null as File | null,
    profileImageURL: '',
    language: locale
  });

  // Available languages
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'he', name: 'עברית', flag: '🇮🇱' }
  ];

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Initialize form data when user loads
  useEffect(() => {
    if (user && dbUser) {
      setFormData(prev => ({
        ...prev,
        fullName: dbUser.display_name || dbUser.full_name || '',
        phone: dbUser.phone || '',
        address: dbUser.address || '',
        profileImageURL: dbUser.photoURL || dbUser?.photoURL || '',
        language: locale
      }));
    } else if (user && !dbUser) {
      const fullName = dbUser?.full_name || dbUser?.name || user.email?.split('@')[0] || '';
      const avatarUrl = dbUser?.photoURL || dbUser?.photoURL || '';

      setFormData(prev => ({
        ...prev,
        fullName: fullName,
        phone: '',
        address: '',
        profileImageURL: avatarUrl,
        language: locale
      }));
    }
  }, [user, dbUser, locale]);

  // Update language when locale changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      language: locale
    }));
  }, [locale]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        profileImage: file
      }));

      const storageTest = await testStorageConnection();
      if (!storageTest) {
        toast.error('Storage connection failed');
        return;
      }

      setUploading(true);
      setUploadProgress({ progress: 0, status: 'uploading' });

      try {
        const result = await uploadProfileImage(file, user.uid);

        // uploadProfileImage in chapiz-react returns string (publicUrl) directly
        if (result) {
          setUploadProgress({ progress: 100, status: 'completed', downloadURL: result });
          setFormData(prev => ({
            ...prev,
            profileImageURL: result
          }));

          if (dbUser?.uid) {
            await updateUserByUid(dbUser.uid, {
              profileImage: result
            });
          }

          toast.success(t('pages.UserSettingsPage.imageUploaded') || 'Profile image uploaded successfully!');
        } else {
          setUploadProgress({ progress: 0, status: 'error', error: 'Upload failed' });
          toast.error('Failed to upload image');
        }
      } catch (error: any) {
        console.error('Upload error:', error);
        toast.error('Failed to upload image');
        setUploadProgress({ progress: 0, status: 'error', error: error.message });
      } finally {
        setUploading(false);
        setTimeout(() => {
          setUploadProgress(null);
        }, 2000);
      }
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    try {
      setFormData(prev => ({
        ...prev,
        language: newLanguage
      }));

      i18n.changeLanguage(newLanguage);

      if (typeof window !== 'undefined') {
        localStorage.setItem('i18nextLng', newLanguage);
      }

      toast.success(t('pages.UserSettingsPage.languageUpdated') || 'Language updated');
    } catch (error) {
      console.error('Error changing language:', error);
      toast.error('Failed to change language');
    }
  };

  const handleSave = async (showToast: boolean = true) => {
    setSaving(true);
    try {
      if (!user || !dbUser) {
        toast.error('User not authenticated');
        return;
      }

      if (!dbUser.uid) {
        toast.error('User ID not available - please sign in again');
        return;
      }

      const updateData: any = {
        language: formData.language
      };

      if (formData.fullName) {
        updateData.displayName = formData.fullName;
      }

      if (formData.phone) {
        updateData.phone = formData.phone;
      }

      if (formData.address) {
        updateData.address = formData.address;
      }

      if (formData.profileImageURL) {
        updateData.profileImage = formData.profileImageURL;
      }

      const userResult = await updateUserByUid(dbUser.uid, updateData);

      if (!userResult.success) {
        if (showToast) {
          toast.error(t('pages.UserSettingsPage.saveFailed') || 'Failed to save');
        }
      } else {
        if (showToast) {
          toast.success(t('pages.UserSettingsPage.saveSuccess') || 'Profile updated successfully!');
        }

        const reloadResult = await getUserFromFirestore(dbUser.uid);
        if (reloadResult.success && reloadResult.user) {
          const u = reloadResult.user;
          setFormData(prev => ({
            ...prev,
            fullName: u.display_name || u.full_name || '',
            phone: u.phone || '',
            address: u.address || '',
            profileImageURL: u.photoURL || u.profile_image || '',
            language: locale
          }));
        }
      }

    } catch (error) {
      console.error('Error saving profile:', error);
      if (showToast) {
        toast.error('Failed to save profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/pages/my-pets');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setDeletingAccount(true);
    try {
      const userName = dbUser?.display_name || dbUser?.full_name || dbUser?.full_name || 'User';
      const result = await sendDeletionVerificationCode(user.email!, userName);

      if (result.success) {
        toast.success(t('pages.UserSettingsPage.deleteAccount.codeSent') || 'Verification code sent to your email');
        setShowDeletionVerification(true);
      } else {
        toast.error(result.message || 'Failed to send verification code');
      }
    } catch (error: any) {
      console.error('Error sending deletion verification code:', error);
      toast.error('Failed to send verification code. Please try again.');
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleVerifiedDeletion = async () => {
    toast.error('Account deletion is temporarily unavailable. Please contact support.');
    setShowDeletionVerification(false);
  };

  if (authLoading) {
    return (
      <div className="flex grow flex-col h-[calc(100vh-64px)] pb-16 md:pb-0 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-gray-500">{t('pages.UserSettingsPage.loading') || 'Loading...'}</p>
      </div>
    );
  }

  if (!user) return null;

  if (showDeletionVerification) {
    const userName = dbUser?.display_name || dbUser?.full_name || dbUser?.full_name || 'User';
    return (
      <div className="flex grow flex-col pb-16 md:pb-0">
        <DeletionVerificationPage
          email={user.email!}
          userName={userName}
          onVerified={handleVerifiedDeletion}
          onBack={() => setShowDeletionVerification(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex grow flex-col pb-16 md:pb-0 overflow-y-auto bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pt-8 md:pt-12">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleBack} className="p-2">
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {t('pages.UserSettingsPage.title')}
                </h1>
                <p className="text-gray-600">
                  {t('pages.UserSettingsPage.subtitle')}
                </p>
              </div>
            </div>

            <div className="flex justify-end md:justify-start">
              <Button onClick={() => handleSave()} disabled={saving} className="bg-primary hover:bg-primary/90 text-white px-8">
                {saving ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('pages.UserSettingsPage.saving')}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    <span>{t('pages.UserSettingsPage.saveChanges')}</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Image Section */}
        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="h-5 w-5" />
              {t('pages.UserSettingsPage.profileImage')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-primary rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                  {formData.profileImage ? (
                    <img src={URL.createObjectURL(formData.profileImage)} alt="Profile" className="w-full h-full object-cover" />
                  ) : formData.profileImageURL ? (
                    <img src={formData.profileImageURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 md:h-12 md:w-12 text-white" />
                  )}
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Label htmlFor="profile-image" className="cursor-pointer">
                  <div className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium">
                    {uploading ? <Upload className="h-4 w-4 animate-pulse" /> : <Camera className="h-4 w-4" />}
                    {uploading ? t('pages.UserSettingsPage.uploading') : t('pages.UserSettingsPage.uploadImage')}
                  </div>
                </Label>
                <input id="profile-image" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                <p className="text-xs text-gray-500 mt-1">
                  {t('pages.UserSettingsPage.imageRequirements')}
                </p>

                {uploadProgress && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">
                        {uploadProgress.status === 'uploading' && t('pages.UserSettingsPage.uploading')}
                        {uploadProgress.status === 'completed' && 'Upload completed!'}
                        {uploadProgress.status === 'error' && 'Upload failed'}
                      </span>
                      <span className="text-gray-500">{uploadProgress.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${uploadProgress.status === 'completed' ? 'bg-green-500' : uploadProgress.status === 'error' ? 'bg-red-500' : 'bg-primary'
                          }`}
                        style={{ width: `${uploadProgress.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              {t('pages.UserSettingsPage.personalInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('pages.UserSettingsPage.fullName')}</Label>
              <Input id="fullName" value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} placeholder={t('pages.UserSettingsPage.fullNamePlaceholder')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t('pages.UserSettingsPage.phoneNumber')}</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="phone" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder={t('pages.UserSettingsPage.phonePlaceholder')} className="pl-10" />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <LocationAutocompleteComboSelect
                label={t('pages.UserSettingsPage.address')}
                id="address"
                value={formData.address}
                onChange={(value) => handleInputChange('address', value)}
                hasError={false}
              />
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5" />
              {t('pages.UserSettingsPage.languageSettings')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="language">{t('pages.UserSettingsPage.preferredLanguage')}</Label>
              <Select value={formData.language} onValueChange={handleLanguageChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('pages.UserSettingsPage.selectLanguage')} />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {t('pages.UserSettingsPage.languageDescription')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Delete Account */}
        <div className="flex justify-center md:justify-start">
          <Button variant="ghost" onClick={handleDeleteAccount} disabled={deletingAccount} className="text-gray-400 hover:text-red-500 hover:bg-transparent text-sm h-auto p-0 font-normal">
            {deletingAccount ? t('pages.UserSettingsPage.deleteAccount.deleting') : t('pages.UserSettingsPage.deleteAccount.button')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function UserSettingsPage() {
  return (
    <>
      <div className="hidden md:block">
        <Navbar />
      </div>
      <ProfileContent />
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </>
  );
}

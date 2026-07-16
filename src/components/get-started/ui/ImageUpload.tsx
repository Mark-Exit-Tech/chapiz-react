'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { uploadPetImage } from '@/lib/firebase/storage';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { useLocale } from '@/hooks/use-locale';
import { ArrowLeftRight, Upload, X } from 'lucide-react';
// Image removed;
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';

// Assets - using public paths
const assets = {
  upload_figures: '/assets/upload_figures.png'
};

interface Props {
  label: string;
  folder: string;
  onFileChange: (filePath: string) => void;
  value?: string;
  required?: boolean;
  error?: string;
}

const ImageUpload = ({
  label,
  folder,
  onFileChange,
  value,
  required = false,
  error,
  ...props
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const { user, dbUser } = useAuth();
  const locale = useLocale();
  const isHebrew = locale === 'he';

  const text = {
    pleaseLogin: isHebrew ? 'אנא התחברו כדי להעלות תמונות' : 'Please log in to upload images',
    invalidFile: isHebrew ? 'אנא בחרו קובץ תמונה תקין' : 'Please select a valid image file',
    sizeLimit: isHebrew ? 'גודל התמונה חייב להיות פחות מ-10MB' : 'Image size must be less than 10MB',
    uploadSuccess: isHebrew ? 'התמונה הועלתה בהצלחה' : 'Image uploaded successfully',
    uploadFailed: isHebrew ? 'ההעלאה נכשלה. אנא נסו שוב.' : 'Upload failed. Please try again.',
    uploading: isHebrew ? 'מעלה...' : 'Uploading...',
    replace: isHebrew ? 'החלף' : 'Replace',
    remove: isHebrew ? 'הסר' : 'Remove',
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user) {
      toast.error(text.pleaseLogin);
      return;
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error(text.invalidFile);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(text.sizeLimit);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadPetImage(file, user.uid);

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success && result.downloadURL) {
        onFileChange(result.downloadURL);
        toast.success(text.uploadSuccess);
      } else {
        toast.error(result.error || text.uploadFailed);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(text.uploadFailed);
    } finally {
      setUploading(false);
      setProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    onFileChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <Card
        className={`${value ? 'h-auto' : 'h-15'} w-full overflow-visible rounded-lg border-none bg-transparent shadow-none`}
      >
        <CardContent className="p-0">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />

          {value ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              {/* Image */}
              <img
                alt="Uploaded pet image"
                src={value}
                className="h-full w-full rounded-lg object-cover"
              />

              {/* Action buttons */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black/35 opacity-100 transition-opacity sm:opacity-0 sm:hover:opacity-100">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-primary text-white hover:bg-primary/90"
                  onClick={(e) => {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }}
                  disabled={uploading}
                >
                  <ArrowLeftRight className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
                  {text.replace}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-red-500 text-white hover:bg-red-600"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveImage();
                  }}
                  disabled={uploading}
                >
                  <X className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
                  {text.remove}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="relative h-15 w-full rounded-[8px] border-0 bg-[#FBCDD0]"
              onClick={(e) => {
                e.preventDefault();
                fileInputRef.current?.click();
              }}
              disabled={uploading}
            >
              <span className="w-1/2 text-base font-medium ltr:mr-auto ltr:pl-3 ltr:text-left rtl:ml-auto rtl:pr-3 rtl:text-right">
                {uploading ? text.uploading : label}
              </span>
              <img
                src={assets.upload_figures}
                alt="figure"
                className="pointer-events-none absolute -top-9 h-28 w-32 object-contain ltr:right-2 ltr:left-auto rtl:right-auto rtl:left-2 sm:-top-11 sm:h-32 sm:w-40 sm:ltr:right-6 sm:rtl:left-6"
              />
            </Button>
          )}
        </CardContent>

        {/* Progress bar */}
        {progress > 0 && progress < 100 && (
          <Progress className="[&>*]:bg-primary" value={progress} />
        )}
      </Card>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

    </div>
  );
};

export default ImageUpload;

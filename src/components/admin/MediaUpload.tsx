'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FileUp, Image as ImageIcon, Video, X, Edit } from 'lucide-react';
import { uploadAdMedia, deleteAdMedia } from '@/lib/firebase/storage';
import { validateImageFile, AD_MEDIA_MAX_SIZE_BYTES } from '@/lib/validation/image';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ImageEditor from './ImageEditor';
import { convertToWebPOptimized } from '@/lib/utils/image-conversion';

interface MediaUploadProps {
  type: 'image' | 'video';
  value?: string;
  onChange: (filePath: string) => void;
  className?: string;
}

export default function MediaUpload({
  type,
  value,
  onChange,
  className = ''
}: MediaUploadProps) {
  const { t } = useTranslation('pages.Admin.mediaUpload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  
  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';
  
  // HARDCODED TEXT
  const text = {
    uploading: isHebrew ? 'מעלה' : 'Uploading',
    clickToUploadImage: isHebrew ? 'לחץ להעלאת תמונה' : 'Click to upload image',
    clickToUploadVideo: isHebrew ? 'לחץ להעלאת וידאו' : 'Click to upload video',
    imageFormats: isHebrew ? 'PNG, JPG, GIF, WebP עד 20MB' : 'PNG, JPG, GIF, WebP up to 20MB',
    videoFormats: isHebrew ? 'MP4, MOV, AVI עד 100MB' : 'MP4, MOV, AVI up to 100MB',
    errorType: isHebrew ? 'פורמט לא נתמך. רק JPG, PNG, GIF, WebP' : 'Invalid format. Only JPG, PNG, GIF, WebP',
    errorSize: isHebrew ? 'הקובץ גדול מדי. מקסימום 20MB' : 'File too large. Maximum 20MB',
    errorVideoType: isHebrew ? 'יש להעלות קובץ וידאו' : 'Please upload a video file',
    errorVideoSize: isHebrew ? 'קובץ גדול מדי. מקסימום 100MB' : 'File too large. Maximum 100MB',
  };

  const validateFile = (file: File): boolean => {
    if (type === 'image') {
      const result = validateImageFile(file, {
        maxSizeBytes: AD_MEDIA_MAX_SIZE_BYTES,
        errors: {
          noFile: text.errorType,
          type: text.errorType,
          size: text.errorSize,
        },
      });
      if (!result.valid) {
        toast.error(result.error);
        return false;
      }
      return true;
    }

    // Video validation
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(text.errorVideoSize);
      return false;
    }
    if (!file.type.startsWith('video/')) {
      toast.error(text.errorVideoType);
      return false;
    }
    return true;
  };

  const uploadFile = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    setProgress(0); // Firebase storage upload progress tracking

    try {
      // Convert image to WebP if it's an image
      let fileToUpload = file;
      if (type === 'image' && file.type.startsWith('image/') && file.type !== 'image/webp') {
        try {
          console.log('🔄 Converting image to WebP...');
          fileToUpload = await convertToWebPOptimized(file, undefined, 1920, 1920);
          console.log('✅ Image converted to WebP', {
            originalSize: file.size,
            newSize: fileToUpload.size,
            reduction: `${((1 - fileToUpload.size / file.size) * 100).toFixed(1)}%`
          });
        } catch (error) {
          console.warn('⚠️ Failed to convert to WebP, using original file:', error);
          // Continue with original file if conversion fails
        }
      }

      // Progress updates for UX
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const result = await uploadAdMedia(fileToUpload, 'ad-media');

      clearInterval(interval);
      setProgress(100);
      
      if (result.success && result.downloadURL) {
        onChange(result.downloadURL);
        toast.success(`${type} uploaded successfully`);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
      
      setIsUploading(false);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
      setIsUploading(false);
      onChange('');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
    // Reset input value to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const isValidUrl = (urlString: string): boolean => {
    if (!urlString || urlString.trim() === '') return false;
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleRemoveFile = async () => {
    if (!value || !isValidUrl(value)) {
      // If no valid URL, just clear the value
      onChange('');
      return;
    }

    try {
      await deleteAdMedia(value);
      onChange('');
      toast.success('File removed successfully');
    } catch (error: any) {
      console.error('Error removing file:', error);
      // Even if delete fails (e.g. file doesn't exist), clear the UI
      onChange('');
    }
  };

  const handleImageError = () => {
    // If image fails to load, clear the value
    // onChange(''); // Optional: maybe don't auto-clear to avoid flickering if temporary
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={type === 'image' ? 'image/jpeg,image/jpg,image/png,image/gif,image/webp' : 'video/*'}
        onChange={handleFileChange}
        className="hidden"
      />

      {value && isValidUrl(value) ? (
        <Card className="relative overflow-hidden">
          <CardContent className="p-2">
            <div className="relative w-full overflow-hidden rounded-md">
              {type === 'image' ? (
                <img
                  src={value}
                  alt="Advertisement image"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                  onError={handleImageError}
                />
              ) : (
                <video
                  src={value}
                  controls
                  className="h-full w-full"
                  onError={handleImageError}
                />
              )}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0"
                onClick={handleRemoveFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 flex gap-2">
              {type === 'image' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setIsEditorOpen(true)}
                  disabled={isUploading}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="h-24 w-full border-dashed"
          onClick={handleUploadClick}
          disabled={isUploading}
        >
          <div className="flex flex-col items-center justify-center">
            {type === 'image' ? (
              <ImageIcon className="text-muted-foreground mb-1 h-6 w-6" />
            ) : (
              <Video className="text-muted-foreground mb-1 h-6 w-6" />
            )}
            <span className="text-xs font-medium">
              {isUploading
                ? text.uploading
                : (type === 'image' ? text.clickToUploadImage : text.clickToUploadVideo)}
            </span>
            <span className="text-muted-foreground mt-0.5 text-[10px]">
              {type === 'image' ? text.imageFormats : text.videoFormats}
            </span>
          </div>
        </Button>
      )}

      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileUp className="h-4 w-4 animate-pulse" />
            <span className="text-sm">{text.uploading} {type}...</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Image Editor */}
      {type === 'image' && value && isValidUrl(value) && (
        <ImageEditor
          imageUrl={value}
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditedImageUrl(null);
          }}
          onSave={async (editedDataUrl) => {
            try {
              // Convert data URL to blob
              const response = await fetch(editedDataUrl);
              const blob = await response.blob();

              // Create a file from blob (will be converted to WebP in uploadFile)
              const file = new File([blob], 'edited-image.png', { type: 'image/png' });

              // Upload the edited image (will be converted to WebP)
              // But first clear current value so it shows uploading state
              onChange('');
              await uploadFile(file);

              setEditedImageUrl(null);
              setIsEditorOpen(false);
            } catch (error: any) {
              console.error('Error saving edited image:', error);
              toast.error('Failed to save edited image');
            }
          }}
        />
      )}
    </div>
  );
}

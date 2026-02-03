/**
 * Shared image validation for admin panel uploads.
 * Use for all image inputs (logo, coupons, vouchers, promos, businesses, ads).
 */

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

/** Default max size 10MB for most admin images */
export const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024;

/** 20MB for ad media (used by MediaUpload) */
export const AD_MEDIA_MAX_SIZE_BYTES = 20 * 1024 * 1024;

export interface ValidateImageResult {
  valid: boolean;
  error?: string;
}

export interface ValidateImageOptions {
  /** Max file size in bytes. Default: 10MB */
  maxSizeBytes?: number;
  /** Custom error messages (optional, for i18n) */
  errors?: {
    noFile?: string;
    type?: string;
    size?: string;
  };
}

/**
 * Validates an image file for admin uploads.
 * Checks: file exists, allowed MIME type, max size.
 */
export function validateImageFile(
  file: File | null | undefined,
  options: ValidateImageOptions = {}
): ValidateImageResult {
  const {
    maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
    errors: customErrors = {},
  } = options;

  const defaultErrors = {
    noFile: 'Please select an image file',
    type: `Allowed formats: JPG, PNG, GIF, WebP (max ${Math.round(maxSizeBytes / (1024 * 1024))}MB)`,
    size: `Image is too large. Maximum size is ${Math.round(maxSizeBytes / (1024 * 1024))}MB`,
  };

  const msg = { ...defaultErrors, ...customErrors };

  if (!file) {
    return { valid: false, error: msg.noFile };
  }

  const type = file.type?.toLowerCase();
  if (!type || !ALLOWED_IMAGE_TYPES.includes(type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return { valid: false, error: msg.type };
  }

  if (file.size > maxSizeBytes) {
    return { valid: false, error: msg.size };
  }

  return { valid: true };
}

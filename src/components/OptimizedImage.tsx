import React, { ImgHTMLAttributes } from 'react';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** The base path without extension (e.g., '/pets/bunny') */
  src: string;
  /** Alternative text */
  alt: string;
  /** Priority loading: 'auto' | 'lazy' | 'eager' */
  priority?: boolean;
  /** Width for responsive images */
  width?: number;
  /** Height for responsive images */
  height?: number;
  /** Class names */
  className?: string;
}

/**
 * OptimizedImage component - serves AVIF with WebP and PNG fallbacks
 * 
 * Usage:
 * <OptimizedImage src="/pets/bunny" alt="bunny" width={140} height={140} />
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  priority = false,
  width,
  height,
  className = '',
  ...props
}) => {
  const loading = priority ? 'eager' : 'lazy';
  const decoding = priority ? 'sync' : 'async';

  return (
    <picture>
      {/* WebP format - excellent compression with transparency support */}
      <source
        srcSet={`${src}.webp`}
        type="image/webp"
      />
      
      {/* PNG fallback for maximum compatibility */}
      <img
        src={`${src}.png`}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={loading}
        decoding={decoding}
        {...props}
      />
    </picture>
  );
};

export default OptimizedImage;

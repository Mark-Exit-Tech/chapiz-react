import type { SyntheticEvent } from 'react';

// Inline placeholder shown when a remote image URL fails to load (e.g. expired
// Google Maps CDN links on scraped businesses). Data URI = no network needed.
const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" fill="#f3f4f6"/><rect x="3" y="5" width="18" height="14" rx="2" stroke="#9ca3af" stroke-width="1.5"/><circle cx="8.5" cy="9.5" r="1.5" fill="#9ca3af"/><path d="M21 16l-5-5L5 19" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export const FALLBACK_IMAGE = `data:image/svg+xml,${encodeURIComponent(PLACEHOLDER_SVG)}`;

export function onImageError(e: SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.dataset.fallbackApplied === 'true') return;
  img.dataset.fallbackApplied = 'true';
  img.src = FALLBACK_IMAGE;
}

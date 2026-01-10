import { lazy, Suspense } from 'react';

// Lazy load MenuShareButton which depends on react-share (heavy)
const MenuShareButton = lazy(() => import('./MenuShareButton'));

export default function MenuShareButtonLazy() {
  // Show nothing while loading - keeps initial bundle light
  return (
    <Suspense fallback={null}>
      <MenuShareButton />
    </Suspense>
  );
}

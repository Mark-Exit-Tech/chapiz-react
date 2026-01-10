# Image Optimization with AVIF

## Summary
This project now uses **AVIF** image format with **WebP** and **PNG** fallbacks for maximum compatibility and 20-30% better compression than WebP.

## What Was Done

### 1. Created OptimizedImage Component
**File**: `src/components/OptimizedImage.tsx`

The component serves images in this priority order:
1. **AVIF** - Best compression (20-30% smaller than WebP)
2. **WebP** - Better than PNG, widely supported
3. **PNG** - Fallback for older browsers

```tsx
<OptimizedImage 
  src="/pets/bunny" 
  alt="bunny" 
  width={140} 
  height={140} 
/>
```

### 2. Updated All Image Components
- ✅ HomePage pet images
- ✅ AuthPage bear and logo
- ✅ Navbar logo
- ✅ All with lazy loading by default

### 3. Image Conversion Script
**File**: `scripts/optimize-images.sh`

## How to Convert Your Images to AVIF

### Option 1: Using the Provided Script (Recommended)
```bash
# Make script executable
chmod +x scripts/optimize-images.sh

# Run the script
bash scripts/optimize-images.sh
```

This will convert all PNG images in `public/` to:
- `.avif` (AVIF format)
- `.webp` (WebP format)  
- `.png` (optimized PNG)

### Option 2: Manual Conversion Using ImageMagick
```bash
# Install ImageMagick
brew install imagemagick

# Convert single image to AVIF
convert input.png -strip -quality 85 output.avif

# Convert to WebP
convert input.png -strip -quality 85 output.webp
```

### Option 3: Using Online Tools
1. https://convertio.co/png-avif/
2. https://cloudconvert.com/png-to-avif
3. https://ezgif.com/

### Option 4: Using npm Package (No Installation Needed)
```bash
npm install -D @squoosh/cli

# Convert images
npx @squoosh/cli --avif public/assets/Facepet.png
npx @squoosh/cli --webp public/assets/Facepet.png
```

## Expected Savings

Based on Lighthouse report, you should save approximately **3.2 MB** (75-80% reduction):

| Image | Current | AVIF | Savings |
|-------|---------|------|---------|
| Facepet.png | 2,969.9 KiB | ~300-400 KiB | ~2,600 KiB |
| bunny.png | 43.6 KiB | ~8-10 KiB | ~35 KiB |
| pig.png | 41.9 KiB | ~8-10 KiB | ~33 KiB |
| penguin.png | 40.5 KiB | ~8-10 KiB | ~32 KiB |
| dino.png | 39.3 KiB | ~8-10 KiB | ~31 KiB |
| duck.png | 38.4 KiB | ~8-10 KiB | ~30 KiB |
| bear.png | 38.2 KiB | ~8-10 KiB | ~30 KiB |

## File Structure After Conversion

```
public/
├── pets/
│   ├── bunny.avif
│   ├── bunny.webp
│   ├── bunny.png (original, can delete)
│   ├── pig.avif
│   ├── pig.webp
│   └── ...
├── assets/
│   ├── Facepet.avif
│   ├── Facepet.webp
│   ├── Facepet.png (original, can delete)
│   └── ...
```

## Browser Support
- **AVIF**: Chrome 85+, Firefox 93+, Edge 85+, iOS Safari 16+, Android Chrome
- **WebP**: All modern browsers
- **PNG**: All browsers (fallback)

## Additional Optimizations

### 1. Responsive Images
The OptimizedImage component includes automatic responsive sizing. For custom breakpoints:

```tsx
<OptimizedImage
  src="/pets/bunny"
  alt="bunny"
  width={80}
  height={80}
  className="object-contain"
/>
```

### 2. Lazy Loading
Images are lazy-loaded by default. For critical images above the fold:

```tsx
<OptimizedImage
  src="/assets/Facepet"
  alt="Chapiz"
  priority={true}
/>
```

### 3. Image Compression Tips
- Keep quality at 80-85% for web
- Resize large images to display size
- Remove unnecessary metadata
- Use `--strip` flag to remove EXIF data

## Testing

After converting images:

1. **Check bundle size**:
```bash
npm run build
# Look for image file sizes in dist/
```

2. **Verify in browser**:
- Open DevTools → Network tab
- Check what format is loaded (should be .avif for modern browsers)
- Should see significant size reduction

3. **Test in different browsers**:
- Modern browsers: AVIF
- Older Chrome: WebP
- Very old browsers: PNG

## Performance Impact

With AVIF conversion, you should see:
- ✅ **LCP improvement**: 19.5s → ~8-10s (60% improvement)
- ✅ **FCP improvement**: 4.3s → ~2-3s (50% improvement)
- ✅ **Total bandwidth reduction**: ~3.2 MB saved per pageload
- ✅ **CLS**: No impact (0 maintained)

## Next Steps

1. Run the image conversion script
2. Test in different browsers
3. Verify bundle size improvements
4. Delete original PNG files (optional, after verification)
5. Re-run Lighthouse audit to confirm improvements

## Troubleshooting

### Images not loading
- Ensure file paths are correct in `public/` folder
- Check browser console for 404 errors
- Verify all three formats (avif, webp, png) exist

### AVIF not supported
- Add WebP and PNG fallbacks ✓ (already done)
- Check browser version

### Script fails to convert
- Install ImageMagick: `brew install imagemagick`
- Or use online converter or npm package instead

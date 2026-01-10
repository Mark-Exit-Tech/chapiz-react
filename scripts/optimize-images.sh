#!/bin/bash

# Image optimization script for AVIF conversion
# Install required tools: brew install imagemagick
# Or use: npm install -D @squoosh/cli

echo "Converting images to AVIF, WebP, and optimized PNG..."

# Create optimized directories
mkdir -p public/pets-optimized
mkdir -p public/assets-optimized

# Install imagemagick if not present
if ! command -v convert &> /dev/null; then
    echo "Installing ImageMagick..."
    brew install imagemagick
fi

# Function to convert image to multiple formats
convert_image() {
    input=$1
    output_base=$2
    
    echo "Converting $input..."
    
    # AVIF format (best compression)
    convert "$input" -strip -quality 85 \
        -resize "1024x1024>" \
        "${output_base}.avif" 2>/dev/null || echo "AVIF conversion failed for $input"
    
    # WebP format (fallback)
    convert "$input" -strip -quality 85 \
        -resize "1024x1024>" \
        "${output_base}.webp" 2>/dev/null || echo "WebP conversion failed for $input"
    
    # Optimized PNG
    convert "$input" -strip -quality 85 \
        -resize "1024x1024>" \
        "${output_base}.png" 2>/dev/null || echo "PNG optimization failed for $input"
    
    echo "✓ Converted: $input"
}

# Convert pet images
for pet in public/pets/*.png; do
    if [ -f "$pet" ]; then
        basename=$(basename "$pet" .png)
        convert_image "$pet" "public/pets-optimized/$basename"
    fi
done

# Convert Facepet logo
if [ -f "public/assets/Facepet.png" ]; then
    convert_image "public/assets/Facepet.png" "public/assets-optimized/Facepet"
fi

# Find and optimize other PNGs
for img in public/assets/*.png; do
    if [ -f "$img" ]; then
        basename=$(basename "$img" .png)
        convert_image "$img" "public/assets-optimized/$basename"
    fi
done

echo ""
echo "✓ Image conversion complete!"
echo ""
echo "Updated file structure:"
ls -lh public/pets-optimized/ 2>/dev/null | tail -n +2
ls -lh public/assets-optimized/ 2>/dev/null | tail -n +2

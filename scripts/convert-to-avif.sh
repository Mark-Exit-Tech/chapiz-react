#!/bin/bash

# Convert PNG images to AVIF format using ffmpeg
# Usage: ./scripts/convert-to-avif.sh

echo "🖼️  Converting images to AVIF format..."
echo ""

# Function to convert a single image
convert_to_avif() {
  local input="$1"
  local output="${input%.png}.avif"
  
  # Skip if AVIF already exists
  if [ -f "$output" ]; then
    echo "⏭️  Skipping (exists): $output"
    return
  fi
  
  echo "🔄 Converting: $input → $output"
  
  # Convert with ffmpeg (quality 80, faster encoding)
  if ffmpeg -i "$input" -c:v libaom-av1 -crf 30 -b:v 0 "$output" -y -loglevel error 2>/dev/null; then
    echo "✅ Converted: $output"
  else
    echo "❌ Failed: $input"
  fi
}

# Directories to process
DIRS=(
  "public/pets"
  "public/assets"
  "public/icons"
  "public/static"
)

# Process each directory
for dir in "${DIRS[@]}"; do
  if [ ! -d "$dir" ]; then
    echo "⚠️  Directory not found: $dir"
    continue
  fi
  
  echo ""
  echo "📁 Processing: $dir"
  echo "─────────────────────────────────────"
  
  # Find all PNG files and convert them
  find "$dir" -maxdepth 1 -type f -name "*.png" | while read -r file; do
    convert_to_avif "$file"
  done
done

echo ""
echo "✅ Conversion complete!"
echo ""
echo "📊 Summary:"
echo "─────────────────────────────────────"
find public -name "*.avif" | wc -l | xargs echo "AVIF files created:"
find public -name "*.png" | wc -l | xargs echo "PNG files total:"
find public -name "*.webp" | wc -l | xargs echo "WebP files total:"

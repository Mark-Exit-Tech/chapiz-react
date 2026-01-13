#!/bin/bash

# Convert PNG images to AVIF format WITH ALPHA CHANNEL support
# Usage: ./scripts/convert-to-avif-alpha.sh

echo "🖼️  Converting images to AVIF with transparency support..."
echo ""

# Function to convert a single image with alpha channel
convert_to_avif_with_alpha() {
  local input="$1"
  local output="${input%.png}.avif"
  
  # Skip if AVIF already exists
  if [ -f "$output" ]; then
    echo "⏭️  Skipping (exists): $output"
    return
  fi
  
  echo "🔄 Converting: $(basename "$input") → $(basename "$output")"
  
  # Convert with ffmpeg - preserve alpha channel with pix_fmt yuva420p
  if ffmpeg -i "$input" -c:v libaom-av1 -pix_fmt yuva420p -crf 32 -b:v 0 "$output" -y -loglevel error 2>/dev/null; then
    local size_before=$(du -h "$input" | cut -f1)
    local size_after=$(du -h "$output" | cut -f1)
    echo "   ✅ $size_before → $size_after"
  else
    echo "   ❌ Failed"
  fi
}

# Directories to process
DIRS=(
  "public/pets"
  "public/assets"
  "public/icons"
)

# Process each directory
for dir in "${DIRS[@]}"; do
  if [ ! -d "$dir" ]; then
    continue
  fi
  
  echo ""
  echo "📁 Processing: $dir"
  echo "─────────────────────────────────────"
  
  # Find all PNG files and convert them
  find "$dir" -maxdepth 1 -type f -name "*.png" | while read -r file; do
    convert_to_avif_with_alpha "$file"
  done
done

echo ""
echo "✅ Conversion complete with transparency preserved!"

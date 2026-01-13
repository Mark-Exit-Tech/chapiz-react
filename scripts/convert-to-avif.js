#!/usr/bin/env node

/**
 * Convert PNG/WebP images to AVIF format
 * Requires: npm install sharp
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const directories = [
  './public/pets',
  './public/assets',
  './public/icons',
  './public/static'
];

async function convertImage(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .avif({ quality: 80, effort: 6 })
      .toFile(outputPath);
    console.log(`✅ Converted: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Failed to convert ${inputPath}:`, error.message);
  }
}

async function convertDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  Directory not found: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const ext = path.extname(file).toLowerCase();
    
    // Only convert PNG files (since WebP is already compressed)
    if (ext === '.png') {
      const baseName = path.basename(file, ext);
      const avifPath = path.join(dir, `${baseName}.avif`);
      
      // Skip if AVIF already exists
      if (fs.existsSync(avifPath)) {
        console.log(`⏭️  Skipping (exists): ${avifPath}`);
        continue;
      }
      
      await convertImage(filePath, avifPath);
    }
  }
}

async function main() {
  console.log('🖼️  Converting images to AVIF format...\n');
  
  // Check if sharp is installed
  try {
    require('sharp');
  } catch (error) {
    console.error('❌ Sharp module not found. Installing...');
    console.log('Run: npm install sharp');
    process.exit(1);
  }
  
  for (const dir of directories) {
    console.log(`\n📁 Processing: ${dir}`);
    await convertDirectory(dir);
  }
  
  console.log('\n✅ Conversion complete!');
}

main();

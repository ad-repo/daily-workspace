#!/usr/bin/env node

/**
 * Generate square icon PNGs for desktop app
 * 
 * Creates square icons at specific sizes needed for desktop app icons.
 * Uses a simplified/centered version of the logo for better visibility at small sizes.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const LOGO_SVG = path.join(__dirname, '../frontend/public/logo.svg');
const ICONS_DIR = path.join(__dirname, '../desktop/tauri/src-tauri/icons');
const TMP_DIR = path.join(__dirname, '../tmp-icons');

// Ensure temp directory exists
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

// Icon sizes needed
const iconSizes = [
  { file: '32x32.png', size: 32 },
  { file: '128x128.png', size: 128 },
  { file: '128x128@2x.png', size: 256 },
  { file: 'icon.png', size: 512 },
  // Windows Store logos
  { file: 'Square30x30Logo.png', size: 30 },
  { file: 'Square44x44Logo.png', size: 44 },
  { file: 'Square71x71Logo.png', size: 71 },
  { file: 'Square89x89Logo.png', size: 89 },
  { file: 'Square107x107Logo.png', size: 107 },
  { file: 'Square142x142Logo.png', size: 142 },
  { file: 'Square150x150Logo.png', size: 150 },
  { file: 'Square284x284Logo.png', size: 284 },
  { file: 'Square310x310Logo.png', size: 310 },
  { file: 'StoreLogo.png', size: 50 },
];

console.log('Generating square icon PNGs...\n');

iconSizes.forEach(icon => {
  const outputPath = path.join(TMP_DIR, icon.file);
  
  // For square icons, we need to crop/fit the logo appropriately
  // The logo is 900x240, so we'll extract just the monitor part (first ~460px width)
  // and make it square by adding padding or cropping
  const cmd = `magick "${LOGO_SVG}" -gravity west -crop 460x240+0+0 +repage -resize ${icon.size}x${icon.size} -background none -gravity center -extent ${icon.size}x${icon.size} "${outputPath}"`;
  
  try {
    execSync(cmd, { stdio: 'ignore' });
    console.log(`✓ Generated: ${icon.file} (${icon.size}x${icon.size})`);
  } catch (err) {
    console.error(`✗ Failed to generate ${icon.file}:`, err.message);
  }
});

console.log(`\n✓ All icon PNGs generated in: ${TMP_DIR}`);
console.log('\nNext step: Copy icons to', ICONS_DIR);
console.log('Command: cp tmp-icons/*.png desktop/tauri/src-tauri/icons/');


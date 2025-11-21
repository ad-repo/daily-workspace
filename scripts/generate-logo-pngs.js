#!/usr/bin/env node

/**
 * Generate PNG logos from SVG at various sizes
 * 
 * This script converts the logo SVG to PNG format at multiple resolutions
 * for use in splash screens, icons, and other assets.
 * 
 * Usage: node scripts/generate-logo-pngs.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SVG_SOURCE = path.join(__dirname, '../frontend/public/logo.svg');
const OUTPUT_DIR = path.join(__dirname, '../tmp-logos');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Define sizes to generate
const sizes = [
  { name: 'logo-32', width: 32, height: 8 },
  { name: 'logo-64', width: 64, height: 16 },
  { name: 'logo-128', width: 128, height: 32 },
  { name: 'logo-256', width: 256, height: 64 },
  { name: 'logo-512', width: 512, height: 128 },
  { name: 'logo-1024', width: 1024, height: 256 },
  { name: 'logo-full', width: 1800, height: 480 },  // 2x resolution
];

console.log('Generating PNG logos from SVG...\n');

// Check if ImageMagick convert is available
try {
  execSync('which convert', { stdio: 'ignore' });
  console.log('Using ImageMagick convert...\n');
  
  sizes.forEach(size => {
    const outputPath = path.join(OUTPUT_DIR, `${size.name}.png`);
    const cmd = `convert -background none -density 300 -resize ${size.width}x${size.height} "${SVG_SOURCE}" "${outputPath}"`;
    
    try {
      execSync(cmd);
      console.log(`✓ Generated: ${size.name}.png (${size.width}x${size.height})`);
    } catch (err) {
      console.error(`✗ Failed to generate ${size.name}.png:`, err.message);
    }
  });
  
} catch (err) {
  console.log('ImageMagick not found. Trying inkscape...\n');
  
  try {
    execSync('which inkscape', { stdio: 'ignore' });
    
    sizes.forEach(size => {
      const outputPath = path.join(OUTPUT_DIR, `${size.name}.png`);
      const cmd = `inkscape "${SVG_SOURCE}" --export-filename="${outputPath}" --export-width=${size.width} --export-height=${size.height}`;
      
      try {
        execSync(cmd, { stdio: 'ignore' });
        console.log(`✓ Generated: ${size.name}.png (${size.width}x${size.height})`);
      } catch (err) {
        console.error(`✗ Failed to generate ${size.name}.png:`, err.message);
      }
    });
    
  } catch (err2) {
    console.error('\n❌ Error: Neither ImageMagick nor Inkscape found!');
    console.error('\nPlease install one of the following:');
    console.error('  - ImageMagick: brew install imagemagick');
    console.error('  - Inkscape: brew install inkscape');
    console.error('\nThen run this script again.');
    process.exit(1);
  }
}

console.log(`\n✓ All PNGs generated in: ${OUTPUT_DIR}`);
console.log('\nNext steps:');
console.log('1. Review the generated PNGs');
console.log('2. Copy them to the appropriate directories');
console.log('3. Use them to generate platform-specific icons');


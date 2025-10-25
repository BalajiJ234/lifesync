const fs = require('fs');
const path = require('path');

// SVG content for the icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f0fdf4;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <rect width="512" height="512" rx="100" fill="url(#bgGradient)"/>
  
  <path d="M 256 80 
           L 160 120 
           L 160 240 
           Q 160 340 256 420 
           Q 352 340 352 240 
           L 352 120 Z" 
        fill="url(#shieldGradient)" 
        stroke="#10b981" 
        stroke-width="4"/>
  
  <g transform="translate(256, 220)">
    <rect x="-35" y="0" width="70" height="80" rx="8" fill="#10b981"/>
    <path d="M -25 0 
             L -25 -30 
             Q -25 -50 0 -50 
             Q 25 -50 25 -30 
             L 25 0" 
          fill="none" 
          stroke="#10b981" 
          stroke-width="12" 
          stroke-linecap="round"/>
    <circle cx="0" cy="30" r="8" fill="#ffffff"/>
    <rect x="-3" y="30" width="6" height="25" rx="3" fill="#ffffff"/>
  </g>
  
  <circle cx="180" cy="360" r="6" fill="#ffffff" opacity="0.6"/>
  <circle cx="210" cy="380" r="6" fill="#ffffff" opacity="0.6"/>
  <circle cx="240" cy="390" r="6" fill="#ffffff" opacity="0.6"/>
  <circle cx="270" cy="390" r="6" fill="#ffffff" opacity="0.6"/>
  <circle cx="300" cy="380" r="6" fill="#ffffff" opacity="0.6"/>
  <circle cx="330" cy="360" r="6" fill="#ffffff" opacity="0.6"/>
</svg>`;

async function generatePNGs() {
  try {
    const sharp = require('sharp');
    
    console.log('Generating 192x192 icon...');
    await sharp(Buffer.from(svgContent))
      .resize(192, 192)
      .png()
      .toFile(path.join(__dirname, 'icon-192x192.png'));
    
    console.log('Generating 512x512 icon...');
    await sharp(Buffer.from(svgContent))
      .resize(512, 512)
      .png()
      .toFile(path.join(__dirname, 'icon-512x512.png'));
    
    console.log('✅ Icons generated successfully!');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('⚠️  Sharp module not found. Installing...');
      console.log('Run: npm install sharp --save-dev');
      console.log('Then run this script again: node generate-pwa-icons.js');
      
      // Alternative: Save as SVG and use online converter
      console.log('\n📝 Alternative: Use the generate-icons.html file in a browser');
      console.log('   Open public/generate-icons.html in Chrome/Edge to download PNGs');
    } else {
      console.error('Error:', error);
    }
  }
}

generatePNGs();

const fs = require('fs');
const path = require('path');

// SVG content for the icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <rect width="512" height="512" rx="115" fill="url(#bgGradient)"/>
  
  <path d="M 256 100 
           L 140 150 
           L 140 260 
           Q 140 350 256 430 
           Q 372 350 372 260 
           L 372 150 Z" 
        fill="white" 
        opacity="0.95"/>
  
  <g transform="translate(256, 270)">
    <path d="M -35 -15 
             L -35 -45 
             Q -35 -70 0 -70 
             Q 35 -70 35 -45 
             L 35 -15" 
          fill="none" 
          stroke="#10b981" 
          stroke-width="18" 
          stroke-linecap="round"/>
    
    <rect x="-50" y="-15" width="100" height="85" rx="12" fill="#10b981"/>
    
    <circle cx="0" cy="15" r="12" fill="white"/>
    <rect x="-5" y="15" width="10" height="30" rx="5" fill="white"/>
  </g>
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

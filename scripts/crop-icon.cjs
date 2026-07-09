// crop-icon.cjs — simple tight crop of logo-3 for favicon, no BG removal
const { Jimp } = require('jimp');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'frontend', 'public');
const logosDir  = path.join(__dirname, '..', 'Logos');

async function main() {
  console.log('Cropping logo-3 to icon...');
  const img = await Jimp.read(path.join(logosDir, 'PraOjas logo 3.jpg'));
  const W = img.bitmap.width;   // 1408
  const H = img.bitmap.height;  // 768
  console.log(`Original: ${W}x${H}`);

  // The PO icon in logo-3 is centered (slightly right-of-center).
  // The image is 1408x768. Icon spans roughly x:380-1020, y:100-680
  // We crop a tight square around it.
  const size = Math.round(H * 0.84); // 645px — full icon height with slight padding
  const cx = Math.round(W * 0.51);   // slightly right of center
  const cy = Math.round(H * 0.50);
  
  const cropX = Math.max(0, cx - Math.round(size / 2));
  const cropY = Math.max(0, cy - Math.round(size / 2));
  const cropW = Math.min(W - cropX, size);
  const cropH = Math.min(H - cropY, size);
  
  img.crop({ x: cropX, y: cropY, w: cropW, h: cropH });
  console.log(`Cropped to: ${img.bitmap.width}x${img.bitmap.height}`);

  // Resize to 512x512 for high-quality favicon
  img.resize({ w: 512, h: 512 });
  await img.write(path.join(publicDir, 'logo-3-icon.jpg'));
  console.log('✅ logo-3-icon.jpg saved (512x512)');
}

main().catch(err => { console.error(err); process.exit(1); });

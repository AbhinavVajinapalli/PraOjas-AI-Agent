import Jimp from 'jimp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'frontend', 'public');
const logosDir = path.join(__dirname, '..', 'Logos');

// ─── Helper: Remove dark/near-black background from an image ───────────────
async function removeBackground(img, bgColorHex, tolerance = 60) {
  const width = img.bitmap.width;
  const height = img.bitmap.height;

  // Parse target BG color
  const bgR = parseInt(bgColorHex.slice(1, 3), 16);
  const bgG = parseInt(bgColorHex.slice(3, 5), 16);
  const bgB = parseInt(bgColorHex.slice(5, 7), 16);

  img.scan(0, 0, width, height, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];

    const dist = Math.sqrt(
      Math.pow(r - bgR, 2) +
      Math.pow(g - bgG, 2) +
      Math.pow(b - bgB, 2)
    );

    if (dist < tolerance) {
      this.bitmap.data[idx + 3] = 0; // transparent
    }
  });
  return img;
}

// ─── Helper: Auto-crop to content bounds ──────────────────────────────────
function getContentBounds(img, alphaThreshold = 10) {
  const width = img.bitmap.width;
  const height = img.bitmap.height;
  let minX = width, minY = height, maxX = 0, maxY = 0;

  img.scan(0, 0, width, height, function(x, y, idx) {
    const a = this.bitmap.data[idx + 3];
    if (a > alphaThreshold) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  });

  return { minX, minY, maxX, maxY };
}

async function main() {
  console.log('Processing logos...\n');

  // ── LOGO 1: Full horizontal lockup (icon + "PraOjas AI" text) ──────────────
  // Source: JPG with dark blue gradient background
  console.log('Processing Logo 1 (horizontal lockup)...');
  const logo1 = await Jimp.read(path.join(logosDir, 'PraOjas logo 1.jpg'));
  
  // The dark navy background is around #0a1628 / #091525
  // Use a flood-fill approach: remove dark navy gradient
  // Logo 1 background is dark navy ~#091525
  await removeBackground(logo1, '#091525', 80);
  // Also remove the dark teal/navy corners
  await removeBackground(logo1, '#0d1d35', 70);
  await removeBackground(logo1, '#0b1929', 75);
  await removeBackground(logo1, '#071221', 70);
  await removeBackground(logo1, '#0e1f38', 70);
  await removeBackground(logo1, '#0c1b31', 70);
  await removeBackground(logo1, '#132338', 65);
  await removeBackground(logo1, '#172b45', 65);
  await removeBackground(logo1, '#1a3050', 60);
  await removeBackground(logo1, '#0f2040', 65);
  await removeBackground(logo1, '#162540', 62);

  const bounds1 = getContentBounds(logo1, 20);
  const pad = 10;
  const cropX1 = Math.max(0, bounds1.minX - pad);
  const cropY1 = Math.max(0, bounds1.minY - pad);
  const cropW1 = Math.min(logo1.bitmap.width - cropX1, bounds1.maxX - bounds1.minX + pad * 2);
  const cropH1 = Math.min(logo1.bitmap.height - cropY1, bounds1.maxY - bounds1.minY + pad * 2);

  logo1.crop({ x: cropX1, y: cropY1, w: cropW1, h: cropH1 });
  await logo1.write(path.join(publicDir, 'logo-1.png'));
  console.log(`  → Logo 1 saved (${cropW1}x${cropH1}px)`);

  // ── LOGO 2: Stacked lockup (icon + "PraOjas AI" text below) ────────────────
  console.log('Processing Logo 2 (stacked lockup)...');
  const logo2 = await Jimp.read(path.join(logosDir, 'PraOjas logo 2.jpg'));
  
  await removeBackground(logo2, '#091525', 80);
  await removeBackground(logo2, '#0d1d35', 70);
  await removeBackground(logo2, '#0b1929', 75);
  await removeBackground(logo2, '#071221', 70);
  await removeBackground(logo2, '#0e1f38', 70);
  await removeBackground(logo2, '#0c1b31', 70);
  await removeBackground(logo2, '#132338', 65);
  await removeBackground(logo2, '#172b45', 65);
  await removeBackground(logo2, '#1a3050', 60);
  await removeBackground(logo2, '#0f2040', 65);
  await removeBackground(logo2, '#162540', 62);

  const bounds2 = getContentBounds(logo2, 20);
  const pad2 = 10;
  const cropX2 = Math.max(0, bounds2.minX - pad2);
  const cropY2 = Math.max(0, bounds2.minY - pad2);
  const cropW2 = Math.min(logo2.bitmap.width - cropX2, bounds2.maxX - bounds2.minX + pad2 * 2);
  const cropH2 = Math.min(logo2.bitmap.height - cropY2, bounds2.maxY - bounds2.minY + pad2 * 2);

  logo2.crop({ x: cropX2, y: cropY2, w: cropW2, h: cropH2 });
  await logo2.write(path.join(publicDir, 'logo-2.png'));
  console.log(`  → Logo 2 saved (${cropW2}x${cropH2}px)`);

  // ── LOGO 3: Icon-only (just the PO symbol, no text) — crop tightly ─────────
  console.log('Processing Logo 3 (icon-only, square crop)...');
  const logo3 = await Jimp.read(path.join(logosDir, 'PraOjas logo 3.jpg'));
  
  const w3 = logo3.bitmap.width;  // 1400
  const h3 = logo3.bitmap.height; // 787
  
  // The icon is roughly centered horizontally (slightly right of center) 
  // and vertically centered. Looking at the original: icon appears from about
  // x=380 to x=920, y=150 to y=620 in the 1400x787 image
  // Let's crop to a square region around the icon
  const iconCenterX = Math.round(w3 * 0.50); // center
  const iconCenterY = Math.round(h3 * 0.50); // center  
  const iconSize = Math.round(h3 * 0.60);    // ~470px square
  
  const cropX3 = Math.max(0, iconCenterX - Math.round(iconSize / 2));
  const cropY3 = Math.max(0, iconCenterY - Math.round(iconSize / 2));
  const cropW3 = Math.min(w3 - cropX3, iconSize);
  const cropH3 = Math.min(h3 - cropY3, iconSize);

  logo3.crop({ x: cropX3, y: cropY3, w: cropW3, h: cropH3 });
  
  // Now remove the dark navy background
  await removeBackground(logo3, '#091525', 80);
  await removeBackground(logo3, '#0d1d35', 70);
  await removeBackground(logo3, '#0b1929', 75);
  await removeBackground(logo3, '#071221', 70);
  await removeBackground(logo3, '#0e1f38', 70);
  await removeBackground(logo3, '#0c1b31', 70);
  await removeBackground(logo3, '#132338', 65);
  await removeBackground(logo3, '#172b45', 65);
  await removeBackground(logo3, '#1a3050', 60);
  await removeBackground(logo3, '#0f2040', 65);
  await removeBackground(logo3, '#162540', 62);
  await removeBackground(logo3, '#1c2e4a', 58);
  await removeBackground(logo3, '#0a1828', 75);

  // Auto-crop to tight bounds
  const bounds3 = getContentBounds(logo3, 15);
  const pad3 = 15;
  const finalX = Math.max(0, bounds3.minX - pad3);
  const finalY = Math.max(0, bounds3.minY - pad3);
  const finalW = Math.min(logo3.bitmap.width - finalX, bounds3.maxX - bounds3.minX + pad3 * 2);
  const finalH = Math.min(logo3.bitmap.height - finalY, bounds3.maxY - bounds3.minY + pad3 * 2);

  logo3.crop({ x: finalX, y: finalY, w: finalW, h: finalH });

  // Resize to square 512x512 for a proper icon
  const squareSize = Math.max(finalW, finalH);
  // Make it square with transparent padding
  const squareImg = new Jimp({ width: squareSize, height: squareSize, color: 0x00000000 });
  const offsetX = Math.round((squareSize - finalW) / 2);
  const offsetY = Math.round((squareSize - finalH) / 2);
  squareImg.composite(logo3, offsetX, offsetY);
  squareImg.resize({ w: 512, h: 512 });

  await squareImg.write(path.join(publicDir, 'logo-3.png'));
  console.log(`  → Logo 3 icon saved (512x512px)`);

  console.log('\n✅ All logos processed successfully!');
}

main().catch(console.error);

// fix-icon.cjs — crop logo-3 tightly and remove background for favicon
const { Jimp } = require('jimp');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'frontend', 'public');
const logosDir  = path.join(__dirname, '..', 'Logos');

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

async function main() {
  console.log('Processing logo-3 icon...');
  const img = await Jimp.read(path.join(logosDir, 'PraOjas logo 3.jpg'));
  const W = img.bitmap.width;   // 1408
  const H = img.bitmap.height;  // 768
  console.log(`Original: ${W}x${H}`);

  // ── Step 1: Crop to center where the PO icon lives ────────────────────────
  // Logo 3 is landscape: PO icon sits roughly in the horizontal center
  // and spans most of the height. We crop a square from center.
  const cropSize = Math.round(H * 0.82);         // ~630px — covers full icon height
  const cropX    = Math.round(W / 2) - Math.round(cropSize / 2) + 20; // slight right bias
  const cropY    = Math.round(H / 2) - Math.round(cropSize / 2);
  img.crop({
    x: Math.max(0, cropX),
    y: Math.max(0, cropY),
    w: Math.min(W - Math.max(0, cropX), cropSize),
    h: Math.min(H - Math.max(0, cropY), cropSize),
  });
  console.log(`After crop: ${img.bitmap.width}x${img.bitmap.height}`);

  // ── Step 2: Remove dark navy/blue gradient background ─────────────────────
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
    const r = this.bitmap.data[idx];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    const { h, s, l } = rgbToHsl(r, g, b);

    // Background is dark navy gradient (dark blueish, low saturation)
    // The logo artwork is vivid blue/teal/purple (high saturation OR bright)
    
    let shouldRemove = false;

    // Pure dark (lum < 12) — definitely background
    if (l < 12) shouldRemove = true;
    // Dark blue gradient: dark, blueish hue, low-medium saturation
    else if (l < 55 && s < 40 && h >= 185 && h <= 265) shouldRemove = true;
    // Mid-range gradient glow: grey-blue with low saturation
    else if (l >= 30 && l < 65 && s < 20) shouldRemove = true;

    if (shouldRemove) {
      // Soft fade so edges aren't harsh
      const fade = Math.min(l / 55, 1);
      const currentA = this.bitmap.data[idx + 3];
      this.bitmap.data[idx + 3] = Math.round(currentA * fade * 0.3);
    }
  });

  // Hard-clean near-zero alphas
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
    if (this.bitmap.data[idx + 3] < 50) this.bitmap.data[idx + 3] = 0;
  });

  // ── Step 3: Auto-crop to content bounds ───────────────────────────────────
  const cw = img.bitmap.width, ch = img.bitmap.height;
  let minX = cw, minY = ch, maxX = 0, maxY = 0;
  img.scan(0, 0, cw, ch, function(x, y, idx) {
    if (this.bitmap.data[idx + 3] > 30) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  });
  
  const pad = 18;
  const fx = Math.max(0, minX - pad);
  const fy = Math.max(0, minY - pad);
  const fw = Math.min(cw - fx, (maxX - minX) + pad * 2);
  const fh = Math.min(ch - fy, (maxY - minY) + pad * 2);
  img.crop({ x: fx, y: fy, w: fw, h: fh });
  console.log(`Content bounds: ${fw}x${fh}`);

  // ── Step 4: Pad to square and save as 512×512 ─────────────────────────────
  const side = Math.max(fw, fh);
  const square = new Jimp({ width: side, height: side, color: 0x00000000 });
  square.composite(img, Math.round((side - fw) / 2), Math.round((side - fh) / 2));
  square.resize({ w: 512, h: 512 });
  await square.write(path.join(publicDir, 'logo-3-icon.png'));
  console.log('✅ logo-3-icon.png saved (512x512)');
}

main().catch(err => { console.error(err); process.exit(1); });

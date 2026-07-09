// process-logos-v2.cjs — Improved background removal for gradient navy backgrounds
const { Jimp } = require('jimp');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'frontend', 'public');
const logosDir  = path.join(__dirname, '..', 'Logos');

// Convert RGB to HSL
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
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

// Remove background using HSL: target desaturated blue/grey gradient pixels
function removeBgHSL(img) {
  const w = img.bitmap.width;
  const h = img.bitmap.height;

  img.scan(0, 0, w, h, function(x, y, idx) {
    const r = this.bitmap.data[idx];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    const { h: hue, s: sat, l: lum } = rgbToHsl(r, g, b);

    // The background is:
    // 1. Dark navy: low lum, low-mid saturation, blueish hue (190-260 degrees)
    // 2. The radial glow: medium lum (30-60), low saturation (<25%), blueish-grey
    
    let alpha = 255;

    // Condition 1: Very dark navy corners (lum < 20, any saturation)
    if (lum < 15) {
      alpha = 0;
    }
    // Condition 2: Dark-to-medium grey/blue gradient areas (the background glow)
    // These have hue in blue range (200-260), low saturation, mid luminance
    else if (hue >= 190 && hue <= 265 && sat < 30 && lum < 70) {
      // Fade based on saturation — the more grey (desaturated), the more transparent
      const fadeFactor = 1 - (sat / 30);
      const lumFactor = lum < 40 ? 1 : (70 - lum) / 30;
      alpha = Math.round(255 * Math.max(0, 1 - fadeFactor * lumFactor * 1.5));
    }
    // Condition 3: Very dark blue (dark parts of gradient)
    else if (lum < 25 && b > r) {
      alpha = Math.round(255 * (lum / 25));
    }

    this.bitmap.data[idx + 3] = Math.min(this.bitmap.data[idx + 3], alpha);
  });
}

// Clean up near-transparent pixels
function cleanEdges(img, threshold) {
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
    if (this.bitmap.data[idx + 3] < threshold) {
      this.bitmap.data[idx + 3] = 0;
    }
  });
}

// Get content bounds
function getBounds(img) {
  const w = img.bitmap.width, h = img.bitmap.height;
  let minX = w, minY = h, maxX = 0, maxY = 0;
  img.scan(0, 0, w, h, function(x, y, idx) {
    if (this.bitmap.data[idx + 3] > 30) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  });
  return { minX, minY, maxX, maxY };
}

async function processLogo(srcPath, destPath, pad, isIcon, preCrop) {
  console.log(`\nProcessing: ${path.basename(srcPath)}`);
  const img = await Jimp.read(srcPath);
  const origW = img.bitmap.width, origH = img.bitmap.height;
  console.log(`  Original size: ${origW}x${origH}`);

  // Pre-crop for icon
  if (preCrop) {
    const { cx, cy, size } = preCrop;
    const cropX = Math.max(0, cx - Math.round(size / 2));
    const cropY = Math.max(0, cy - Math.round(size / 2));
    const cropW = Math.min(origW - cropX, size);
    const cropH = Math.min(origH - cropY, size);
    img.crop({ x: cropX, y: cropY, w: cropW, h: cropH });
    console.log(`  Pre-cropped to: ${cropW}x${cropH}`);
  }

  // Remove background
  removeBgHSL(img);
  cleanEdges(img, 60);

  // Auto-crop to content
  const b = getBounds(img);
  if (b.minX >= b.maxX) { console.error('No content found!'); return; }
  
  const cx2 = Math.max(0, b.minX - pad);
  const cy2 = Math.max(0, b.minY - pad);
  const cw  = Math.min(img.bitmap.width  - cx2, (b.maxX - b.minX) + pad * 2);
  const ch  = Math.min(img.bitmap.height - cy2, (b.maxY - b.minY) + pad * 2);
  img.crop({ x: cx2, y: cy2, w: cw, h: ch });
  console.log(`  Final crop: ${cw}x${ch}`);

  if (isIcon) {
    // Pad to square and resize to 512
    const side = Math.max(cw, ch);
    const sq = new Jimp({ width: side, height: side, color: 0x00000000 });
    sq.composite(img, Math.round((side - cw) / 2), Math.round((side - ch) / 2));
    sq.resize({ w: 512, h: 512 });
    await sq.write(destPath);
    console.log(`  ✅ Icon saved: 512x512`);
  } else {
    await img.write(destPath);
    console.log(`  ✅ Saved: ${cw}x${ch}`);
  }
}

async function main() {
  console.log('=== PraOjas Logo Processor v2 ===');

  // Logo 1: horizontal lockup
  await processLogo(
    path.join(logosDir, 'PraOjas logo 1.jpg'),
    path.join(publicDir, 'logo-1.png'),
    8, false, null
  );

  // Logo 2: stacked lockup
  await processLogo(
    path.join(logosDir, 'PraOjas logo 2.jpg'),
    path.join(publicDir, 'logo-2.png'),
    8, false, null
  );

  // Logo 3: icon-only — pre-crop center region then remove BG
  // Original is 1408x768, icon is roughly at center x=680, y=380, ~480px wide
  await processLogo(
    path.join(logosDir, 'PraOjas logo 3.jpg'),
    path.join(publicDir, 'logo-3-icon.png'),
    16, true,
    { cx: 680, cy: 384, size: 520 }
  );

  console.log('\n✨ All done!');
}

main().catch(err => { console.error(err); process.exit(1); });

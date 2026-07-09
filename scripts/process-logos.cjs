// process-logos.cjs — CJS script using jimp v1
const { Jimp, PNGColorType } = require('jimp');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'frontend', 'public');
const logosDir  = path.join(__dirname, '..', 'Logos');

// ─── Remove dark/navy background pixels ──────────────────────────────────────
function removeDarkBg(img, tolerance) {
  const w = img.bitmap.width;
  const h = img.bitmap.height;

  img.scan(0, 0, w, h, function(x, y, idx) {
    const r = this.bitmap.data[idx];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];

    // Dark navy/blue background detection
    // Background is dark (low luminance) and blueish
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    // Primary check: dark pixel with more blue than red/green
    if (lum < tolerance && b >= r && b >= g) {
      // Fade out proportionally to how dark/navy it is
      const alpha = Math.round((lum / tolerance) * 255 * 0.4);
      this.bitmap.data[idx + 3] = Math.min(this.bitmap.data[idx + 3], alpha);
    }
  });
}

// Second pass: smooth semi-transparent edge pixels
function cleanEdges(img, threshold) {
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  img.scan(0, 0, w, h, function(x, y, idx) {
    const a = this.bitmap.data[idx + 3];
    if (a < threshold) {
      this.bitmap.data[idx + 3] = 0;
    }
  });
}

// ─── Get bounds of non-transparent content ───────────────────────────────────
function getBounds(img, minAlpha) {
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  let minX = w, minY = h, maxX = 0, maxY = 0;
  img.scan(0, 0, w, h, function(x, y, idx) {
    if (this.bitmap.data[idx + 3] > minAlpha) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  });
  return { minX, minY, maxX, maxY };
}

async function processLogo(srcPath, destPath, pad, isIcon, iconCropPct) {
  console.log(`  Reading: ${path.basename(srcPath)}`);
  const img = await Jimp.read(srcPath);
  
  if (isIcon && iconCropPct) {
    // First do a manual crop to extract just the icon area
    const w = img.bitmap.width;
    const h = img.bitmap.height;
    const { cx, cy, r } = iconCropPct;
    const size  = Math.round(h * r);
    const cropX = Math.max(0, Math.round(w * cx) - Math.round(size / 2));
    const cropY = Math.max(0, Math.round(h * cy) - Math.round(size / 2));
    const cropW = Math.min(w - cropX, size);
    const cropH = Math.min(h - cropY, size);
    img.crop({ x: cropX, y: cropY, w: cropW, h: cropH });
    console.log(`  Icon pre-crop: ${cropW}x${cropH} from ${w}x${h}`);
  }

  // Remove dark navy background
  removeDarkBg(img, 80);
  cleanEdges(img, 40);

  // Auto-crop to content bounds
  const b = getBounds(img, 20);
  if (b.minX >= b.maxX || b.minY >= b.maxY) {
    console.warn('  ⚠ No content found after background removal!');
    return;
  }
  
  const cx = Math.max(0, b.minX - pad);
  const cy = Math.max(0, b.minY - pad);
  const cw = Math.min(img.bitmap.width  - cx, (b.maxX - b.minX) + pad * 2);
  const ch = Math.min(img.bitmap.height - cy, (b.maxY - b.minY) + pad * 2);
  img.crop({ x: cx, y: cy, w: cw, h: ch });

  if (isIcon) {
    // Make it a perfect square with transparent padding, then resize to 512
    const side = Math.max(cw, ch);
    const square = new Jimp({ width: side, height: side, color: 0x00000000 });
    const ox = Math.round((side - cw) / 2);
    const oy = Math.round((side - ch) / 2);
    square.composite(img, ox, oy);
    square.resize({ w: 512, h: 512 });
    await square.write(destPath);
    console.log(`  ✅ Saved icon: ${destPath} (512×512)`);
  } else {
    await img.write(destPath);
    console.log(`  ✅ Saved: ${destPath} (${cw}×${ch})`);
  }
}

async function main() {
  console.log('\n=== PraOjas Logo Processor ===\n');

  // Logo 1 — horizontal lockup: icon + "PraOjas AI" text side by side
  await processLogo(
    path.join(logosDir, 'PraOjas logo 1.jpg'),
    path.join(publicDir, 'logo-1.png'),
    12,   // padding px
    false,
    null
  );

  // Logo 2 — stacked lockup: icon above, "PraOjas AI" below
  await processLogo(
    path.join(logosDir, 'PraOjas logo 2.jpg'),
    path.join(publicDir, 'logo-2.png'),
    12,
    false,
    null
  );

  // Logo 3 — icon only (PO mark): crop tightly to center icon, square resize
  // The icon in logo 3 is in the center-right area of the landscape image
  // 1400×787px image, icon roughly at cx=0.50, cy=0.50, size ~65% of height
  await processLogo(
    path.join(logosDir, 'PraOjas logo 3.jpg'),
    path.join(publicDir, 'logo-3-icon.png'),
    20,
    true,
    { cx: 0.50, cy: 0.50, r: 0.70 }  // cx/cy as fraction of image, r=height fraction
  );

  console.log('\nDone! ✨');
}

main().catch(err => { console.error(err); process.exit(1); });

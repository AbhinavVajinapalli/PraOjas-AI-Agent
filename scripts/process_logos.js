import { Jimp } from 'jimp';

async function removeDarkBackground(inputPath, outputPath, cropOptions = null) {
  try {
    const image = await Jimp.read(inputPath);
    
    if (cropOptions) {
      image.crop(cropOptions); // Object format for Jimp v1
    }

    // Convert to PNG with alpha channel if not already
    // In jimp v1, background is set via color property
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      // If the pixel is dark (r,g,b all below a threshold, e.g. 50 or it's strongly blue but dark)
      if (r < 50 && g < 50 && b < 80) {
        // Set alpha to 0
        this.bitmap.data[idx + 3] = 0;
      }
    });

    await image.write(outputPath);
    console.log(`Successfully processed ${outputPath}`);
  } catch (err) {
    console.error(`Error processing ${inputPath}:`, err);
  }
}

async function processLogos() {
  await removeDarkBackground('Logos/PraOjas logo 1.jpg', 'frontend/public/logo-1.png');
  await removeDarkBackground('Logos/PraOjas logo 2.jpg', 'frontend/public/logo-2.png');
  
  // For Logo 3, crop the left side to get a square
  const image3 = await Jimp.read('Logos/PraOjas logo 3.jpg');
  const h = image3.bitmap.height;
  await removeDarkBackground('Logos/PraOjas logo 3.jpg', 'frontend/public/logo-3.png', { x: 50, y: 0, w: h, h: h });
}

processLogos();

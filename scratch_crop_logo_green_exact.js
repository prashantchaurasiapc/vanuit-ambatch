import sharp from 'sharp';

// logo_green.jpeg is 1772 x 1772
// Center artwork height is between ~600 and ~1170
const image = sharp('public/logo_green.jpeg');
const metadata = await image.metadata();

console.log('Original Metadata:', metadata);

// Extract tight rectangle around artwork (top 600, height 570)
await sharp('public/logo_green.jpeg')
  .extract({ left: 40, top: 620, width: 1692, height: 530 })
  .toFile('public/logo_green_cropped.png');

console.log('Successfully saved public/logo_green_cropped.png (1692x530)');

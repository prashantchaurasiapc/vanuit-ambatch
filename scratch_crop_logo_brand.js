import fs from 'fs';
import zlib from 'zlib';

const buffer = fs.readFileSync('public/logo_brand.png');

const width = buffer.readUInt32BE(16);
const height = buffer.readUInt32BE(20);
const bitDepth = buffer[24];
const colorType = buffer[25];

console.log({ width, height, bitDepth, colorType });

let pos = 8;
const idatChunks = [];
while (pos < buffer.length) {
  const length = buffer.readUInt32BE(pos);
  const type = buffer.toString('ascii', pos + 4, pos + 8);
  if (type === 'IDAT') {
    idatChunks.push(buffer.subarray(pos + 8, pos + 8 + length));
  }
  pos += 12 + length;
}

const compressed = Buffer.concat(idatChunks);
const decompressed = zlib.inflateSync(compressed);

let bpp = 4;
if (colorType === 2) bpp = 3;
if (colorType === 6) bpp = 4;

const raw = Buffer.alloc(width * height * bpp);

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

let srcIdx = 0;
for (let y = 0; y < height; y++) {
  const filter = decompressed[srcIdx++];
  for (let x = 0; x < width * bpp; x++) {
    const rawIdx = y * width * bpp + x;
    const xVal = decompressed[srcIdx++];
    let a = x >= bpp ? raw[rawIdx - bpp] : 0;
    let b = y > 0 ? raw[rawIdx - width * bpp] : 0;
    let c = y > 0 && x >= bpp ? raw[rawIdx - width * bpp - bpp] : 0;

    let val = xVal;
    if (filter === 1) val = (xVal + a) & 0xff;
    else if (filter === 2) val = (xVal + b) & 0xff;
    else if (filter === 3) val = (xVal + Math.floor((a + b) / 2)) & 0xff;
    else if (filter === 4) val = (xVal + paeth(a, b, c)) & 0xff;

    raw[rawIdx] = val;
  }
}

// Find bounding box of non-transparent pixels
let minX = width, maxX = 0, minY = height, maxY = 0;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * bpp;
    const alpha = bpp === 4 ? raw[idx + 3] : 255;
    const r = raw[idx];
    const g = raw[idx + 1];
    const b = raw[idx + 2];

    // Check if pixel is not transparent and not white
    if (alpha > 10 && !(r > 240 && g > 240 && b > 240)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

console.log({ minX, maxX, minY, maxY, cropW: maxX - minX + 1, cropH: maxY - minY + 1 });

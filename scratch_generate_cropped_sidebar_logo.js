import fs from 'fs';
import zlib from 'zlib';

const buffer = fs.readFileSync('public/logo_brand.png');

const width = buffer.readUInt32BE(16);
const height = buffer.readUInt32BE(20);
const bitDepth = buffer[24];
const colorType = buffer[25];

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

// Bounding box of content: minX: 87, maxX: 1524, minY: 149, maxY: 534
const minX = 80;
const maxX = 1530;
const minY = 140;
const maxY = 540;

const subW = maxX - minX + 1;
const subH = maxY - minY + 1;

console.log(`Cropping subW: ${subW}, subH: ${subH}`);

// Option 1: Create a cropped transparent PNG with solid cream logo text (#EDE8DF = RGB 237, 232, 223)
const creamRaw = Buffer.alloc(subW * subH * 4);

for (let y = 0; y < subH; y++) {
  for (let x = 0; x < subW; x++) {
    const srcX = minX + x;
    const srcY = minY + y;
    const srcIdx = (srcY * width + srcX) * bpp;
    const dstIdx = (y * subW + x) * 4;

    const r = raw[srcIdx];
    const g = raw[srcIdx + 1];
    const b = raw[srcIdx + 2];
    const a = bpp === 4 ? raw[srcIdx + 3] : 255;

    // Check if pixel is dark logo artwork (not white background)
    if (a > 10 && !(r > 240 && g > 240 && b > 240)) {
      // Calculate opacity from dark pixel luminance
      const darkLuma = 255 - Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      const alpha = Math.min(255, Math.max(0, darkLuma));

      // Cream color: #EDE8DF (RGB: 237, 232, 223)
      creamRaw[dstIdx] = 237;
      creamRaw[dstIdx + 1] = 232;
      creamRaw[dstIdx + 2] = 223;
      creamRaw[dstIdx + 3] = alpha;
    } else {
      creamRaw[dstIdx] = 0;
      creamRaw[dstIdx + 1] = 0;
      creamRaw[dstIdx + 2] = 0;
      creamRaw[dstIdx + 3] = 0; // 100% transparent
    }
  }
}

function encodePNG(w, h, pixelBuffer) {
  const scanlineLen = 1 + w * 4;
  const filtered = Buffer.alloc(h * scanlineLen);
  for (let y = 0; y < h; y++) {
    filtered[y * scanlineLen] = 0; // None filter
    pixelBuffer.copy(filtered, y * scanlineLen + 1, y * w * 4, (y + 1) * w * 4);
  }

  const deflated = zlib.deflateSync(filtered);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;  // bitDepth 8
  ihdr[9] = 6;  // colorType RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  function makeChunk(typeStr, dataBuf) {
    const len = dataBuf.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(typeStr, 4);
    dataBuf.copy(buf, 8);
    const crcVal = zlib.crc32(Buffer.concat([Buffer.from(typeStr), dataBuf]));
    buf.writeUInt32BE(crcVal >>> 0, 8 + len);
    return buf;
  }

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', deflated),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

const pngBuf = encodePNG(subW, subH, creamRaw);
fs.writeFileSync('public/logo_sidebar_cream.png', pngBuf);
console.log(`Saved public/logo_sidebar_cream.png (${subW}x${subH})`);

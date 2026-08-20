import fs from 'fs';
import zlib from 'zlib';

const mediaPath = 'C:\\Users\\kiaan\\.gemini\\antigravity-ide\\brain\\a62e364d-fb55-4553-bcd6-1a9fdd94f93a\\media__1784698488318.png';
const buffer = fs.readFileSync(mediaPath);

// Parse PNG header
const width = buffer.readUInt32BE(16);
const height = buffer.readUInt32BE(20);
const bitDepth = buffer[24];
const colorType = buffer[25];

console.log({ width, height, bitDepth, colorType });

// Collect IDAT chunks
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

console.log('Decompressed length:', decompressed.length);

// BPP calculation
let bpp = 4;
if (colorType === 2) bpp = 3; // RGB
if (colorType === 6) bpp = 4; // RGBA
if (colorType === 0) bpp = 1; // Grayscale
if (colorType === 4) bpp = 2; // Grayscale+A

const bytesPerLine = 1 + width * bpp;
console.log({ bpp, bytesPerLine, expectedLen: bytesPerLine * height });

// Unfilter scanlines
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

// Function to encode uncompressed pixels into PNG
function encodePNG(w, h, pixelBuffer) {
  // Add filter byte 0 to each scanline
  const scanlineLen = 1 + w * bpp;
  const filtered = Buffer.alloc(h * scanlineLen);
  for (let y = 0; y < h; y++) {
    filtered[y * scanlineLen] = 0; // None filter
    pixelBuffer.copy(filtered, y * scanlineLen + 1, y * w * bpp, (y + 1) * w * bpp);
  }

  const deflated = zlib.deflateSync(filtered);

  // Build PNG chunks
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = bitDepth;
  ihdr[9] = colorType;
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  function makeChunk(typeStr, dataBuf) {
    const len = dataBuf.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(typeStr, 4);
    dataBuf.copy(buf, 8);
    
    // CRC32
    const crcVal = zlib.crc32(Buffer.concat([Buffer.from(typeStr), dataBuf]));
    buf.writeUInt32BE(crcVal >>> 0, 8 + len);
    return buf;
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Split height into 3 parts
const partH = Math.floor(height / 3);

for (let i = 0; i < 3; i++) {
  const startY = i * partH;
  const endY = i === 2 ? height : (i + 1) * partH;
  const subH = endY - startY;
  
  const subPixels = Buffer.alloc(width * subH * bpp);
  const srcStart = startY * width * bpp;
  const srcEnd = endY * width * bpp;
  raw.copy(subPixels, 0, srcStart, srcEnd);

  const pngBuf = encodePNG(width, subH, subPixels);
  const filenames = ['logo_buitenkeukens.png', 'logo_kliko.png', 'logo_snijplanken.png'];
  fs.writeFileSync(`./public/${filenames[i]}`, pngBuf);
  console.log(`Saved public/${filenames[i]} (${width}x${subH})`);
}

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const mediaPath = 'C:\\Users\\kiaan\\.gemini\\antigravity-ide\\brain\\a62e364d-fb55-4553-bcd6-1a9fdd94f93a\\media__1784698488318.png';
const buffer = fs.readFileSync(mediaPath);

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

// Convert raw buffer to RGBA and make white/light pixels transparent
const transparentRaw = Buffer.alloc(width * height * 4);

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const srcOffset = (y * width + x) * bpp;
    const dstOffset = (y * width + x) * 4;

    let r = raw[srcOffset];
    let g = raw[srcOffset + 1];
    let b = raw[srcOffset + 2];
    let a = bpp === 4 ? raw[srcOffset + 3] : 255;

    // Check if pixel is white or light background (cream/white > 230)
    if (r > 225 && g > 225 && b > 225) {
      transparentRaw[dstOffset] = 0;
      transparentRaw[dstOffset + 1] = 0;
      transparentRaw[dstOffset + 2] = 0;
      transparentRaw[dstOffset + 3] = 0; // 100% TRANSPARENT
    } else {
      transparentRaw[dstOffset] = r;
      transparentRaw[dstOffset + 1] = g;
      transparentRaw[dstOffset + 2] = b;
      transparentRaw[dstOffset + 3] = a;
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

const partH = Math.floor(height / 3);
const filenames = ['logo_buitenkeukens.png', 'logo_kliko.png', 'logo_snijplanken.png'];

for (let i = 0; i < 3; i++) {
  const startY = i * partH;
  const endY = i === 2 ? height : (i + 1) * partH;
  const subH = endY - startY;
  
  const subPixels = Buffer.alloc(width * subH * 4);
  const srcStart = startY * width * 4;
  const srcEnd = endY * width * 4;
  transparentRaw.copy(subPixels, 0, srcStart, srcEnd);

  const pngBuf = encodePNG(width, subH, subPixels);
  fs.writeFileSync(`./public/${filenames[i]}`, pngBuf);
  console.log(`Saved TRUE TRANSPARENT PNG: public/${filenames[i]} (${width}x${subH})`);
}

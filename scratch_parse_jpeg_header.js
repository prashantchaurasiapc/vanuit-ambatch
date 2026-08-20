import fs from 'fs';

const buf = fs.readFileSync('public/logo_green.jpeg');

let pos = 2;
let width = 0, height = 0;

while (pos < buf.length) {
  const marker = buf.readUInt16BE(pos);
  const len = buf.readUInt16BE(pos + 2);
  
  // SOF0 (0xFFC0) or SOF2 (0xFFC2)
  if (marker === 0xffc0 || marker === 0xffc2) {
    height = buf.readUInt16BE(pos + 5);
    width = buf.readUInt16BE(pos + 7);
    break;
  }
  pos += 2 + len;
}

console.log({ width, height });

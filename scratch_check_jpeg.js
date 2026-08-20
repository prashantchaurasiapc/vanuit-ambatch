import fs from 'fs';

const buf = fs.readFileSync('public/logo_green.jpeg');
console.log('Magic bytes:', buf.subarray(0, 8));
console.log('File size:', buf.length);

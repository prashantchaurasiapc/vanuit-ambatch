// Render offerte.html naar PDF met Chromium (Playwright of Puppeteer werkt hetzelfde).
// Gebruik: node render.js [invoer.html] [uitvoer.pdf]
const path = require('path');
const { chromium } = require('playwright');
(async () => {
  const input = path.resolve(process.argv[2] || 'offerte.html');
  const output = process.argv[3] || 'offerte.pdf';
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + input, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: output, printBackground: true, preferCSSPageSize: true, scale: 1 });
  await browser.close();
  console.log('PDF geschreven:', output);
})();

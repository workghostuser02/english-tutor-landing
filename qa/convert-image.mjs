import { chromium } from '../../../ai-studio-audit-2026-09-25/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const input = path.join(root, 'images', 'tutor-illustration.png');
const output = path.join(root, 'images', 'tutor-illustration.webp');
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage();
await page.setContent('<canvas id="canvas"></canvas>');
const source = `data:image/png;base64,${fs.readFileSync(input).toString('base64')}`;
const data = await page.evaluate(async (src) => {
  const img = new Image();
  img.src = src;
  await img.decode();
  const maxWidth = 1440;
  const scale = Math.min(1, maxWidth / img.naturalWidth);
  const canvas = document.querySelector('#canvas');
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/webp', .84).split(',')[1];
}, source);
fs.writeFileSync(output, Buffer.from(data, 'base64'));
await browser.close();
console.log(output);


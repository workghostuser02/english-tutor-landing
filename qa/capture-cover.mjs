import { chromium } from '../../../ai-studio-audit-2026-09-25/node_modules/playwright/index.mjs';
import path from 'node:path';

const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage({ viewport: { width: 800, height: 800 }, deviceScaleFactor: 1 });
await page.goto(process.env.SITE_URL || 'https://workghostuser02.github.io/english-tutor-landing/', { waitUntil: 'networkidle' });
await page.screenshot({ path: path.resolve(import.meta.dirname, 'screenshots', 'cover-800.png'), fullPage: false });
await browser.close();

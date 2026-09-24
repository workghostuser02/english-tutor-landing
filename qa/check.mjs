import { chromium } from '../../../ai-studio-audit-2026-09-25/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';

const base = process.env.SITE_URL || 'http://127.0.0.1:8004';
const outDir = path.resolve(import.meta.dirname, 'screenshots');
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const sizes = [
  { name: '320', width: 320, height: 800 },
  { name: '375', width: 375, height: 812 },
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1440', width: 1440, height: 900 }
];
const report = { pages: [], consoleErrors: [], brokenLinks: [], interactions: {} };

for (const size of sizes) {
  const page = await browser.newPage({ viewport: { width: size.width, height: size.height } });
  page.on('console', msg => { if (msg.type() === 'error') report.consoleErrors.push(`${size.name}: ${msg.text()}`); });
  await page.goto(base, { waitUntil: 'networkidle' });
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    title: document.title,
    landmarks: { main: !!document.querySelector('main'), nav: !!document.querySelector('nav'), footer: !!document.querySelector('footer') },
    emptyImages: [...document.images].filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src)
  }));
  report.pages.push({ size: size.name, ...metrics, horizontalOverflow: metrics.scrollWidth > metrics.clientWidth });
  await page.screenshot({ path: path.join(outDir, `full-${size.name}.png`), fullPage: true });
  if (size.name === '390' || size.name === '1440') {
    await page.screenshot({ path: path.join(outDir, `portfolio-${size.name}.png`), fullPage: false });
  }
  await page.close();
}

const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(base, { waitUntil: 'networkidle' });
await page.click('.menu-toggle');
report.interactions.mobileMenu = await page.locator('#site-nav').evaluate(el => el.classList.contains('is-open'));
await page.click('#site-nav a[href="#faq"]');
report.interactions.menuClosedAfterClick = !(await page.locator('#site-nav').evaluate(el => el.classList.contains('is-open')));
await page.locator('details').nth(1).locator('summary').click();
report.interactions.faqOpens = await page.locator('details').nth(1).getAttribute('open') !== null;
await page.locator('#demo-form button').click();
report.interactions.invalidFocused = await page.evaluate(() => document.activeElement?.id);
await page.fill('#name', 'Макс');
await page.fill('#contact', '@demo_user');
await page.selectOption('#goal', { index: 1 });
await page.locator('#demo-form button').click();
report.interactions.validStatus = await page.locator('#form-status').textContent();
report.interactions.focusVisible = await page.evaluate(() => CSS.supports('selector(:focus-visible)'));
const hrefs = await page.locator('a[href]').evaluateAll(items => items.map(a => a.getAttribute('href')));
for (const href of hrefs) {
  if (href?.startsWith('#') && !(await page.locator(href).count())) report.brokenLinks.push(href);
}
await page.close();
await browser.close();
fs.writeFileSync(path.resolve(import.meta.dirname, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

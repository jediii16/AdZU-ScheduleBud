import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const here = path.dirname(fileURLToPath(import.meta.url));
const rawDir = path.join(here, 'raw-video');
await fs.rm(rawDir, { recursive: true, force: true });
await fs.mkdir(rawDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
});
const context = await browser.newContext({
  viewport: { width: 1080, height: 1920 },
  deviceScaleFactor: 1,
  recordVideo: { dir: rawDir, size: { width: 1080, height: 1920 } },
});
const page = await context.newPage();
await page.goto(pathToFileURL(path.join(here, 'launch.html')).href, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => window.startLaunch());
await page.waitForTimeout(15200);
const video = page.video();
await page.close();
await context.close();
await browser.close();
const rawPath = await video.path();
await fs.copyFile(rawPath, path.join(here, 'schedulebud-launch-raw.webm'));

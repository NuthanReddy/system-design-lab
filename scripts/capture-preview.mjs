import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const output = process.argv[2];
if (!output) throw new Error('Pass an output directory for screenshots.');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge' });
try {
  for (const [name, viewport, route, dark] of [
    ['desktop', { width: 1440, height: 1000 }, '/#/design-url-shortener/1', false],
    ['desktop-cache', { width: 1440, height: 1000 }, '/#/design-url-shortener/7', false],
    ['desktop-dark', { width: 1440, height: 1000 }, '/#/design-url-shortener/12', true],
    ['mobile', { width: 390, height: 844 }, '/#/design-url-shortener/7', false],
    ['request-lifecycle', { width: 1440, height: 1000 }, '/#/request-lifecycle/3', false],
  ]) {
    const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
    await page.goto(`http://127.0.0.1:4173${route}`);
    await page.evaluate(() => document.fonts.ready);
    if (dark) await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: true });
    console.log(name, await page.locator('[data-node]').evaluateAll(nodes => nodes.map(node => {
      const box = node.getBoundingClientRect();
      return { id: node.dataset.node, x: box.x, y: box.y, width: box.width, height: box.height };
    })));
    await page.close();
  }
  if (process.argv.includes('--reference')) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto('https://designed-to-scale.vercel.app/#/design-url-shortener/7');
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(output, 'reference-mobile.png'), fullPage: true });
    console.log('Reference mobile', (await page.locator('body').innerText()).slice(-1800));
    await page.close();
  }
} finally {
  await browser.close();
}

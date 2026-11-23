import { test, expect } from '@playwright/test';

test('shortener, step controls, animation, theme and durable progress', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Design a URL Shortener');
  await expect(page.getByRole('button', { name: 'Back', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '7 Cache', exact: true }).click();
  await expect(page).toHaveURL(/design-url-shortener\/7/);
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Serve popular links from memory');
  await expect(page.locator('[data-node="cache"]')).toBeVisible();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  expect(await page.locator('#system-diagram').evaluate(svg => svg.animationsPaused())).toBe(true);
  await page.getByRole('button', { name: 'Replay', exact: true }).click();
  expect(await page.locator('#system-diagram').evaluate(svg => svg.getCurrentTime())).toBeLessThan(.2);
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  expect(await page.locator('#system-diagram').evaluate(svg => svg.animationsPaused())).toBe(false);
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: '12 Recap', exact: true }).click();
  await expect(page.locator('.completion')).toHaveText('Lesson complete');
  await expect(page.getByRole('button', { name: 'Next lesson: Design a News Feed', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('.completion')).toHaveText('Lesson complete');
  await page.getByRole('button', { name: 'Next lesson: Design a News Feed', exact: true }).click();
  await expect(page).toHaveURL(/design-news-feed\/1/);
  expect(errors).toEqual([]);
});

test('keyboard search, empty results and course navigation', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Control+k');
  const search = page.getByRole('combobox');
  await search.fill('not-a-real-concept-1234');
  await expect(page.getByText('No matching lessons. Try a broader concept.')).toBeVisible();
  await search.fill('Load Balancing');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Load Balancing');
  await expect(page.locator('#search-dialog')).not.toBeVisible();
  await page.locator('body').click({ position: { x: 1, y: 150 } });
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/load-balancing\/2/);
  await page.keyboard.press('ArrowLeft');
  await expect(page).toHaveURL(/load-balancing\/1/);
});

test('responsive layout, node inspection, zoom and interface language', async ({ page }, testInfo) => {
  await page.goto('/#/design-url-shortener/7');
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Open course navigation' }).click();
    await expect(page.getByRole('complementary', { name: 'Course', exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Design a URL Shortener', exact: true }).click();
    await expect(page.locator('.sidebar')).not.toHaveClass(/drawer-open/);
    await page.getByRole('button', { name: '7 Cache', exact: true }).click();
  }
  await page.locator('[data-node="cache"]').click();
  await expect(page.getByRole('button', { name: 'Close component details' })).toBeVisible();
  await expect(page.locator('.component-note')).toContainText('a miss falls back to the links table');
  await expect(page.locator('.component-note')).toContainText('From Link API: request / lookup');
  await page.getByRole('button', { name: 'Close component details' }).click();
  await page.getByRole('button', { name: 'Show diagram full screen', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Full screen system diagram' })).toBeVisible();
  const before = await page.locator('#diagram-content').getAttribute('transform');
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  const zoomed = await page.locator('#diagram-content').getAttribute('transform');
  expect(zoomed).not.toEqual(before);
  await page.locator('.diagram-viewport').focus();
  await page.keyboard.press('ArrowRight');
  expect(await page.locator('#diagram-content').getAttribute('transform')).not.toEqual(zoomed);
  await page.getByRole('button', { name: 'Fit diagram', exact: true }).click();
  await expect(page.locator('#diagram-content')).toHaveAttribute('transform', before);
  await page.getByRole('button', { name: 'Close full screen diagram' }).click();
  await page.getByRole('button', { name: 'Language: EN' }).click();
  await expect(page.getByText('Original lesson content is in English.')).toBeVisible();
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Repetir', exact: true })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('focused playback shortcuts, individual lesson resume and explicit deep links', async ({ page }) => {
  await page.goto('/#/design-url-shortener/7');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/design-url-shortener\/8/);
  await page.goBack();
  await expect(page).toHaveURL(/design-url-shortener\/7/);
  await page.goto('/#/caching/3');
  await page.keyboard.press('Control+k');
  await page.getByRole('combobox').fill('URL Shortener');
  await expect(page.locator('#search-results')).toContainText('Resume step 7');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/design-url-shortener\/7/);
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Serve popular links from memory');
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Serve popular links from memory');
  await expect(page.locator('.sidebar a[href="#/caching/3"]')).toHaveCount(1);
  await page.goto('/#/design-url-shortener/1');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Define a useful short link');
});

test('phone navigation stays reachable and drawer confines and restores focus', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Phone-specific navigation behavior');
  await page.goto('/#/design-url-shortener/12');
  for (const width of [320, 360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/design-url-shortener/7');
  const next = page.getByRole('button', { name: 'Next: 301 or 302', exact: true });
  await expect(next).toBeInViewport({ ratio: 1 });
  await page.locator('.goals').scrollIntoViewIfNeeded();
  await expect(next).toBeInViewport({ ratio: 1 });
  await page.getByRole('button', { name: 'Open course navigation' }).click();
  const close = page.getByRole('button', { name: 'Close course navigation' });
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('.sidebar summary')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open course navigation' })).toBeFocused();
  expect(await page.locator('.sidebar').evaluate(sidebar => sidebar.inert)).toBe(true);
});

test('expanded diagram preserves motion, zoom, focus and returns the actual SVG', async ({ page }) => {
  await page.goto('/#/design-url-shortener/12');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.locator('#system-diagram').evaluate(svg => { svg.setCurrentTime(12); svg.dataset.identity = 'original'; });
  await page.getByRole('button', { name: 'Show diagram full screen' }).click();
  await expect(page.locator('#diagram-dialog #system-diagram')).toHaveAttribute('data-identity', 'original');
  await page.getByRole('button', { name: 'Zoom in' }).click({ clickCount: 6 });
  await page.locator('.diagram-viewport').focus();
  await page.keyboard.press('ArrowRight');
  const transform = await page.locator('#diagram-content').getAttribute('transform');
  await page.keyboard.press('Escape');
  await expect(page.locator('#diagram-dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Show diagram full screen' })).toBeFocused();
  await expect(page.locator('#lesson #system-diagram')).toHaveAttribute('data-identity', 'original');
  await expect(page.locator('#diagram-content')).toHaveAttribute('transform', transform);
  expect(await page.locator('#system-diagram').evaluate(svg => svg.animationsPaused() && Math.abs(svg.getCurrentTime() - 12) < .1)).toBe(true);
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  expect(await page.locator('#system-diagram').evaluate(svg => svg.animationsPaused() && Math.abs(svg.getCurrentTime() - 12) < .1)).toBe(true);
  await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeFocused();
});

test('all forty deep links render without errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const links = await page.locator('.sidebar nav a').evaluateAll(anchors => anchors.map(a => a.getAttribute('href')));
  expect(links).toHaveLength(40);
  for (const link of links) {
    await page.goto(`/${link}`);
    await expect(page.getByRole('heading', { level: 1 })).not.toBeEmpty();
    await expect(page.locator('#system-diagram')).toBeVisible();
    const lastStep = await page.locator('.timeline li').count();
    await page.goto(`/${link.replace(/\/1$/, `/${lastStep}`)}`);
    // Nested SVG viewport geometry must stay at icon size, not inherit the outer diagram.
    expect(await page.locator('#system-diagram .icon').evaluateAll(icons => icons.every(svg => svg.width.baseVal.value === 24 && svg.height.baseVal.value === 24))).toBe(true);
    expect(await page.locator('[data-node]').evaluateAll(nodes => nodes.every(node => {
      const box = node.getBBox();
      return box.width < 300 && box.height < 210;
    }))).toBe(true);
    expect(await page.locator('[data-node]').evaluateAll(nodes => nodes.every(node => {
      const box = node.getBBox(), matrix = node.transform.baseVal.consolidate().matrix;
      return box.x + matrix.e >= 0 && box.x + box.width + matrix.e <= 1000 && box.y + matrix.f >= 0 && box.y + box.height + matrix.f <= 640;
    }))).toBe(true);
    const next = page.getByRole('button', { name: /^Next lesson:|Course complete$/ });
    await expect(next).toHaveCount(1);
  }
  expect(errors).toEqual([]);
});

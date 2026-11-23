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
  await page.getByRole('button', { name: 'Complete lesson', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Lesson complete' })).toBeVisible();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: 'Lesson complete' })).toBeVisible();
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
  await page.getByRole('button', { name: 'Close component details' }).click();
  const before = await page.locator('#diagram-content').getAttribute('transform');
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  const zoomed = await page.locator('#diagram-content').getAttribute('transform');
  expect(zoomed).not.toEqual(before);
  await page.locator('.diagram-viewport').focus();
  await page.keyboard.press('ArrowRight');
  expect(await page.locator('#diagram-content').getAttribute('transform')).not.toEqual(zoomed);
  await page.getByRole('button', { name: 'Fit diagram', exact: true }).click();
  await expect(page.locator('#diagram-content')).toHaveAttribute('transform', before);
  if (testInfo.project.name === 'mobile') {
    await page.goto('/?lang=es#/design-url-shortener/7');
  } else {
    await page.getByRole('button', { name: 'Language: EN' }).click();
    await page.getByRole('button', { name: 'Español', exact: true }).click();
  }
  await expect(page.getByRole('button', { name: 'Repetir', exact: true })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
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
  }
  expect(errors).toEqual([]);
});

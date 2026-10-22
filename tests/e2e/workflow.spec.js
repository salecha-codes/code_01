import { test, expect } from '@playwright/test';

test('real MongoDB workflow: empty dashboard, anonymous response, login, filters, charts, event editing and logout', async ({
  page,
  browser,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.getByLabel('Email address').fill('judge@example.test');
  await page.getByLabel('Password', { exact: true }).fill('invalid-password');
  await page.getByRole('button', { name: 'Sign in to workspace' }).click();
  await expect(page.getByRole('alert')).toContainText('Email or password is incorrect.');
  await page.getByLabel('Password', { exact: true }).fill(process.env.E2E_ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Show password' }).click();
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Hide password' }).click();
  await page.getByRole('button', { name: 'Sign in to workspace' }).click();
  await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible();
  await expect(page.getByText('Your first insight starts with a response')).toBeVisible();
  await expect(
    page.locator('.stat-card').filter({ hasText: 'Total responses' }).locator('strong'),
  ).toHaveText('0');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible();

  // A separate, fresh browser context has no administrator cookies.
  const visitor = await browser.newContext({
    baseURL: 'http://localhost:5174',
    viewport: { width: 390, height: 844 },
  });
  const publicPage = await visitor.newPage();
  await publicPage.goto('/');
  await publicPage.getByRole('link', { name: /Browser Test · Web Workshop/ }).click();
  await expect(publicPage.locator('#event')).not.toHaveValue('');
  await expect(
    publicPage.getByRole('option', { name: 'Browser Test · Closed Workshop' }),
  ).toHaveCount(0);
  await publicPage.getByRole('radio', { name: '5 Loved it' }).check();
  await publicPage.getByLabel('What’s your feedback about?').selectOption('Content Quality');
  await publicPage
    .getByLabel('Tell us a little more')
    .fill('Clear explanations and a useful live coding session.');
  await publicPage.getByRole('radio', { name: 'Yes, definitely' }).check();
  await publicPage.screenshot({
    path: '.playwright/screenshots/feedback-mobile.png',
    fullPage: true,
  });
  await publicPage.getByRole('button', { name: 'Submit feedback', exact: true }).click();
  await expect(publicPage.getByRole('heading', { name: 'Thanks for speaking up.' })).toBeVisible();
  expect(await publicPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
    true,
  );
  await visitor.close();

  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(
    page.locator('.stat-card').filter({ hasText: 'Total responses' }).locator('strong'),
  ).toHaveText('1');
  await expect(
    page.locator('.stat-card').filter({ hasText: 'Average rating' }).locator('strong'),
  ).toHaveText('5.0/ 5');
  await expect(
    page.locator('.stat-card').filter({ hasText: 'Positive feedback' }).locator('strong'),
  ).toHaveText('100%');
  await expect(
    page.getByRole('img', { name: /Rating distribution:.*5 stars, 1 responses/ }),
  ).toBeVisible();
  await expect(
    page.getByText('Clear explanations and a useful live coding session.'),
  ).toBeVisible();
  await page.screenshot({ path: '.playwright/screenshots/overview.png', fullPage: true });
  await page.getByRole('link', { name: 'Feedback', exact: true }).click();
  await page
    .getByLabel('Event', { exact: true })
    .selectOption({ label: 'Browser Test · Web Workshop' });
  await page.getByLabel('Rating', { exact: true }).selectOption('5');
  await page.getByLabel('Category', { exact: true }).selectOption('Content Quality');
  await page.getByRole('textbox', { name: 'Search comments' }).fill('live coding');
  await page.getByRole('button', { name: 'Apply filters' }).click();
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await page.getByLabel('Rating', { exact: true }).selectOption('1');
  await page.getByRole('button', { name: 'Apply filters' }).click();
  await expect(page.getByText('No responses match your filters')).toBeVisible();
  await page.getByRole('button', { name: /Clear filters \(/ }).click();
  await expect(page.locator('tbody tr')).toHaveCount(1);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('link', { name: 'Events', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Open navigation' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  await page.getByRole('button', { name: 'Create event', exact: true }).click();
  await page.getByLabel('Event title').fill('Browser Test · New event');
  await page.getByLabel('Event date').fill('2026-11-02');
  await page.getByRole('button', { name: 'Save event' }).click();
  const eventCard = page.locator('.event-card').filter({ hasText: 'Browser Test · New event' });
  await expect(eventCard).toBeVisible();
  await eventCard.getByRole('button', { name: 'Edit event' }).click();
  await page.getByLabel('Feedback collection').selectOption('closed');
  await page.getByRole('button', { name: 'Save event' }).click();
  await expect(eventCard.getByText('Closed', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto('/admin/feedback');
  await expect(page).toHaveURL(/\/admin\/login$/);
  expect(errors).toEqual([]);
});

test('public pages fit mobile and desktop viewports and expose no student identity fields', async ({
  page,
}) => {
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/feedback', '/admin/login']) {
      await page.goto(route);
      await expect(page.locator('h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  }
  await page.goto('/feedback');
  await expect(page.getByRole('textbox', { name: /email|name|phone|registration/i })).toHaveCount(
    0,
  );
});

import { test, expect } from '@playwright/test';

test('real MongoDB workflow: empty dashboard, anonymous response, login, filters, charts, event editing and logout', async ({
  page,
  browser,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 960 });
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
  await expect(
    page.getByRole('heading', { name: 'A clearer picture of your impact.', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Your first insight starts with a response')).toBeVisible();
  await expect(
    page.locator('.stat-card').filter({ hasText: 'Total responses' }).locator('strong'),
  ).toHaveText('0');
  await expect(page.getByText('Listening mode: on')).toBeVisible();
  await page.screenshot({ path: '.playwright/screenshots/overview-empty.png', fullPage: true });
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'A clearer picture of your impact.', exact: true }),
  ).toBeVisible();

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
  await publicPage.getByRole('radio', { name: '5 Excellent' }).check();
  await publicPage.getByRole('radio', { name: 'Content Quality', exact: true }).check();
  await publicPage
    .getByLabel('Tell us a little more')
    .fill('Clear explanations and a useful live coding session.');
  await publicPage.getByRole('radio', { name: 'Yes, definitely' }).check();
  await publicPage.screenshot({
    path: '.playwright/screenshots/feedback-mobile.png',
    fullPage: true,
  });
  await publicPage.getByRole('button', { name: 'Submit feedback', exact: true }).click();
  await expect(
    publicPage.getByRole('heading', { name: /Thanks for making.*things better/ }),
  ).toBeVisible();
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
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/feedback', '/admin/login']) {
      await page.goto(route);
      await expect(page.locator('h1')).toBeVisible();
      if (route === '/') await expect(page.getByLabel('Your event')).not.toHaveValue('');
      if (route === '/feedback') await expect(page.locator('#event')).toBeVisible();
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

test('landing starter carries real event and rating choices; menus support keyboard focus and hash navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto('/');
  await expect(page.getByLabel('Your event')).not.toHaveValue('');
  await page.screenshot({ path: '.playwright/screenshots/landing.png', fullPage: true });
  const eventId = await page.getByLabel('Your event').inputValue();
  await page.getByRole('radio', { name: '4 out of 5', exact: true }).check();
  await page.getByRole('button', { name: 'Continue to feedback' }).click();
  await expect(page.locator('#event')).toHaveValue(eventId);
  await expect(page.getByRole('radio', { name: '4 Very good', exact: true })).toBeChecked();
  await page.getByRole('radio', { name: '4 Very good', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: '5 Excellent', exact: true })).toBeChecked();
  await page.getByRole('radio', { name: 'Content Quality', exact: true }).check();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: 'Speaker/Instructor', exact: true })).toBeChecked();

  await page.setViewportSize({ width: 390, height: 844 });
  const menuButton = page.getByRole('button', { name: 'Open menu', exact: true });
  await menuButton.click();
  const dialog = page.getByRole('dialog', { name: 'Explore ClubPulse' });
  await expect(dialog).toBeVisible();
  for (let step = 0; step < 7; step++) {
    await page.keyboard.press('Tab');
    expect(
      await page.evaluate(() => Boolean(document.activeElement?.closest('dialog[open]'))),
    ).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(menuButton).toBeFocused();
  await menuButton.click();
  await dialog.getByRole('link', { name: 'How it works' }).click();
  await expect(page).toHaveURL(/\/#how-it-works$/);
  await expect(page.locator('#how-it-works')).toBeInViewport();
  await expect(dialog).not.toBeVisible();
  await page.goto('/admin/login');
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.screenshot({ path: '.playwright/screenshots/login.png', fullPage: true });
});

test('public loading, empty and connection-error states recover without inventing events', async ({
  page,
}) => {
  let release;
  const pending = new Promise((resolve) => {
    release = resolve;
  });
  await page.route('**/api/events', async (route) => {
    await pending;
    await route.abort('failed');
  });
  await page.goto('/feedback');
  await expect(page.getByRole('status')).toContainText('Loading events');
  release();
  await expect(page.getByRole('alert')).toContainText('Unable to reach ClubPulse');
  await page.unroute('**/api/events');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByLabel('Which event did you attend?')).toBeVisible();

  // Only the test transport supplies an empty result; production still uses the real API.
  await page.route('**/api/events', (route) => route.fulfill({ json: { events: [] } }));
  await page.goto('/feedback');
  await expect(page.getByText('No events are open right now')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Submit feedback', exact: true })).toHaveCount(0);
  await page.unroute('**/api/events');
});

test('event dialogs, submission recovery, long names, mobile response cards and all admin breakpoints work with real data', async ({
  page,
  browser,
}) => {
  test.setTimeout(90000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto('/admin/login');
  await page.getByLabel('Email address').fill('judge@example.test');
  await page.getByLabel('Password', { exact: true }).fill(process.env.E2E_ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign in to workspace' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto('/admin/events');
  const create = page.getByRole('button', { name: 'Create event', exact: true });
  await create.click();
  const editor = page.getByRole('dialog', { name: 'Create an event', exact: true });
  await expect(editor.getByLabel('Event title')).toBeFocused();
  for (let step = 0; step < 10; step++) {
    await page.keyboard.press('Tab');
    expect(
      await page.evaluate(() => Boolean(document.activeElement?.closest('dialog[open]'))),
    ).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(editor).not.toBeVisible();
  await expect(create).toBeFocused();
  await page.getByRole('radio', { name: /^Open \d+$/ }).check();
  await expect(page.locator('.event-card')).toHaveCount(1);
  await page.getByRole('radio', { name: /^Closed \d+$/ }).check();
  await expect(page.locator('.event-card')).toHaveCount(2);
  await page.getByRole('radio', { name: /^All events \d+$/ }).check();

  const longTitle =
    'Browser Test · Designing accessible campus experiences and inclusive community workshops';
  const workshop = page.locator('.event-card').filter({ hasText: 'Browser Test · Web Workshop' });
  await workshop.getByRole('button', { name: 'Edit event', exact: true }).click();
  await page.getByLabel('Event title').fill(longTitle);
  await page.screenshot({ path: '.playwright/screenshots/event-dialog.png', fullPage: true });
  await page.route('**/api/admin/events/*', async (route) => {
    if (route.request().method() === 'PATCH') await route.abort('failed');
    else await route.continue();
  });
  await page.getByRole('button', { name: 'Save event', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText(
    'Unable to reach ClubPulse',
  );
  await expect(page.getByLabel('Event title')).toHaveValue(longTitle);
  await page.unroute('**/api/admin/events/*');
  await page.getByRole('button', { name: 'Save event', exact: true }).click();
  const renamed = page.locator('.event-card').filter({ hasText: longTitle });
  await expect(renamed).toBeVisible();
  const feedbackLink = await renamed
    .getByRole('link', { name: 'Feedback page' })
    .getAttribute('href');

  const visitor = await browser.newContext({
    baseURL: 'http://localhost:5174',
    viewport: { width: 360, height: 900 },
  });
  const publicPage = await visitor.newPage();
  publicPage.on('pageerror', (error) => errors.push(error.message));
  await publicPage.goto(feedbackLink);
  await publicPage.getByRole('radio', { name: '4 Very good', exact: true }).check();
  await publicPage.getByRole('radio', { name: 'Organization', exact: true }).check();
  const comment =
    'The workshop made inclusive design approachable. ' +
    'More hands-on exercises would help us apply what we learned. '.repeat(5);
  await publicPage.getByLabel('Tell us a little more').fill('hi');
  await publicPage.getByRole('button', { name: 'Submit feedback', exact: true }).click();
  await expect(publicPage.getByRole('alert')).toContainText('at least 3 characters');
  await expect(publicPage.getByRole('alert')).toBeFocused();
  await publicPage.getByLabel('Tell us a little more').fill(comment);
  await publicPage.route('**/api/feedback', (route) => route.abort('failed'));
  await publicPage.getByRole('button', { name: 'Submit feedback', exact: true }).click();
  await expect(publicPage.getByRole('alert')).toContainText('Unable to reach ClubPulse');
  await expect(publicPage.getByLabel('Tell us a little more')).toHaveValue(comment);
  await expect(publicPage.getByRole('radio', { name: '4 Very good', exact: true })).toBeChecked();
  await publicPage.unroute('**/api/feedback');
  let release;
  const pending = new Promise((resolve) => {
    release = resolve;
  });
  let submissions = 0;
  await publicPage.route('**/api/feedback', async (route) => {
    submissions++;
    await pending;
    await route.continue();
  });
  await publicPage.getByRole('button', { name: 'Submit feedback', exact: true }).click();
  const submitting = publicPage.getByRole('button', { name: 'Submitting…', exact: true });
  await expect(submitting).toBeDisabled();
  await submitting.evaluate((button) => {
    button.click();
    button.click();
  });
  release();
  await expect(
    publicPage.getByRole('heading', { name: /Thanks for making.*things better/ }),
  ).toBeVisible();
  expect(submissions).toBe(1);
  await publicPage.screenshot({
    path: '.playwright/screenshots/success-mobile.png',
    fullPage: true,
  });
  await visitor.close();

  await page.goto('/admin');
  await expect(
    page.locator('.stat-card').filter({ hasText: 'Total responses' }).locator('strong'),
  ).toHaveText('2');
  await expect(
    page.locator('.stat-card').filter({ hasText: 'Average rating' }).locator('strong'),
  ).toHaveText('4.5/ 5');
  await expect(page.locator('.performance-event')).toHaveText(longTitle);
  await page.getByText('View activity data', { exact: true }).click();
  await expect(page.locator('.chart-data tbody tr')).toHaveCount(30);
  await page.getByText('View activity data', { exact: true }).click();
  await page.getByRole('button', { name: 'About positive feedback' }).focus();
  await expect(page.getByRole('tooltip')).toContainText('rated 4 or 5');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('tooltip')).not.toBeVisible();
  await page.screenshot({ path: '.playwright/screenshots/overview.png', fullPage: true });

  await page.goto('/admin/events');
  await page
    .locator('.event-card')
    .filter({ hasText: longTitle })
    .getByRole('link', { name: '2 responses' })
    .click();
  await expect(page.getByLabel('Event', { exact: true })).not.toHaveValue('');
  await expect(page.locator('.active-filters')).toContainText(longTitle);
  const today = new Date().toISOString().slice(0, 10);
  await page.getByLabel('From (UTC)').fill(today);
  await page.getByLabel('To (UTC)').fill(today);
  await page.getByRole('button', { name: 'Apply filters' }).click();
  await expect(page.locator('tbody tr')).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Previous page' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Next page' })).toBeDisabled();
  await page.getByRole('button', { name: `Remove ${longTitle} filter` }).click();
  await expect(page.getByLabel('Event', { exact: true })).toHaveValue('');
  await page.getByRole('button', { name: /Clear filters \(/ }).click();
  await page.screenshot({
    path: '.playwright/screenshots/feedback-management.png',
    fullPage: true,
  });

  for (const width of [1440, 1024, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/admin', '/admin/feedback', '/admin/events']) {
      await page.goto(route);
      await expect(page.locator('h1')).toBeVisible();
      if (route === '/admin') await expect(page.locator('.stat-card')).toHaveCount(4);
      if (route === '/admin/events') await expect(page.locator('.event-card')).toHaveCount(3);
      if (route === '/admin/feedback') {
        await expect(page.locator('.count-badge')).toHaveText('2');
        if (width <= 1180) {
          await expect(page.locator('.desktop-feedback-table')).not.toBeVisible();
          const card = page
            .locator('.mobile-feedback-card')
            .filter({ hasText: 'inclusive design approachable' });
          await expect(card).toBeVisible();
          await expect(card).toContainText('Organization');
          await expect(card).toContainText('Not answered');
          await card.getByRole('button', { name: 'Read full comment' }).click();
          await expect(card.locator('.response-comment p')).toHaveText(comment.trim());
          await expect(card.getByRole('button', { name: 'Show less' })).toHaveAttribute(
            'aria-expanded',
            'true',
          );
        }
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if (width === 390)
        await page.screenshot({
          path: `.playwright/screenshots/admin-${route === '/admin' ? 'overview' : route.split('/').pop()}-mobile.png`,
          fullPage: true,
        });
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/admin');
  await expect(page.locator('.stat-card')).toHaveCount(4);
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(
    true,
  );
  expect(errors).toEqual([]);
});

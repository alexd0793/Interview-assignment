import { test, expect } from '@playwright/test';

test('User can create a transaction and see it as PENDING', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'New Transaction' }).click();
  await page.getByLabel('Amount').fill('100');
  await page.getByLabel('Recipient').fill('Test User');
  await page.getByRole('button', { name: 'Submit' }).click();

  // Verify success message or redirect
  await expect(page.getByText('Transaction created')).toBeVisible();

  // Check that transaction appears in the list with PENDING status
  const row = page.locator('.transaction-row').first();
  await expect(row).toContainText('PENDING');
});

/*
Tried to replicate real UI elements and interactions based on typical patterns.
Use npx playwright test --project=chromium to run the test in Chromium browser, just to see that the test it's starting.
*/
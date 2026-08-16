import { expect, test } from '@playwright/test';

test('frontend loads successfully', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
});

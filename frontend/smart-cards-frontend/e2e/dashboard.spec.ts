import { expect, test } from '@playwright/test';

test.describe('Dashboard Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the landing dashboard page', async ({ page }) => {
    const dashboard = page.locator('[data-testid="dashboard"]');
    await expect(dashboard).toBeVisible();
  });

  test('should display a header with the application title', async ({ page }) => {
    const header = page.locator('[data-testid="app-header"]');
    await expect(header).toBeVisible();

    const title = page.locator('[data-testid="app-title"]');
    await expect(title).toContainText('Smart Cards');
  });

  test('should display a button to add new cards', async ({ page }) => {
    const addButton = page.locator('[data-testid="add-card-button"]');
    await expect(addButton).toBeVisible();
    await expect(addButton).toContainText('Add Card');
  });

  test('should display a cards list container on the dashboard', async ({ page }) => {
    const cardsList = page.locator('[data-testid="cards-list"]');
    await expect(cardsList).toBeVisible();
  });
});

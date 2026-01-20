import { test, expect } from '@playwright/test';

test.describe('Projects Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects');
  });

  test('should display products page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Products');
  });

  test('should render product cards', async ({ page }) => {
    // Expect at least one product card to be visible
    await expect(page.locator('.grid > div').first()).toBeVisible();
  });

  test('should click filter button', async ({ page }) => {
    // "Clear all filters" is a button
    const clearButton = page.getByText('Clear all filters');
    await expect(clearButton).toBeVisible();
    await clearButton.click();
  });

  test('should click pagination button', async ({ page }) => {
    const nextButton = page.getByLabel('Next page');
    if (await nextButton.isVisible()) {
        await nextButton.click();
        await expect(page.getByLabel('Previous page')).toBeVisible();
    }
  });
});

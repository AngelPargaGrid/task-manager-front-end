import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should display dashboard page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should render stat widgets', async ({ page }) => {
    // Check for at least one stat widget
    await expect(page.locator('div.grid > div').first()).toBeVisible();
  });

  test('should render task list', async ({ page }) => {
    // Check for task list container
    await expect(page.locator('.grid.grid-cols-1.md\\:grid-cols-2')).toBeVisible();
  });

  test('should click add task button', async ({ page }) => {
    await page.click('button[aria-label="Add Task"]');
    // Expect form to appear
    await expect(page.locator('input[placeholder="Enter task title..."]')).toBeVisible();
  });
});

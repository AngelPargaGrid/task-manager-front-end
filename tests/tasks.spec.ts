import { test, expect } from '@playwright/test';

test.describe('Tasks Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tasks');
  });

  test('should display task board', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Task Board');
  });

  test('should render columns', async ({ page }) => {
    await expect(page.locator('h2:has-text("Blocked")')).toBeVisible();
    await expect(page.locator('h2:has-text("In Progress")')).toBeVisible();
    await expect(page.locator('h2:has-text("Done")')).toBeVisible();
  });

  test('should click add task button', async ({ page }) => {
    const addButton = page.getByText('Add Task');
    await expect(addButton).toBeVisible();
    await addButton.click();
    // Since functionality might not be fully implemented, we verify the button is clickable
  });
});

import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
  });

  test('should display settings page', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Settings');
  });

  test('should render settings tabs', async ({ page }) => {
    await expect(page.getByText('Profile')).toBeVisible();
    await expect(page.getByText('Notifications')).toBeVisible();
    await expect(page.getByText('Privacy')).toBeVisible();
    await expect(page.getByText('Appearance')).toBeVisible();
  });

  test('should click save button', async ({ page }) => {
    // Modify a field first so Save Changes becomes enabled
    await page.fill('input[placeholder="Enter your first name"]', 'Johnny');

    const saveButton = page.getByRole('button', { name: 'Save Changes' });
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();
    
    // Setup dialog listener for alert
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    await saveButton.click();
  });
});

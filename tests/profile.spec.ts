import { test, expect } from '@playwright/test';

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile');
  });

  test('should display profile page', async ({ page }) => {
    // Check for user name
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should render user details', async ({ page }) => {
    // Check for role which is passed as prop
    await expect(page.getByText('Project Manager', { exact: false })).toBeVisible();
    // Check for location
    await expect(page.getByText('San Francisco, CA')).toBeVisible();
  });

  test('should click edit profile button', async ({ page }) => {
    const editButton = page.getByText('Edit Profile');
    await expect(editButton).toBeVisible();
    await editButton.click();
  });
});

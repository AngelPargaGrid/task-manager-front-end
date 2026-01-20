import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display sidebar navigation', async ({ page }) => {
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  });

  test('should click dashboard link', async ({ page }) => {
    await page.click('text=Dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should click tasks link', async ({ page }) => {
    await page.click('text=Tasks');
    await expect(page.locator('h1')).toContainText('Task Board');
  });

  test('should click projects link', async ({ page }) => {
    await page.click('text=Projects');
    await expect(page.locator('h1')).toContainText('Products');
  });

  test('should click team link', async ({ page }) => {
    await page.click('text=Team');
    // Assuming Team renders UserProfileDemo
    await expect(page.locator('h1')).toContainText('User Profile Component Demo');
  });

  test('should click calendar link', async ({ page }) => {
    await page.click('text=Calendar');
    await expect(page.locator('h2')).toContainText('Calendar Page');
  });

  test('should click settings link', async ({ page }) => {
    await page.click('text=Settings');
    await expect(page.locator('h2')).toContainText('Settings');
  });
});

/**
 * Dashboard E2E Tests - Page Object Model
 * Run: npx playwright test dashboard-pom
 */
import { test, expect } from '@playwright/test';
import { DashboardPage, LoginPage, SettingsPage } from '../qa-automation/tests/e2e/pages';

const AUTH_TOKEN = 'fake-token';

test.describe('Dashboard (POM)', () => {
  test.beforeEach(async ({ page }) => {
    const baseURL = process.env.BASE_URL || 'http://localhost:5173';
    await page.goto(baseURL);
    await page.evaluate((t) => localStorage.setItem('app_fake_token', t), AUTH_TOKEN);
    await page.reload();
  });

  test('displays dashboard heading', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.heading).toBeVisible();
  });

  test('navigates to settings', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.settingsLink.click();
    const settings = new SettingsPage(page);
    await expect(settings.heading).toBeVisible({ timeout: 10000 });
  });

  test('add task button opens input', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.addTaskButton.click();
    await expect(dashboard.taskInput).toBeVisible();
  });
});

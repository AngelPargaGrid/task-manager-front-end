/**
 * Dashboard Page Object Model
 */
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  constructor(page: Page, baseURL = 'http://localhost:5173') {
    super(page, baseURL);
  }

  async goto() {
    await super.goto('/dashboard');
    await this.waitForLoad();
  }

  get heading() {
    return this.page.locator('h1').filter({ hasText: 'Dashboard' });
  }

  get settingsLink() {
    return this.page.getByRole('link', { name: 'Settings' });
  }

  get addTaskButton() {
    return this.page.locator('button[aria-label="Add Task"]');
  }

  get taskInput() {
    return this.page.locator('input[placeholder="Enter task title..."]');
  }

  async setAuthenticated(token: string) {
    await this.page.goto('/');
    await this.waitForLoad();
    await this.page.evaluate((t) => localStorage.setItem('app_fake_token', t), token);
    await this.page.reload();
  }
}

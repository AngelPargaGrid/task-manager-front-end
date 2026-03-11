/**
 * Base Page Object - All page objects extend this.
 * Provides common navigation and element interactions.
 */
import { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(
    protected readonly page: Page,
    protected readonly baseURL: string = 'http://localhost:5173'
  ) {}

  async goto(path: string = '/') {
    const url = path.startsWith('http') ? path : `${this.baseURL}${path}`;
    await this.page.goto(url);
  }


  async waitForLoad() {
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  getTitle() {
    return this.page.locator('h1').first();
  }

  getByRole(role: 'link' | 'button' | 'heading', options: { name: string | RegExp }) {
    return this.page.getByRole(role, options);
  }
}

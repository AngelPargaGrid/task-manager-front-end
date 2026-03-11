/**
 * Settings / Profile Page Object Model
 */
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class SettingsPage extends BasePage {
  constructor(page: Page, baseURL = 'http://localhost:5173') {
    super(page, baseURL);
  }

  async goto() {
    await super.goto('/settings');
    await this.waitForLoad();
  }

  get heading() {
    return this.page.getByText('Profile Settings');
  }

  get bioInput() {
    return this.page.getByLabel(/bio|about/i);
  }

  get saveButton() {
    return this.page.getByRole('button', { name: /save/i });
  }

  get successMessage() {
    return this.page.getByText(/saved|updated successfully/i);
  }

  async updateBio(bio: string) {
    await this.bioInput.fill(bio);
    await this.saveButton.click();
  }
}

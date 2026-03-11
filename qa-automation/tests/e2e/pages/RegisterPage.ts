/**
 * Register Page Object Model (Multi-step registration)
 */
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class RegisterPage extends BasePage {
  constructor(page: Page, baseURL = 'http://localhost:5173') {
    super(page, baseURL);
  }

  async goto() {
    await super.goto('/');
    await this.page.getByText("Don't have an account? Sign up").waitFor({ state: 'visible', timeout: 15000 });
    await this.page.getByText("Don't have an account? Sign up").click();
    await this.page.getByRole('heading', { level: 2, name: /create your account/i }).waitFor({ state: 'visible', timeout: 10000 });
  }

  get fullNameInput() {
    return this.page.getByLabel('Full Name');
  }

  get emailInput() {
    return this.page.getByLabel('Email address');
  }

  get passwordInput() {
    return this.page.locator('#password');
  }

  get confirmPasswordInput() {
    return this.page.locator('#confirm-password');
  }

  get nextStepButton() {
    return this.page.getByRole('button', { name: /next step/i });
  }

  get createAccountButton() {
    return this.page.getByRole('button', { name: /create account/i });
  }

  async fillStep1(name: string) {
    await this.fullNameInput.fill(name);
    await this.nextStepButton.click();
  }

  async fillStep2(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    await this.nextStepButton.click();
  }

  async submit() {
    await this.createAccountButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.createAccountButton.click();
  }
}

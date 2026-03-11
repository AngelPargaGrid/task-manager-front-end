/**
 * Login Page Object Model
 */
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  constructor(page: Page, baseURL = 'http://localhost:5173') {
    super(page, baseURL);
  }

  async goto() {
    await super.goto('/');
    await this.page.getByText("Don't have an account? Sign up").waitFor({ state: 'visible', timeout: 15000 });
  }

  get emailInput() {
    return this.page.getByLabel(/email/i);
  }

  get passwordInput() {
    return this.page.locator('#password');
  }

  get signInButton() {
    return this.page.getByRole('button', { name: /sign in|login/i });
  }

  get signUpLink() {
    return this.page.getByText("Don't have an account? Sign up");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async goToSignUp() {
    await this.signUpLink.click();
  }
}

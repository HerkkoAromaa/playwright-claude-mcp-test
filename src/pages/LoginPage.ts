import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the login page
 */
export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly errorMessages: Locator;
  readonly needAccountLink: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
    this.errorMessages = page.locator('.error-messages li');
    this.needAccountLink = page.getByRole('link', { name: 'Need an account?' });
  }

  /**
   * Navigate to login page
   */
  async navigate() {
    await super.navigate('login');
    await this.waitForNavigation();
  }

  /**
   * Fill the login form
   * @param email Email to login with
   * @param password Password to login with
   */
  async fillLoginForm(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  /**
   * Submit the login form
   */
  async submitForm() {
    await this.signInButton.click();
    await this.waitForNavigation();
  }

  /**
   * Log in with the given credentials
   * @param email Email to login with
   * @param password Password to login with
   */
  async login(email: string, password: string) {
    await this.navigate();
    await this.fillLoginForm(email, password);
    await this.submitForm();
  }

  /**
   * Get error messages if login fails
   */
  async getErrorMessages(): Promise<string[]> {
    const errors: string[] = [];
    const count = await this.errorMessages.count();

    for (let i = 0; i < count; i++) {
      errors.push((await this.errorMessages.nth(i).textContent()) || '');
    }

    return errors;
  }

  /**
   * Click the "Need an account?" link to navigate to registration page
   */
  async goToRegister() {
    await this.needAccountLink.click();
    await this.waitForNavigation();
  }
}

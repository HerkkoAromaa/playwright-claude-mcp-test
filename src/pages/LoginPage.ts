import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Interface defining the contract for LoginPage
 */
export interface ILoginPage {
  navigate(): Promise<void>;
  fillLoginForm(email: string, password: string): Promise<void>;
  submitForm(): Promise<void>;
  login(email: string, password: string): Promise<void>;
  getErrorMessages(): Promise<string[]>;
  goToRegister(): Promise<void>;
  hasErrors(): Promise<boolean>;
}

/**
 * Page object for the login page
 */
export class LoginPage extends BasePage implements ILoginPage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly signInButton: Locator;
  private readonly errorMessages: Locator;
  private readonly needAccountLink: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = this.getByRole('textbox', 'Email');
    this.passwordInput = this.getByRole('textbox', 'Password');
    this.signInButton = this.getByRole('button', 'Sign in');
    this.errorMessages = this.locator('.error-messages li');
    this.needAccountLink = this.getByRole('link', 'Need an account?');
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
   * Check if there are any error messages
   * @returns True if there are error messages
   */
  async hasErrors(): Promise<boolean> {
    return (await this.errorMessages.count()) > 0;
  }

  /**
   * Get error messages if login fails
   * @returns Array of error message strings
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

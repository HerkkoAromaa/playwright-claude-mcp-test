import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the registration page
 */
export class RegisterPage extends BasePage {
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signUpButton: Locator;
  readonly errorMessages: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.signUpButton = page.getByRole('button', { name: 'Sign up' });
    this.errorMessages = page.locator('.error-messages li');
  }

  /**
   * Navigate to registration page
   */
  async navigate() {
    await this.goto('register');
    await this.waitForNavigation();
  }

  /**
   * Fill out the registration form
   * @param username Username to register with
   * @param email Email to register with
   * @param password Password to register with
   */
  async fillRegistrationForm(
    username: string,
    email: string,
    password: string
  ) {
    await this.usernameInput.fill(username);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  /**
   * Submit the registration form
   */
  async submitForm() {
    await this.signUpButton.click();
    await this.waitForNavigation();
  }

  /**
   * Register a new user
   * @param username Username to register with
   * @param email Email to register with
   * @param password Password to register with
   */
  async registerUser(username: string, email: string, password: string) {
    await this.navigate();
    await this.fillRegistrationForm(username, email, password);
    await this.submitForm();
  }

  /**
   * Get error messages if registration fails
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
   * Check if the sign-up button is enabled
   */
  async isSignUpButtonEnabled(): Promise<boolean> {
    return await this.signUpButton.isEnabled();
  }
}

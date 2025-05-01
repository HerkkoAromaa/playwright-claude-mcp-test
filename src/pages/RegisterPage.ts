import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Interface defining the contract for RegisterPage
 */
export interface IRegisterPage {
  navigate(): Promise<void>;
  fillRegistrationForm(
    username: string,
    email: string,
    password: string
  ): Promise<void>;
  submitForm(): Promise<void>;
  registerUser(
    username: string,
    email: string,
    password: string
  ): Promise<void>;
  getErrorMessages(): Promise<string[]>;
  isSignUpButtonEnabled(): Promise<boolean>;
  hasErrors(): Promise<boolean>;
}

/**
 * Page object for the registration page
 */
export class RegisterPage extends BasePage implements IRegisterPage {
  private readonly usernameInput: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly signUpButton: Locator;
  private readonly errorMessages: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = this.getByRole('textbox', 'Username');
    this.emailInput = this.getByRole('textbox', 'Email');
    this.passwordInput = this.getByRole('textbox', 'Password');
    this.signUpButton = this.getByRole('button', 'Sign up');
    this.errorMessages = this.locator('.error-messages li');
  }

  /**
   * Navigate to registration page
   */
  async navigate() {
    await super.navigate('register');
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
   * Check if there are any error messages
   * @returns True if there are error messages
   */
  async hasErrors(): Promise<boolean> {
    return (await this.errorMessages.count()) > 0;
  }

  /**
   * Get error messages if registration fails
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
   * Check if the sign-up button is enabled
   * @returns True if the sign-up button is enabled
   */
  async isSignUpButtonEnabled(): Promise<boolean> {
    return this.signUpButton.isEnabled();
  }
}

import { BrowserContext, Page } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { TestDataGenerator } from './TestDataGenerator';
import path from 'path';
import fs from 'fs';

/**
 * User credential type definition
 */
export type UserCredentials = {
  username: string;
  email: string;
  password: string;
};

/**
 * AuthManager class to handle all authentication operations
 */
export class AuthManager {
  private static AUTH_DIR = path.join(process.cwd(), '.auth');

  /**
   * Initialize authentication directory
   */
  public static initialize(): void {
    if (!fs.existsSync(this.AUTH_DIR)) {
      fs.mkdirSync(this.AUTH_DIR, { recursive: true });
    }
  }

  /**
   * Create a new authenticated context with a unique user
   */
  public static async createAuthenticatedContext(browser: any): Promise<{
    context: BrowserContext;
    page: Page;
    credentials: UserCredentials;
  }> {
    // Create a new context
    const context = await browser.newContext();
    const page = await context.newPage();

    // Generate random user data
    const credentials = {
      username: TestDataGenerator.generateUsername(),
      email: TestDataGenerator.generateEmail(),
      password: TestDataGenerator.generatePassword(),
    };

    // Register and log in with the new user
    const registerPage = new RegisterPage(page);
    await registerPage.registerUser(
      credentials.username,
      credentials.email,
      credentials.password
    );

    // Make sure we're authenticated
    await page.waitForTimeout(1000);

    return { context, page, credentials };
  }

  /**
   * Get or create a shared authenticated context
   */
  public static async getSharedAuthenticatedContext(browser: any): Promise<{
    context: BrowserContext;
    page: Page;
    credentials: UserCredentials;
  }> {
    const statePath = path.join(this.AUTH_DIR, 'shared-user.json');
    const credsPath = path.join(this.AUTH_DIR, 'shared-user-creds.json');
    let context: BrowserContext;
    let credentials: UserCredentials;

    // Check if we have existing auth state
    if (fs.existsSync(statePath) && fs.existsSync(credsPath)) {
      // Load existing auth state
      context = await browser.newContext({
        storageState: statePath,
      });

      // Load credentials from companion file
      credentials = JSON.parse(fs.readFileSync(credsPath, 'utf-8'));
    } else {
      // Create new user and save auth state
      const {
        context: newContext,
        page,
        credentials: newCreds,
      } = await this.createAuthenticatedContext(browser);

      context = newContext;
      credentials = newCreds;

      // Save authentication state
      await context.storageState({ path: statePath });

      // Save credentials to companion file
      fs.writeFileSync(credsPath, JSON.stringify(credentials), 'utf-8');

      await page.close();
    }

    // Create a page using the authenticated context
    const page = await context.newPage();

    return { context, page, credentials };
  }

  /**
   * Login with provided credentials
   */
  public static async login(
    page: Page,
    email: string,
    password: string
  ): Promise<void> {
    const loginPage = new LoginPage(page);
    await loginPage.loginUser(email, password);
    await page.waitForTimeout(1000);
  }
}

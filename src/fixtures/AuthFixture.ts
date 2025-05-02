import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { TestDataGenerator } from '../utils/TestDataGenerator';
import path from 'path';
import fs from 'fs';

/**
 * User credential type definition
 */
type UserCredentials = {
  username: string;
  email: string;
  password: string;
};

/**
 * Test fixtures for authentication
 */
type AuthFixtures = {
  // Authenticated page using a newly registered user
  authenticatedPage: {
    page: any;
    credentials: UserCredentials;
  };
  // Shared authenticated page (reuses same user across tests)
  sharedAuthenticatedPage: {
    page: any;
    credentials: UserCredentials;
  };
};

/**
 * Directory for storing authentication state
 */
const AUTH_DIR = path.join(process.cwd(), '.auth');

/**
 * Ensure the authentication directory exists
 */
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

/**
 * Path to the shared auth state file
 */
const SHARED_AUTH_STATE_PATH = path.join(AUTH_DIR, 'shared-user.json');

/**
 * Export the extended test with authentication fixtures
 */
export const test = base.extend<AuthFixtures>({
  /**
   * Creates a new user for each test that needs authentication and provides a page
   * logged in as that user
   */
  authenticatedPage: async ({ browser }, use) => {
    // Create a new context with fresh authentication state
    const context = await browser.newContext();
    const page = await context.newPage();

    // Generate random user data
    const username = TestDataGenerator.generateUsername();
    const email = TestDataGenerator.generateEmail();
    const password = TestDataGenerator.generatePassword();
    const userCredentials = { username, email, password };

    // Register and log in with the new user
    const registerPage = new RegisterPage(page);
    await registerPage.registerUser(username, email, password);

    // Make sure we're authenticated
    await page.waitForTimeout(1000); // Small wait to ensure session is established

    // Use the authenticated page in the test
    await use({
      page,
      credentials: userCredentials,
    });

    // Clean up after use
    await context.close();
  },

  /**
   * Provides a shared authenticated user across tests
   * Creates the user once and reuses the auth state
   */
  sharedAuthenticatedPage: async ({ browser }, use) => {
    let credentials: UserCredentials;
    let context = await browser.newContext();

    // Check if we have existing auth state
    if (fs.existsSync(SHARED_AUTH_STATE_PATH)) {
      // Load existing auth state
      context = await browser.newContext({
        storageState: SHARED_AUTH_STATE_PATH,
      });

      // Load credentials from a companion file
      const credPath = SHARED_AUTH_STATE_PATH.replace('.json', '-creds.json');
      if (fs.existsSync(credPath)) {
        credentials = JSON.parse(fs.readFileSync(credPath, 'utf-8'));
      } else {
        // Fallback credentials if file is missing
        credentials = {
          username: 'sharedtestuser',
          email: 'sharedtestuser@example.com',
          password: 'Password123!',
        };
      }
    } else {
      // Create new user and save auth state
      const page = await context.newPage();

      // Generate credentials using TestDataGenerator to ensure consistent format
      const username = TestDataGenerator.generateUsername();
      const email = TestDataGenerator.generateEmail(username);
      const password = TestDataGenerator.generatePassword();
      credentials = { username, email, password };

      // Register and log in
      const registerPage = new RegisterPage(page);
      await registerPage.registerUser(username, email, password);

      // Wait for authentication to complete
      await page.waitForTimeout(1000);

      // Save authentication state
      await context.storageState({ path: SHARED_AUTH_STATE_PATH });

      // Save credentials to a companion file
      fs.writeFileSync(SHARED_AUTH_STATE_PATH.replace('.json', '-creds.json'), JSON.stringify(credentials), 'utf-8');

      await page.close();
    }

    // Create a page using the authenticated context
    const page = await context.newPage();

    // Use the authenticated page in the test
    await use({
      page,
      credentials,
    });

    // Clean up after use
    await context.close();
  },
});

/**
 * Re-export expect from the base test
 */
export { expect } from '@playwright/test';

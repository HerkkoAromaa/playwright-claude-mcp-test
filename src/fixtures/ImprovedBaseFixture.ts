import { test as baseTest } from '@playwright/test';
import { PageManager } from '../manager/PageManager';
import { TestDataGenerator } from '../utils/TestDataGenerator';
import { RegisterPage } from '../pages/RegisterPage';
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
 * Combined fixtures type
 */
type TestFixtures = {
  pageManager: PageManager;
  authenticatedContext: {
    page: any;
    pageManager: PageManager;
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
 * Export the extended test with improved fixtures
 */
export const test = baseTest.extend<TestFixtures>({
  // Page manager fixture - provides access to all page objects
  pageManager: async ({ page }, use) => {
    // Create the PageManager instance for this test
    const pageManager = PageManager.getInstance(page);

    // Use the PageManager in the test
    await use(pageManager);
  },

  // Authenticated context fixture - provides authenticated page and PageManager
  authenticatedContext: async ({ browser }, use) => {
    // Create a new context with fresh authentication state
    const context = await browser.newContext();
    const page = await context.newPage();

    // Generate random user data
    const username = TestDataGenerator.generateUsername();
    const email = TestDataGenerator.generateEmail();
    const password = TestDataGenerator.generatePassword();
    const userCredentials = { username, email, password };

    // Get PageManager for this page
    const pageManager = PageManager.getInstance(page);

    // Register and log in with the new user
    await pageManager.registerPage.registerUser(username, email, password);

    // Make sure we're authenticated
    await page.waitForTimeout(1000); // Small wait to ensure session is established

    // Use the authenticated context in the test
    await use({
      page,
      pageManager,
      credentials: userCredentials,
    });

    // Clean up after use
    await context.close();
  },
});

/**
 * Re-export expect from the base test
 */
export { expect } from '@playwright/test';

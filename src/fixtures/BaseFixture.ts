import { test as baseTest, Page } from '@playwright/test';
import { HomePage, IHomePage } from '../pages/HomePage';
import { LoginPage, ILoginPage } from '../pages/LoginPage';
import { RegisterPage, IRegisterPage } from '../pages/RegisterPage';
import { EditorPage, IEditorPage } from '../pages/EditorPage';
import { TestDataGenerator } from '../utils/TestDataGenerator';
import { PageManager } from '../manager/PageManager';
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
 * Type alias for authenticated page state
 */
export type AuthenticatedPageState = {
  page: Page;
  pageManager: PageManager;
  credentials: UserCredentials;
};

/**
 * Page objects fixture type using interfaces for better abstraction
 */
type PageObjects = {
  // Individual page objects for backward compatibility
  homePage: IHomePage;
  loginPage: ILoginPage;
  registerPage: IRegisterPage;
  editorPage: IEditorPage;

  // Page manager for accessing all page objects in a cleaner way
  pageManager: PageManager;
};

/**
 * Auth fixtures type
 */
type AuthFixtures = {
  // Authenticated page using a newly registered user
  authenticatedPage: AuthenticatedPageState;
  // Shared authenticated page (reuses same user across tests)
  sharedAuthenticatedPage: AuthenticatedPageState;
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
 * Combined fixtures type
 */
type CombinedFixtures = PageObjects & AuthFixtures;

/**
 * Export the extended test with combined fixtures
 */
export const test = baseTest.extend<CombinedFixtures>({
  // Page manager fixture - provides centralized access to all page objects
  pageManager: async ({ page }, use) => {
    await use(PageManager.getInstance(page));
  },

  // Individual page object fixtures - for backward compatibility
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  editorPage: async ({ page }, use) => {
    await use(new EditorPage(page));
  },

  // Auth fixtures with PageManager integration
  authenticatedPage: async ({ browser }, use) => {
    // Create a new context with fresh authentication state
    const context = await browser.newContext();
    const page = await context.newPage();

    // Generate random user data
    const username = TestDataGenerator.generateUsername();
    const email = TestDataGenerator.generateEmail();
    const password = TestDataGenerator.generatePassword();
    const userCredentials = { username, email, password };

    // Get the PageManager for this page
    const pageManager = PageManager.getInstance(page);

    // Register and log in with the new user
    await pageManager.registerPage.registerUser(username, email, password);

    // Make sure we're authenticated
    await page.waitForTimeout(1000); // Small wait to ensure session is established

    // Use the authenticated page in the test
    await use({
      page,
      pageManager,
      credentials: userCredentials,
    });

    // Clean up after use
    await context.close();
  },

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

      // Generate credentials
      const username = `shareduser_${Date.now()}`;
      const email = `shareduser_${Date.now()}@example.com`;
      const password = 'Password123!';
      credentials = { username, email, password };

      // Get PageManager for this page
      const pageManager = PageManager.getInstance(page);

      // Register and log in with the new user
      await pageManager.registerPage.registerUser(username, email, password);

      // Wait for authentication to complete
      await page.waitForTimeout(1000);

      // Save authentication state
      await context.storageState({ path: SHARED_AUTH_STATE_PATH });

      // Save credentials to a companion file
      fs.writeFileSync(
        SHARED_AUTH_STATE_PATH.replace('.json', '-creds.json'),
        JSON.stringify(credentials),
        'utf-8'
      );

      await page.close();
    }

    // Create a page using the authenticated context
    const page = await context.newPage();

    // Get PageManager for this page
    const pageManager = PageManager.getInstance(page);

    // Use the authenticated page in the test
    await use({
      page,
      pageManager,
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

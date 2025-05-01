import { test as baseTest, Page, BrowserContext } from '@playwright/test';
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
 * Type alias for worker-scoped auth state
 */
type WorkerAuthState = {
  context: BrowserContext;
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
  // Authenticated page using a worker-scoped user
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
export const test = baseTest.extend<
  CombinedFixtures,
  { workerAuth: WorkerAuthState }
>({
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

  // Worker-scoped authentication - creates one user per worker
  workerAuth: [
    async ({ browser }, use, workerInfo) => {
      console.log(
        `Setting up worker-scoped authentication for worker ${workerInfo.workerIndex}`
      );

      // Create a unique storage path for this worker
      const workerAuthPath = path.join(
        AUTH_DIR,
        `worker-auth-${workerInfo.workerIndex}.json`
      );
      let context: BrowserContext;
      let credentials: UserCredentials;

      // Check if we have existing auth state for this worker
      if (fs.existsSync(workerAuthPath)) {
        // Load existing auth state
        console.log(
          `Using existing auth state for worker ${workerInfo.workerIndex}`
        );
        context = await browser.newContext({
          storageState: workerAuthPath,
        });

        // Load credentials from the companion file
        const credPath = workerAuthPath.replace('.json', '-creds.json');
        if (fs.existsSync(credPath)) {
          credentials = JSON.parse(fs.readFileSync(credPath, 'utf-8'));
        } else {
          // Fallback credentials if file is missing (should not happen normally)
          credentials = {
            username: `worker_${workerInfo.workerIndex}_user`,
            email: `worker_${workerInfo.workerIndex}@example.com`,
            password: 'Password123!',
          };
        }
      } else {
        // Create new user and save auth state
        console.log(`Creating new user for worker ${workerInfo.workerIndex}`);
        context = await browser.newContext();
        const page = await context.newPage();

        // Generate credentials with worker index to make them recognizable
        const username = `worker${workerInfo.workerIndex}_${Date.now()}`;
        const email = `worker${
          workerInfo.workerIndex
        }_${Date.now()}@example.com`;
        const password = TestDataGenerator.generatePassword();
        credentials = { username, email, password };

        console.log(`Registering user: ${username}`);

        // Get PageManager for this page
        const pageManager = PageManager.getInstance(page);

        // Register and log in with the new user
        await pageManager.registerPage.registerUser(username, email, password);

        // Wait for authentication to complete
        await page.waitForTimeout(1000);

        // Save authentication state
        await context.storageState({ path: workerAuthPath });

        // Save credentials to a companion file
        fs.writeFileSync(
          workerAuthPath.replace('.json', '-creds.json'),
          JSON.stringify(credentials),
          'utf-8'
        );

        await page.close();
      }

      // Provide the worker-scoped authentication to tests
      await use({ context, credentials });

      // Close the context when all tests are done
      await context.close();
    },
    { scope: 'worker' },
  ],

  // Auth fixtures with PageManager integration - now using worker-scoped auth
  authenticatedPage: async ({ workerAuth }, use) => {
    // Create a page using the authenticated context from worker-scoped fixture
    const page = await workerAuth.context.newPage();

    // Get PageManager for this page
    const pageManager = PageManager.getInstance(page);

    // Use the authenticated page in the test
    await use({
      page,
      pageManager,
      credentials: workerAuth.credentials,
    });

    // Clean up the page after the test but keep the context
    await page.close();
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

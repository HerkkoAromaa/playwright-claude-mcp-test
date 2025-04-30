import { test as baseTest } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { EditorPage } from '../pages/EditorPage';
import path from 'path';

/**
 * Page objects fixture type
 */
type PageObjects = {
  homePage: HomePage;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  editorPage: EditorPage;
};

/**
 * Export the extended test with page objects fixtures
 */
export const test = baseTest.extend<PageObjects>({
  // Initialize all page objects
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
});

// Use the authentication setup by default
test.use({ storageState: path.join(process.cwd(), '.auth', 'user.json') });

/**
 * Re-export expect from the base test
 */
export { expect } from '@playwright/test';

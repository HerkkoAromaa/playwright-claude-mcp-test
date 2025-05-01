import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { TestDataGenerator } from '../utils/TestDataGenerator';
import { ApiClient } from '../utils/ApiClient';

/**
 * Global setup function that runs once before all tests
 */
async function globalSetup() {
  // Create necessary directories for test artifacts
  const directories = [
    '.auth',
    'test-results',
    'playwright-report',
    'screenshots',
  ];

  for (const dir of directories) {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  // Perform test data cleanup if enabled via environment variables
  const shouldCleanupData = process.env.CLEANUP_TEST_DATA === 'true';
  if (shouldCleanupData) {
    const baseUrl = process.env.BASE_URL || 'https://conduit.bondaracademy.com';

    try {
      console.log('Starting test data cleanup...');

      // Create a temporary browser for authentication
      const browser = await chromium.launch();
      const context = await browser.newContext();
      const page = await context.newPage();

      // Need to authenticate to clean up data
      const username = `cleanup_${TestDataGenerator.generateUsername()}`;
      const email = `cleanup_${TestDataGenerator.generateEmail()}`;
      const password = TestDataGenerator.generatePassword();

      // Register a temporary user for cleanup operations
      await page.goto(`${baseUrl}/register`);
      await page.getByRole('textbox', { name: 'Username' }).fill(username);
      await page.getByRole('textbox', { name: 'Email' }).fill(email);
      await page.getByRole('textbox', { name: 'Password' }).fill(password);
      await page.getByRole('button', { name: 'Sign up' }).click();

      // Wait for registration to complete
      await page.waitForURL(`${baseUrl}/`);

      // Get auth token for API operations
      const authToken = await context
        .cookies()
        .then((cookies) => cookies.find((c) => c.name === 'token')?.value);

      if (!authToken) {
        throw new Error('Failed to get authentication token');
      }

      // Use API client for cleanup
      const apiClient = await ApiClient.create(baseUrl);
      apiClient.setAuthToken(authToken);

      // Find articles created by our test users
      // This pattern is used to identify test articles
      const testArticlePrefixes = [
        'worker',
        'testuser_',
        'Getting Started with Automation',
      ];

      // Get user's feed to find test articles
      try {
        const response = await apiClient.getArticlesByAuthor(username);
        const articles = response.articles || [];

        // Log how many articles we found
        console.log(`Found ${articles.length} article(s) to examine`);

        // Delete articles that match our test patterns
        let deletedCount = 0;
        for (const article of articles) {
          // Check if this looks like a test article
          const isTestArticle = testArticlePrefixes.some(
            (prefix) =>
              article.title?.includes(prefix) ||
              article.author?.username?.includes(prefix)
          );

          if (isTestArticle && article.slug) {
            try {
              await apiClient.deleteArticle(article.slug);
              deletedCount++;
              console.log(`Deleted article: ${article.title}`);
            } catch (error) {
              console.error(
                `Failed to delete article ${article.title}:`,
                error
              );
            }
          }
        }

        console.log(`Deleted ${deletedCount} test articles`);
      } catch (error) {
        console.error('Error during article cleanup:', error);
      }

      // Clean up by closing browser
      await browser.close();
    } catch (error) {
      console.error('Error during test data cleanup:', error);
    }
  }

  console.log('Global setup complete - directories created');
}

export default globalSetup;

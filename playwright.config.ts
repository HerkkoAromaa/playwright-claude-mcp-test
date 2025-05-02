import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Make retries optional via command line argument */
  retries: process.env.RETRIES ? parseInt(process.env.RETRIES) : 1,
  /* Configure workers to use number of CPUs or environment variable */
  workers: process.env.CI ? 1 : process.env.WORKERS ? parseInt(process.env.WORKERS) : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    [
      'allure-playwright',
      {
        detail: true,
        outputFolder: 'allure-results',
        suiteTitle: false,
      },
    ],
  ],
  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'test-results/',
  /* Timeout settings */
  timeout: 30000,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'https://conduit.bondaracademy.com',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Capture screenshot after each test failure */
    screenshot: 'only-on-failure',

    /* Record video only when retrying a test */
    video: 'on-first-retry',

    /* Viewport size */
    viewport: { width: 1280, height: 720 },

    /* Automatically wait for actionability */
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Generate browser projects dynamically
    ...generateBrowserProjects([
      { name: 'chromium', device: 'Desktop Chrome' },
      { name: 'firefox', device: 'Desktop Firefox' },
      { name: 'webkit', device: 'Desktop Safari' },
      { name: 'mobile', device: 'Pixel 5', label: 'Mobile Chrome' },
    ]),
  ],

  /* Create directories for test artifacts */
  globalSetup: require.resolve('./src/fixtures/globalSetup.ts'),
});

/**
 * Helper function to generate browser projects with consistent configuration
 */
function generateBrowserProjects(browserConfigs) {
  return browserConfigs.map(config => ({
    name: config.label || config.name,
    use: {
      ...devices[config.device],
      // Browser-specific storage state will be set dynamically in tests
    },
    dependencies: ['setup'],
  }));
}

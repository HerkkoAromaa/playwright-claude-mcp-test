import { Locator, Page } from '@playwright/test';

/**
 * Base page object that provides common functionality for all pages
 */
export class BasePage {
  readonly page: Page;
  readonly baseUrl: string;

  /**
   * Create a new BasePage
   * @param page Playwright page object
   */
  constructor(page: Page) {
    this.page = page;
    this.baseUrl = 'https://conduit.bondaracademy.com';
  }

  /**
   * Navigate to a specific path on the site
   * @param path Path to navigate to (appended to baseUrl)
   */
  async goto(path: string = ''): Promise<void> {
    await this.page.goto(`${this.baseUrl}/${path}`);
  }

  /**
   * Get the current URL
   */
  async getUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if an element is visible
   * @param locator Element locator
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }
}

import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage class that provides common functionality for all page objects
 */
export abstract class BasePage {
  protected page: Page;

  /**
   * Base constructor for all page classes
   * @param page Playwright page object
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a URL relative to the base URL
   * @param path Path relative to the base URL
   */
  async navigate(path: string): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Get the current URL
   * @returns The current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Check if page contains text
   * @param text Text to check for
   */
  async containsText(text: string): Promise<void> {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill an input field
   * @param selector Selector for the input field
   * @param value Value to fill
   */
  async fill(selector: string | Locator, value: string): Promise<void> {
    const locator =
      typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.fill(value);
  }

  /**
   * Click an element
   * @param selector Selector for the element
   */
  async click(selector: string | Locator): Promise<void> {
    const locator =
      typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.click();
  }

  /**
   * Wait for an element to be visible
   * @param selector Selector for the element
   */
  async waitForVisible(selector: string | Locator): Promise<void> {
    const locator =
      typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.waitFor({ state: 'visible' });
  }

  /**
   * Take a screenshot and save it with a unique name
   * @param name Name to use for the screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `./screenshots/${name}_${Date.now()}.png`,
    });
  }
}

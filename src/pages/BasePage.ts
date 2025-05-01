import { Page, Locator, expect } from '@playwright/test';

/**
 * Type aliases for common patterns
 */
export type ElementSelector = string | Locator;
export type PageAction = () => Promise<void>;

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
  async navigate(path: string) {
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
  async containsText(text: string) {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill an input field
   * @param selector Selector for the input field
   * @param value Value to fill
   */
  async fill(selector: ElementSelector, value: string) {
    const locator =
      typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.fill(value);
  }

  /**
   * Click an element
   * @param selector Selector for the element
   */
  async click(selector: ElementSelector) {
    const locator =
      typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.click();
  }

  /**
   * Wait for an element to be visible
   * @param selector Selector for the element
   */
  async waitForVisible(selector: ElementSelector) {
    const locator =
      typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.waitFor({ state: 'visible' });
  }

  /**
   * Take a screenshot and save it with a unique name
   * @param name Name to use for the screenshot
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `./screenshots/${name}_${Date.now()}.png`,
    });
  }
}

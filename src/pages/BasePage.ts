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
   * Helper method to create a locator by role
   * @param role The role of the element
   * @param name The name or label of the element
   * @returns Locator for the element
   */
  protected getByRole(role: string, name: string | RegExp): Locator {
    return this.page.getByRole(role, { name });
  }

  /**
   * Helper method to create a locator by test ID
   * @param testId The test ID attribute
   * @returns Locator for the element
   */
  protected getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Helper method to create a locator by CSS selector
   * @param selector CSS selector
   * @returns Locator for the element
   */
  protected locator(selector: string): Locator {
    return this.page.locator(selector);
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
   * Check if an element is visible
   * @param selector Selector for the element
   * @returns true if the element is visible
   */
  async isVisible(selector: ElementSelector): Promise<boolean> {
    const locator =
      typeof selector === 'string' ? this.page.locator(selector) : selector;
    return locator.isVisible();
  }

  /**
   * Get text content of an element
   * @param selector Selector for the element
   * @returns Text content of the element
   */
  async getText(selector: ElementSelector): Promise<string | null> {
    const locator =
      typeof selector === 'string' ? this.page.locator(selector) : selector;
    return locator.textContent();
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

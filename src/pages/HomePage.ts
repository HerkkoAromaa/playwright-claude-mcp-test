import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the Home page
 */
export class HomePage extends BasePage {
  readonly yourFeedTab: Locator;
  readonly globalFeedTab: Locator;
  readonly articlePreviews: Locator;
  readonly navHome: Locator;
  readonly navSignIn: Locator;
  readonly navSignUp: Locator;
  readonly navNewArticle: Locator;
  readonly navSettings: Locator;
  readonly navProfile: Locator;
  readonly userProfileLink: Locator;
  readonly articleTitles: Locator;
  readonly tagList: Locator;

  constructor(page: Page) {
    super(page);
    // Navigation elements - using role-based selectors for better reliability
    this.navHome = page.getByRole('link', { name: 'Home' });
    this.navSignIn = page.getByRole('link', { name: 'Sign in' });
    this.navSignUp = page.getByRole('link', { name: 'Sign up' });
    this.navNewArticle = page.getByRole('link', { name: /New Article/ });
    this.navSettings = page.getByRole('link', { name: /Settings/ });
    this.userProfileLink = page
      .locator('a[href^="/profile/"]')
      .filter({ hasText: /^(?!Home|Sign)/ });
    this.navProfile = this.userProfileLink;

    // Feed tabs
    this.yourFeedTab = page
      .getByRole('listitem')
      .filter({ hasText: 'Your Feed' });
    this.globalFeedTab = page
      .getByRole('listitem')
      .filter({ hasText: 'Global Feed' });

    // Article elements - using more specific selectors
    this.articlePreviews = page.locator('div.article-preview');
    this.articleTitles = page.getByRole('heading', { level: 1 });
    this.tagList = page.locator('.tag-list');
  }

  /**
   * Navigate to the home page
   */
  async navigate() {
    await this.goto();
    await this.waitForNavigation();
  }

  /**
   * Click the sign in navigation link
   */
  async clickSignIn() {
    await this.navSignIn.click();
    await this.waitForNavigation();
  }

  /**
   * Click the sign up navigation link
   */
  async clickSignUp() {
    await this.navSignUp.click();
    await this.waitForNavigation();
  }

  /**
   * Click the new article button
   */
  async clickNewArticle() {
    await this.navNewArticle.click();
    await this.waitForNavigation();
  }

  /**
   * Click the settings button
   */
  async clickSettings() {
    await this.navSettings.click();
    await this.waitForNavigation();
  }

  /**
   * Switch to your feed tab
   */
  async clickYourFeed() {
    await this.yourFeedTab.click();
    await this.waitForNavigation();
  }

  /**
   * Switch to global feed tab
   */
  async clickGlobalFeed() {
    await this.globalFeedTab.click();
    await this.waitForNavigation();
  }

  /**
   * Get the number of article previews on the page
   */
  async getArticleCount(): Promise<number> {
    return await this.articlePreviews.count();
  }

  /**
   * Check if user is authenticated by looking for authenticated nav items
   */
  async isAuthenticated(): Promise<boolean> {
    return (
      (await this.navNewArticle.isVisible()) &&
      (await this.userProfileLink.isVisible())
    );
  }

  /**
   * Get the username of the currently logged in user
   */
  async getLoggedInUsername(): Promise<string | null> {
    if (await this.isAuthenticated()) {
      return await this.userProfileLink.textContent();
    }
    return null;
  }
}

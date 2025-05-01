import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Interface defining the contract for HomePage
 */
export interface IHomePage {
  navigate(): Promise<void>;
  clickSignIn(): Promise<void>;
  clickSignUp(): Promise<void>;
  clickNewArticle(): Promise<void>;
  clickSettings(): Promise<void>;
  clickYourFeed(): Promise<void>;
  clickGlobalFeed(): Promise<void>;
  getArticleCount(): Promise<number>;
  isAuthenticated(): Promise<boolean>;
  getLoggedInUsername(): Promise<string | null>;
  getArticleTitle(index: number): Promise<string | null>;
  getTagList(): Promise<string[]>;
}

/**
 * Page object for the Home page
 */
export class HomePage extends BasePage implements IHomePage {
  private readonly yourFeedTab: Locator;
  private readonly globalFeedTab: Locator;
  private readonly articlePreviews: Locator;
  private readonly navHome: Locator;
  private readonly navSignIn: Locator;
  private readonly navSignUp: Locator;
  private readonly navNewArticle: Locator;
  private readonly navSettings: Locator;
  private readonly navProfile: Locator;
  private readonly userProfileLink: Locator;
  private readonly articleTitles: Locator;
  private readonly tagList: Locator;

  constructor(page: Page) {
    super(page);
    // Navigation elements - using our helper methods for better readability
    this.navHome = this.getByRole('link', 'Home');
    this.navSignIn = this.getByRole('link', 'Sign in');
    this.navSignUp = this.getByRole('link', 'Sign up');
    this.navNewArticle = this.getByRole('link', /New Article/);
    this.navSettings = this.getByRole('link', /Settings/);
    this.userProfileLink = this.locator('a[href^="/profile/"]').filter({
      hasText: /^(?!Home|Sign)/,
    });
    this.navProfile = this.userProfileLink;

    // Feed tabs
    this.yourFeedTab = this.page
      .getByRole('listitem')
      .filter({ hasText: 'Your Feed' });
    this.globalFeedTab = this.page
      .getByRole('listitem')
      .filter({ hasText: 'Global Feed' });

    // Article elements - using more specific selectors
    this.articlePreviews = this.locator('div.article-preview');
    this.articleTitles = this.getByRole('heading', { level: 1 });
    this.tagList = this.locator('.tag-list');
  }

  /**
   * Navigate to the home page
   */
  async navigate() {
    await super.navigate('/');
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
    return this.articlePreviews.count();
  }

  /**
   * Get the title of an article at a specific index
   * @param index The index of the article
   */
  async getArticleTitle(index: number): Promise<string | null> {
    if (await this.articleTitles.nth(index).isVisible()) {
      return this.articleTitles.nth(index).textContent();
    }
    return null;
  }

  /**
   * Get the list of tags shown on the page
   */
  async getTagList(): Promise<string[]> {
    const tags: string[] = [];
    const count = await this.tagList.locator('.tag-pill').count();

    for (let i = 0; i < count; i++) {
      const tagText = await this.tagList
        .locator('.tag-pill')
        .nth(i)
        .textContent();
      if (tagText) tags.push(tagText);
    }

    return tags;
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
      return this.userProfileLink.textContent();
    }
    return null;
  }
}

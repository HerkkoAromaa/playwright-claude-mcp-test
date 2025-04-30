import { Page } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { EditorPage } from '../pages/EditorPage';

/**
 * PageManager class that manages all page objects
 * This class follows the Singleton pattern to ensure only one instance exists
 */
export class PageManager {
  private static instance: PageManager;
  private _page: Page;

  // Page objects
  private _homePage: HomePage;
  private _loginPage: LoginPage;
  private _registerPage: RegisterPage;
  private _editorPage: EditorPage;

  /**
   * Private constructor to prevent direct instantiation
   * @param page Playwright page object
   */
  private constructor(page: Page) {
    this._page = page;
    this.initializePages();
  }

  /**
   * Get the PageManager instance (creates one if it doesn't exist)
   * @param page Playwright page object
   * @returns PageManager instance
   */
  public static getInstance(page: Page): PageManager {
    if (!PageManager.instance || PageManager.instance._page !== page) {
      PageManager.instance = new PageManager(page);
    }
    return PageManager.instance;
  }

  /**
   * Initialize all page objects
   */
  private initializePages(): void {
    this._homePage = new HomePage(this._page);
    this._loginPage = new LoginPage(this._page);
    this._registerPage = new RegisterPage(this._page);
    this._editorPage = new EditorPage(this._page);
  }

  /**
   * Update the page object if the context changes
   * @param page New page object
   */
  public setPage(page: Page): void {
    this._page = page;
    this.initializePages();
  }

  // Getters for all page objects
  get homePage(): HomePage {
    return this._homePage;
  }

  get loginPage(): LoginPage {
    return this._loginPage;
  }

  get registerPage(): RegisterPage {
    return this._registerPage;
  }

  get editorPage(): EditorPage {
    return this._editorPage;
  }
}

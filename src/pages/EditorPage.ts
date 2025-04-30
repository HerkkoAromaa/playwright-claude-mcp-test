import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the article editor page
 */
export class EditorPage extends BasePage {
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly bodyInput: Locator;
  readonly tagsInput: Locator;
  readonly publishButton: Locator;
  readonly tagList: Locator;

  constructor(page: Page) {
    super(page);
    this.titleInput = page.getByRole('textbox', { name: 'Article Title' });
    this.descriptionInput = page.getByRole('textbox', {
      name: "What's this article about?",
    });
    this.bodyInput = page.getByRole('textbox', {
      name: 'Write your article (in markdown)',
    });
    this.tagsInput = page.getByRole('textbox', { name: 'Enter tags' });
    this.publishButton = page.getByRole('button', { name: 'Publish Article' });
    this.tagList = page.locator('.tag-list');
  }

  /**
   * Navigate to the editor page
   */
  async navigate() {
    await this.goto('editor');
    await this.waitForNavigation();
  }

  /**
   * Navigate to edit an existing article
   * @param slug The article slug to edit
   */
  async navigateToEdit(slug: string) {
    await this.goto(`editor/${slug}`);
    await this.waitForNavigation();
  }

  /**
   * Fill the article form
   * @param title Article title
   * @param description Article description
   * @param body Article body content
   * @param tags Array of tags
   */
  async fillArticleForm(
    title: string,
    description: string,
    body: string,
    tags: string[] = []
  ) {
    await this.titleInput.fill(title);
    await this.descriptionInput.fill(description);
    await this.bodyInput.fill(body);

    // Add tags one by one
    for (const tag of tags) {
      await this.tagsInput.fill(tag);
      await this.tagsInput.press('Enter');
    }
  }

  /**
   * Submit the article form
   */
  async publishArticle() {
    await this.publishButton.click();
    await this.waitForNavigation();
  }

  /**
   * Create a new article
   * @param title Article title
   * @param description Article description
   * @param body Article body content
   * @param tags Array of tags
   */
  async createArticle(
    title: string,
    description: string,
    body: string,
    tags: string[] = []
  ) {
    await this.navigate();
    await this.fillArticleForm(title, description, body, tags);
    await this.publishArticle();
  }

  /**
   * Check if the publish button is enabled
   */
  async isPublishButtonEnabled(): Promise<boolean> {
    return await this.publishButton.isEnabled();
  }
}

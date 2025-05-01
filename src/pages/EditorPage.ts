import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Interface defining the contract for EditorPage
 */
export interface IEditorPage {
  navigate(): Promise<void>;
  navigateToEdit(slug: string): Promise<void>;
  fillArticleForm(
    title: string,
    description: string,
    body: string,
    tags?: string[]
  ): Promise<void>;
  publishArticle(): Promise<void>;
  createArticle(
    title: string,
    description: string,
    body: string,
    tags?: string[]
  ): Promise<void>;
  isPublishButtonEnabled(): Promise<boolean>;
  getTagList(): Promise<string[]>;
  removeTag(tagIndex: number): Promise<void>;
}

/**
 * Page object for the article editor page
 */
export class EditorPage extends BasePage implements IEditorPage {
  private readonly titleInput: Locator;
  private readonly descriptionInput: Locator;
  private readonly bodyInput: Locator;
  private readonly tagsInput: Locator;
  private readonly publishButton: Locator;
  private readonly tagList: Locator;

  constructor(page: Page) {
    super(page);
    this.titleInput = this.getByRole('textbox', 'Article Title');
    this.descriptionInput = this.getByRole(
      'textbox',
      "What's this article about?"
    );
    this.bodyInput = this.getByRole(
      'textbox',
      'Write your article (in markdown)'
    );
    this.tagsInput = this.getByRole('textbox', 'Enter tags');
    this.publishButton = this.getByRole('button', 'Publish Article');
    this.tagList = this.locator('.tag-list');
  }

  /**
   * Navigate to the editor page
   */
  async navigate() {
    await super.navigate('editor');
    await this.waitForNavigation();
  }

  /**
   * Navigate to edit an existing article
   * @param slug The article slug to edit
   */
  async navigateToEdit(slug: string) {
    await super.navigate(`editor/${slug}`);
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
   * Get the list of added tags
   * @returns Array of tag strings
   */
  async getTagList(): Promise<string[]> {
    const tags: string[] = [];
    const count = await this.tagList.locator('.tag-default').count();

    for (let i = 0; i < count; i++) {
      const tagText = await this.tagList
        .locator('.tag-default')
        .nth(i)
        .textContent();
      if (tagText) {
        // Remove the "× " part that appears before the tag text
        const cleanedTag = tagText.replace(/^× /, '');
        tags.push(cleanedTag);
      }
    }

    return tags;
  }

  /**
   * Remove a tag at the specified index
   * @param tagIndex Index of the tag to remove
   */
  async removeTag(tagIndex: number): Promise<void> {
    const tagElements = this.tagList.locator('.tag-default');
    const count = await tagElements.count();

    if (tagIndex >= 0 && tagIndex < count) {
      await tagElements.nth(tagIndex).click();
    }
  }

  /**
   * Check if the publish button is enabled
   * @returns True if the publish button is enabled
   */
  async isPublishButtonEnabled(): Promise<boolean> {
    return this.publishButton.isEnabled();
  }
}

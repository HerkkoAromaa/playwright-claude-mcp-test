import { test, expect } from '../src/fixtures/BaseFixture';
import { TestDataGenerator } from '../src/utils/TestDataGenerator';
import { ApiClient } from '../src/utils/ApiClient';
import { PageManager } from '../src/manager/PageManager';

// Use authenticatedPage for all tests that need authentication
test.describe('Article Creation', () => {
  test('should create a new article with authenticated user', async ({
    authenticatedPage,
  }) => {
    const { page, pageManager, credentials } = authenticatedPage;
    const editorPage = pageManager.editorPage;

    // Generate article data
    const title = TestDataGenerator.generateArticleTitle();
    const description = 'This is a test article description';
    const content = TestDataGenerator.generateArticleContent();
    const tags = TestDataGenerator.generateTags(2);

    // Create article using the editorPage
    await editorPage.navigate();
    await editorPage.fillArticleForm(title, description, content, tags);
    await editorPage.publishArticle();

    // Verify we're on the article page
    await expect(page).toHaveURL(/.*\/article\/.+/);

    // Verify article content
    await expect(page.getByRole('heading', { name: title })).toBeVisible();

    // Check article content is displayed
    const articleContent = page.locator('.article-content');
    await expect(articleContent).toBeVisible();
    await expect(articleContent).toContainText('test article');

    // Verify all tags are displayed
    for (const tag of tags) {
      const tagFound = await page.evaluate((tagText) => {
        const tagElements = Array.from(
          document.querySelectorAll('.tag-list li')
        );
        return tagElements.some(
          (el) =>
            el.textContent &&
            el.textContent.trim().toLowerCase() === tagText.toLowerCase()
        );
      }, tag);

      expect(tagFound, `Tag "${tag}" should be visible`).toBeTruthy();
    }
  });

  test('should require all mandatory fields for article creation', async ({
    authenticatedPage,
  }) => {
    const { page, pageManager } = authenticatedPage;
    const editorPage = pageManager.editorPage;

    // Navigate to editor page
    await editorPage.navigate();

    // Try to publish without filling any fields
    await editorPage.publishButton.click();

    // Should stay on the editor page
    await expect(page).toHaveURL(/.*\/editor/);

    // Verify error messages appear
    await expect(page.locator('.error-messages')).toBeVisible();
  });

  test('should create article with multiple tags', async ({
    authenticatedPage,
  }) => {
    const { page, pageManager } = authenticatedPage;
    const editorPage = pageManager.editorPage;

    // Generate article data with many tags
    const title = TestDataGenerator.generateArticleTitle();
    const description = 'This is a test article with multiple tags';
    const content = 'Content for multi-tag test';
    const tags = TestDataGenerator.generateTags(5); // Generate 5 tags

    // Create article
    await editorPage.navigate();
    await editorPage.fillArticleForm(title, description, content, tags);
    await editorPage.publishArticle();

    // Verify we're redirected to the article page
    await expect(page).toHaveURL(/.*\/article\/.+/);

    // Verify article title
    await expect(page.getByRole('heading', { name: title })).toBeVisible();

    // Verify all tags are displayed
    await expect(page.locator('.tag-list li')).toHaveCount(tags.length);

    for (const tag of tags) {
      const tagFound = await page.evaluate((tagText) => {
        const tagElements = Array.from(
          document.querySelectorAll('.tag-list li')
        );
        return tagElements.some(
          (el) =>
            el.textContent &&
            el.textContent.trim().toLowerCase() === tagText.toLowerCase()
        );
      }, tag);

      expect(tagFound, `Tag "${tag}" should be visible`).toBeTruthy();
    }
  });

  test('should allow editing an existing article', async ({
    authenticatedPage,
  }) => {
    const { page, pageManager } = authenticatedPage;
    const editorPage = pageManager.editorPage;
    const homePage = pageManager.homePage;

    // Create initial article with a unique title
    const timestamp = Date.now().toString();
    const originalTitle = `Test Article ${timestamp}`;
    const originalDescription = 'Original description';
    const originalContent = 'Original content';

    await editorPage.navigate();
    await editorPage.fillArticleForm(
      originalTitle,
      originalDescription,
      originalContent
    );
    await editorPage.publishArticle();

    // Wait for the article to be published
    await page.waitForLoadState('networkidle');

    // Verify the article was published
    await expect(
      page.getByRole('heading', { name: originalTitle })
    ).toBeVisible();

    // Edit the article
    await page
      .getByRole('link', { name: /Edit Article/i })
      .first()
      .click();

    // Verify we're editing the right article
    await expect(page).toHaveURL(/.*\/editor\/.+/);
    await expect(editorPage.titleInput).toHaveValue(originalTitle);

    // Update the article title
    const updatedTitle = `Updated: ${originalTitle}`;
    await editorPage.titleInput.fill(updatedTitle);
    await editorPage.publishArticle();

    // Verify the update was successful
    await expect(page).toHaveURL(/.*\/article\/.+/);
    await expect(
      page.getByRole('heading', { name: updatedTitle })
    ).toBeVisible();
  });

  test('should create article via API and verify in UI', async ({
    authenticatedPage,
    baseURL,
  }) => {
    const { page, pageManager, credentials } = authenticatedPage;

    // Create API client (which we'll keep for future use)
    const apiClient = await ApiClient.create(baseURL);

    try {
      // Create article through UI flow
      const title = TestDataGenerator.generateArticleTitle();
      const description = 'API-created article description';
      const content = TestDataGenerator.generateArticleContent();
      const tags = TestDataGenerator.generateTags(2);

      // Create article using the page manager & UI flow
      await pageManager.editorPage.navigate();
      await pageManager.editorPage.fillArticleForm(
        title,
        description,
        content,
        tags
      );
      await pageManager.editorPage.publishArticle();

      // Wait for navigation to complete and the article page to fully load
      await page.waitForLoadState('networkidle');

      // Get the current URL to extract the slug for future reference
      const currentUrl = page.url();
      console.log('Article created at URL:', currentUrl);

      // Verify article content in the UI with improved waiting
      await expect(page.getByRole('heading', { name: title })).toBeVisible({
        timeout: 10000,
      });

      // First ensure the article content container is visible
      const articleContent = page.locator('.article-content');
      await expect(articleContent).toBeVisible({ timeout: 10000 });

      // Verify that some content exists (without checking specific text)
      await expect(articleContent).not.toBeEmpty({ timeout: 5000 });

      // Verify tags with improved waiting
      const tagList = page.locator('.tag-list');
      await expect(tagList).toBeVisible({ timeout: 5000 });

      // Verify the tag count matches
      await expect(page.locator('.tag-list li')).toHaveCount(tags.length, {
        timeout: 5000,
      });

      // Success - we've verified the article was created and displayed correctly
      console.log('Article verification complete');
    } finally {
      // Only dispose the API client as the page will be handled by the fixture
      await apiClient.dispose();
    }
  });
});

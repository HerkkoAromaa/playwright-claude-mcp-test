import { test as baseTest } from '@playwright/test';
import { ApiClient } from '../utils/ApiClient';
import { TestDataGenerator } from '../utils/TestDataGenerator';

/**
 * Test data types for tracking created entities
 */
export type TestArticle = {
  title: string;
  description: string;
  body: string;
  tagList: string[];
  slug?: string;
};

export type TestUser = {
  username: string;
  email: string;
  password: string;
  token?: string;
};

/**
 * Test data fixture for creating and tracking test data
 */
export type TestDataState = {
  apiClient: ApiClient;
  articles: TestArticle[];
  users: TestUser[];

  // Methods to create test data
  createUser(): Promise<TestUser>;
  registerAndLoginUser(user?: Partial<TestUser>): Promise<TestUser>;
  createArticle(
    author?: TestUser,
    options?: Partial<TestArticle>
  ): Promise<TestArticle>;
};

// Default API URL if not provided
const DEFAULT_API_URL = 'https://conduit.bondaracademy.com';

/**
 * Extend the base test with the test data fixture
 */
export const test = baseTest.extend<
  {},
  {
    testData: TestDataState;
  }
>({
  // Worker-scoped test data fixture - note the empty {} for test-scoped fixtures
  testData: [
    async ({}, use, workerInfo) => {
      // Get the base URL from the environment or use default
      // We cannot use baseURL fixture as it's test-scoped
      const baseUrl = process.env.BASE_URL || DEFAULT_API_URL;

      // Set up API client
      const apiClient = await ApiClient.create(baseUrl);

      // Storage for created test data
      const articles: TestArticle[] = [];
      const users: TestUser[] = [];

      // Create the test data state
      const testData: TestDataState = {
        apiClient,
        articles,
        users,

        // Generate a test user with random data
        async createUser(): Promise<TestUser> {
          const user: TestUser = {
            username: TestDataGenerator.generateUsername(),
            email: TestDataGenerator.generateEmail(),
            password: TestDataGenerator.generatePassword(),
          };

          users.push(user);
          return user;
        },

        // Register and log in a user via API
        async registerAndLoginUser(
          userPartial?: Partial<TestUser>
        ): Promise<TestUser> {
          // Create a new user or use the provided partial info
          const user: TestUser = {
            username:
              userPartial?.username || TestDataGenerator.generateUsername(),
            email: userPartial?.email || TestDataGenerator.generateEmail(),
            password:
              userPartial?.password || TestDataGenerator.generatePassword(),
          };

          try {
            // Register the user via API
            const response = await apiClient.register(user);
            user.token = response.token;

            // Add to tracking array
            users.push(user);
            return user;
          } catch (error) {
            console.error(`Failed to register user ${user.username}:`, error);
            throw error;
          }
        },

        // Create an article via API or just generate data
        async createArticle(
          author?: TestUser,
          options?: Partial<TestArticle>
        ): Promise<TestArticle> {
          const article: TestArticle = {
            title: options?.title || TestDataGenerator.generateArticleTitle(),
            description: options?.description || `Description for test article`,
            body: options?.body || TestDataGenerator.generateArticleContent(),
            tagList: options?.tagList || TestDataGenerator.generateTags(),
          };

          // If we have an authenticated user, create the article via API
          if (author?.token) {
            try {
              apiClient.setAuthToken(author.token);
              const response = await apiClient.createArticle(
                article.title,
                article.description,
                article.body,
                article.tagList
              );

              article.slug = response.article.slug;
            } catch (error) {
              console.error(`Failed to create article via API:`, error);
              // Continue even if API creation fails - return the generated data
            }
          }

          // Add to tracking array
          articles.push(article);
          return article;
        },
      };

      // Provide the test data fixture to tests
      await use(testData);

      // Clean up after tests if needed
      try {
        // Only delete articles that were created via API and have a slug
        for (const article of articles) {
          if (article.slug) {
            try {
              // Find a user with a token to delete the article
              const authorToken = users.find((u) => u.token)?.token;
              if (authorToken) {
                apiClient.setAuthToken(authorToken);
                await apiClient.deleteArticle(article.slug);
                console.log(`Cleaned up article: ${article.title}`);
              }
            } catch (error) {
              console.error(
                `Failed to clean up article ${article.title}:`,
                error
              );
            }
          }
        }
      } catch (e) {
        console.error('Error during test data cleanup:', e);
      } finally {
        await apiClient.dispose();
      }
    },
    { scope: 'worker' },
  ],
});

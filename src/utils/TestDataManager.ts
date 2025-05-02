import { APIRequestContext } from '@playwright/test';
import { ApiClient } from './ApiClient';
import { TestDataGenerator } from './TestDataGenerator';
import fs from 'fs';
import path from 'path';

/**
 * Types for different test data entities
 */
export type TestUser = {
  id?: string;
  username: string;
  email: string;
  password: string;
  token?: string;
  createdAt?: Date;
};

export type TestArticle = {
  id?: string;
  slug?: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  author?: string; // Username of the author
  createdAt?: Date;
};

export type TestComment = {
  id?: string;
  body: string;
  articleSlug?: string;
  author?: string; // Username of the author
  createdAt?: Date;
};

/**
 * Environment configuration for test data
 */
export type TestEnvironment = 'dev' | 'staging' | 'prod' | 'local';

/**
 * Test Data Manager class responsible for creating, tracking, and cleaning up test data
 */
export class TestDataManager {
  private static instance: TestDataManager;
  private apiClient: ApiClient | null = null;
  private baseUrl: string;
  private environment: TestEnvironment;

  // Storage for created test data to enable cleanup
  private users: Map<string, TestUser> = new Map();
  private articles: Map<string, TestArticle> = new Map();
  private comments: Map<string, TestComment> = new Map();

  // Path for saving data between test runs
  private readonly dataFilePath: string;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor(baseUrl: string, environment: TestEnvironment = 'dev') {
    this.baseUrl = baseUrl;
    this.environment = environment;

    // Set up data persistence file path
    const dataDir = path.join(process.cwd(), '.test-data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.dataFilePath = path.join(dataDir, `${environment}-data.json`);

    // Load any previously saved data
    this.loadPersistedData();
  }

  /**
   * Get the TestDataManager instance (creates one if it doesn't exist)
   */
  public static getInstance(baseUrl: string, environment: TestEnvironment = 'dev'): TestDataManager {
    if (!TestDataManager.instance) {
      TestDataManager.instance = new TestDataManager(baseUrl, environment);
    }
    return TestDataManager.instance;
  }

  /**
   * Initialize the API client
   */
  public async initApiClient(): Promise<ApiClient> {
    if (!this.apiClient) {
      this.apiClient = await ApiClient.create(this.baseUrl);
    }
    return this.apiClient;
  }

  /**
   * Create a test user with the option to register via API
   */
  public async createUser(register: boolean = false): Promise<TestUser> {
    // Generate unique user data
    const username = TestDataGenerator.generateUsername();
    const email = TestDataGenerator.generateEmail();
    const password = TestDataGenerator.generatePassword();

    const user: TestUser = {
      username,
      email,
      password,
      createdAt: new Date(),
    };

    // Register the user via API if requested
    if (register) {
      const api = await this.initApiClient();
      await api.register({ username, email, password });

      // Get additional user details from API
      const userData = await api.getCurrentUser();
      user.token = userData.user.token;
      user.id = userData.user.id;
    }

    // Store the user for later cleanup
    this.users.set(username, user);
    this.persistData();

    return user;
  }

  /**
   * Create a test article with the option to publish via API
   */
  public async createArticle(
    author?: TestUser,
    publish: boolean = false,
    articleData?: Partial<TestArticle>
  ): Promise<TestArticle> {
    // Generate article data
    const title = articleData?.title || TestDataGenerator.generateArticleTitle();
    const description = articleData?.description || `Description for ${title}`;
    const body = articleData?.body || TestDataGenerator.generateArticleContent();
    const tagList = articleData?.tagList || TestDataGenerator.generateTags();

    const article: TestArticle = {
      title,
      description,
      body,
      tagList,
      author: author?.username,
      createdAt: new Date(),
    };

    // Publish the article via API if requested
    if (publish && author && author.token) {
      const api = await this.initApiClient();
      api.setAuthToken(author.token);

      try {
        const response = await api.createArticle(title, description, body, tagList);
        article.slug = response.article.slug;
        article.id = response.article.id;
      } catch (error) {
        throw error;
      }
    }

    // Store the article for later cleanup
    const key = article.slug || title;
    this.articles.set(key, article);
    this.persistData();

    return article;
  }

  /**
   * Get all created users
   */
  public getUsers(): TestUser[] {
    return Array.from(this.users.values());
  }

  /**
   * Get all created articles
   */
  public getArticles(): TestArticle[] {
    return Array.from(this.articles.values());
  }

  /**
   * Get a user by username
   */
  public getUser(username: string): TestUser | undefined {
    return this.users.get(username);
  }

  /**
   * Get an article by slug or title
   */
  public getArticle(slugOrTitle: string): TestArticle | undefined {
    return this.articles.get(slugOrTitle);
  }

  /**
   * Clean up all test data created within a specific timeframe
   */
  public async cleanupTestData(olderThanHours: number = 24): Promise<void> {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

    // Only clean up data in non-production environments
    if (this.environment === 'prod') {
      return;
    }

    // Initialize API client if needed
    const api = await this.initApiClient();

    // Clean up articles
    for (const [key, article] of this.articles.entries()) {
      if (article.createdAt && article.createdAt < cutoffTime) {
        if (article.slug && article.author) {
          try {
            // TODO: Implement API call to delete article
            // await api.deleteArticle(article.slug);
          } catch (error) {
            // Silently continue on error
          }
        }
        this.articles.delete(key);
      }
    }

    // Clean up users (after articles to avoid foreign key constraints)
    for (const [key, user] of this.users.entries()) {
      if (user.createdAt && user.createdAt < cutoffTime) {
        if (user.token) {
          try {
            // TODO: Implement API call to delete user
            // await api.deleteUser(user.id);
          } catch (error) {
            // Silently continue on error
          }
        }
        this.users.delete(key);
      }
    }

    // Save the updated data
    this.persistData();
  }

  /**
   * Save current test data to disk
   */
  private persistData(): void {
    try {
      const data = {
        users: Array.from(this.users.entries()),
        articles: Array.from(this.articles.entries()),
        comments: Array.from(this.comments.entries()),
        lastUpdated: new Date().toISOString(),
      };
      fs.writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      // Silent error in release mode
    }
  }

  /**
   * Load previously saved test data
   */
  private loadPersistedData(): void {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const data = JSON.parse(fs.readFileSync(this.dataFilePath, 'utf-8'));

        if (data.users) {
          this.users = new Map(
            data.users.map((entry: [string, TestUser]) => {
              // Convert date strings back to Date objects
              if (entry[1].createdAt) {
                entry[1].createdAt = new Date(entry[1].createdAt);
              }
              return entry;
            })
          );
        }

        if (data.articles) {
          this.articles = new Map(
            data.articles.map((entry: [string, TestArticle]) => {
              // Convert date strings back to Date objects
              if (entry[1].createdAt) {
                entry[1].createdAt = new Date(entry[1].createdAt);
              }
              return entry;
            })
          );
        }

        if (data.comments) {
          this.comments = new Map(
            data.comments.map((entry: [string, TestComment]) => {
              // Convert date strings back to Date objects
              if (entry[1].createdAt) {
                entry[1].createdAt = new Date(entry[1].createdAt);
              }
              return entry;
            })
          );
        }
      }
    } catch (error) {
      // Silent error in release mode
    }
  }

  /**
   * Dispose of resources
   */
  public async dispose(): Promise<void> {
    if (this.apiClient) {
      await this.apiClient.dispose();
      this.apiClient = null;
    }
  }
}

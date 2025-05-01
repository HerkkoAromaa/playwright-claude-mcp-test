import { request, APIRequestContext } from '@playwright/test';
import { UserCredentials } from './AuthManager';

/**
 * API client for direct backend interactions
 */
export class ApiClient {
  private apiContext: APIRequestContext;
  private baseUrl: string;
  private authToken?: string;

  /**
   * Create a new API client
   * @param baseUrl Base URL for API requests
   */
  private constructor(baseUrl: string, apiContext: APIRequestContext) {
    this.baseUrl = baseUrl;
    this.apiContext = apiContext;
  }

  /**
   * Create a new API client instance
   */
  public static async create(baseUrl: string): Promise<ApiClient> {
    const apiContext = await request.newContext({
      baseURL: baseUrl,
    });

    return new ApiClient(baseUrl, apiContext);
  }

  /**
   * Login via API and store auth token
   */
  public async login(email: string, password: string): Promise<any> {
    const response = await this.apiContext.post('/api/users/login', {
      data: {
        user: { email, password },
      },
    });

    if (response.ok()) {
      const data = await response.json();
      this.authToken = data.user.token;
      return data.user;
    } else {
      throw new Error(`Login failed: ${response.statusText()}`);
    }
  }

  /**
   * Register a new user via API
   */
  public async register(credentials: UserCredentials): Promise<any> {
    const { username, email, password } = credentials;

    const response = await this.apiContext.post('/api/users', {
      data: {
        user: { username, email, password },
      },
    });

    if (response.ok()) {
      const data = await response.json();
      this.authToken = data.user.token;
      return data.user;
    } else {
      throw new Error(`Registration failed: ${response.statusText()}`);
    }
  }

  /**
   * Set authentication token directly
   * This allows reusing an existing auth token from the browser
   * @param token JWT auth token
   */
  public setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Create an article via API
   */
  public async createArticle(
    title: string,
    description: string,
    body: string,
    tagList: string[] = []
  ): Promise<any> {
    if (!this.authToken) {
      throw new Error('Not authenticated. Login first.');
    }

    console.log(
      `Creating article with token: ${this.authToken.substring(0, 15)}...`
    );

    const data = {
      article: { title, description, body, tagList },
    };

    console.log('Request payload:', JSON.stringify(data, null, 2));

    // Using the standard Conduit API endpoint for article creation
    const response = await this.apiContext.post('/api/articles', {
      headers: {
        Authorization: `Token ${this.authToken}`,
        'Content-Type': 'application/json',
      },
      data,
    });

    console.log(
      `Response status: ${response.status()} - ${response.statusText()}`
    );

    if (response.ok()) {
      const responseData = await response.json();
      console.log('Response data:', JSON.stringify(responseData, null, 2));
      return responseData;
    } else {
      const responseText = await response
        .text()
        .catch(() => 'Unable to get response text');
      console.error('Error response:', responseText);
      throw new Error(
        `Failed to create article: ${response.statusText()} (${response.status()})`
      );
    }
  }

  /**
   * Delete an article via API
   */
  public async deleteArticle(slug: string): Promise<void> {
    if (!this.authToken) {
      throw new Error('Not authenticated. Login first.');
    }

    console.log(`Deleting article: ${slug}`);

    const response = await this.apiContext.delete(`/api/articles/${slug}`, {
      headers: {
        Authorization: `Token ${this.authToken}`,
      },
    });

    if (!response.ok()) {
      const responseText = await response
        .text()
        .catch(() => 'Unable to get response text');
      console.error('Error response:', responseText);
      throw new Error(
        `Failed to delete article: ${response.statusText()} (${response.status()})`
      );
    }
  }

  /**
   * Get articles by author
   */
  public async getArticlesByAuthor(username: string): Promise<any> {
    const params = new URLSearchParams({ author: username });
    const response = await this.apiContext.get(`/api/articles?${params.toString()}`, {
      headers: this.authToken ? {
        Authorization: `Token ${this.authToken}`,
      } : {},
    });

    if (response.ok()) {
      return response.json();
    } else {
      throw new Error(`Failed to get articles: ${response.statusText()}`);
    }
  }

  /**
   * Get current user info
   */
  public async getCurrentUser(): Promise<any> {
    if (!this.authToken) {
      throw new Error('Not authenticated. Login first.');
    }

    const response = await this.apiContext.get('/api/user', {
      headers: {
        Authorization: `Token ${this.authToken}`,
      },
    });

    if (response.ok()) {
      return response.json();
    } else {
      throw new Error(`Failed to get user: ${response.statusText()}`);
    }
  }

  /**
   * Dispose of the API context
   */
  public async dispose(): Promise<void> {
    await this.apiContext.dispose();
  }
}

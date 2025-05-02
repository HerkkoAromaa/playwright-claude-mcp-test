/**
 * Utility class for generating random test data
 */
export class TestDataGenerator {
  /**
   * Generate a random username with a short random suffix to ensure uniqueness
   * @returns Random username string with format testuser_XXXXXX where X is alphanumeric
   */
  static generateUsername(): string {
    const prefix = 'testuser';
    const suffix = this.generateRandomString(6);
    return `${prefix}_${suffix}`;
  }

  /**
   * Generate a random email address with same suffix as username to ensure uniqueness
   * @param prefix Optional prefix (defaults to testuser)
   * @param domain Optional domain name (defaults to example.com)
   * @returns Random email string with format testuser_XXXXXX@example.com
   */
  static generateEmail(prefix: string = 'testuser', domain: string = 'example.com'): string {
    // Extract the random suffix if the prefix contains it (from generateUsername)
    const suffixMatch = prefix.match(/testuser_([a-zA-Z0-9]{6})$/);
    const suffix = suffixMatch ? suffixMatch[1] : this.generateRandomString(6);

    return `testuser_${suffix}@${domain}`;
  }

  /**
   * Generate a standard password as requested
   * @returns Standard password string
   */
  static generatePassword(): string {
    return 'password123';
  }

  /**
   * Helper method to generate random alphanumeric string of specified length
   * @param length Length of random string to generate
   * @returns Random alphanumeric string
   */
  private static generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }

  /**
   * Generate a random article title
   * @returns Random article title string
   */
  static generateArticleTitle(): string {
    const titles = [
      'Getting Started with Automation',
      'The Future of Testing',
      'Web Development Best Practices',
      'How to Build Resilient Tests',
      'Understanding Modern Frameworks',
      'Test Automation Strategies',
    ];
    const randomIndex = Math.floor(Math.random() * titles.length);
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '');
    return `${titles[randomIndex]} - ${timestamp}`;
  }

  /**
   * Generate random article content
   * @returns Random article body content string
   */
  static generateArticleContent(): string {
    return `# Test Article
    
This is a test article created for automated testing purposes.

## Section 1
Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Nulla facilisi. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.

## Section 2
* Item 1
* Item 2
* Item 3

## Conclusion
This concludes our automated test article created on ${new Date().toISOString()}.
`;
  }

  /**
   * Generate an array of random tags
   * @param count Number of tags to generate
   * @returns Array of tag strings
   */
  static generateTags(count: number = 3): string[] {
    const allTags = [
      'testing',
      'automation',
      'playwright',
      'typescript',
      'javascript',
      'web',
      'api',
      'frontend',
      'development',
      'qa',
    ];
    const tags: string[] = [];

    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * allTags.length);
      const tag = allTags[randomIndex];

      if (!tags.includes(tag)) {
        tags.push(tag);
      } else {
        i--; // Try again to get a unique tag
      }
    }

    return tags;
  }
}

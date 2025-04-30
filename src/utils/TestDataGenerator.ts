/**
 * Utility class for generating random test data
 */
export class TestDataGenerator {
  /**
   * Generate a random username with a timestamp to ensure uniqueness
   * @returns Random username string
   */
  static generateUsername(): string {
    const prefix = 'testuser';
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '');
    return `${prefix}_${timestamp}`;
  }

  /**
   * Generate a random email address with a timestamp to ensure uniqueness
   * @param domain Optional domain name (defaults to example.com)
   * @returns Random email string
   */
  static generateEmail(domain: string = 'example.com'): string {
    const prefix = 'testuser';
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '');
    return `${prefix}_${timestamp}@${domain}`;
  }

  /**
   * Generate a random password that meets common requirements
   * @returns Random password string
   */
  static generatePassword(): string {
    const length = Math.floor(Math.random() * 5) + 10; // 10-14 characters
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';

    // Ensure password has at least one uppercase, lowercase, number, and special char
    password += 'Aa1!';

    // Fill the rest with random characters
    for (let i = 4; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Shuffle the password characters
    return password
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
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

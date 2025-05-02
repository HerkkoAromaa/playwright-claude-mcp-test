import { test as baseTest, expect } from '../src/fixtures/BaseFixture';
import { TestDataGenerator } from '../src/utils/TestDataGenerator';
import path from 'path';
import fs from 'fs';

// Get the auth user credentials from setup file
const authDir = path.join(process.cwd(), '.auth');
const credentialsPath = path.join(authDir, 'credentials.json');

// Function to get the auth user credentials
function getAuthCredentials() {
  try {
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    return credentials;
  } catch (error) {
    return {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };
  }
}

// Create a test that doesn't use the stored authentication state
// This ensures we're always logged out for registration tests
const test = baseTest.extend({
  storageState: { cookies: [], origins: [] }, // Empty storage state = logged out
});

test.describe('User Registration', () => {
  test('should register a new user with valid credentials', async ({ page, browserName, pageManager }) => {
    const registerPage = pageManager.registerPage;

    // Use TestDataGenerator for all credentials to ensure consistent format
    const username = TestDataGenerator.generateUsername();
    const email = TestDataGenerator.generateEmail(username);
    const password = TestDataGenerator.generatePassword();

    // Act - Navigate to register page and register
    await registerPage.navigate();
    await registerPage.fillRegistrationForm(username, email, password);
    await registerPage.submitForm();

    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');

    // Assert - User is redirected to home page
    await expect(page).toHaveURL(/.*\//); // Redirected to home page

    // Check for elements that should be visible after successful registration
    await expect(page.getByText('Your Feed')).toBeVisible();
    // Check if the username appears in the UI
    await expect(page.getByText(username, { exact: false })).toBeVisible();
  });

  test('should show validation error for existing username', async ({ page, browserName, pageManager }) => {
    const registerPage = pageManager.registerPage;

    // Get credentials of the auth user created in setup
    const authUser = getAuthCredentials();

    // Use the page object's navigate method which calls the correct URL structure
    await registerPage.navigate();

    // Wait for multiple conditions to ensure page is fully loaded
    await page.waitForLoadState('networkidle');

    // Wait specifically for the username input field to be visible
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible({
      timeout: 10000,
    });

    // Try to register another user with the same username but different email
    const newEmail = TestDataGenerator.generateEmail(`new_${browserName}`);
    await registerPage.fillRegistrationForm(authUser.username, newEmail, authUser.password);
    await registerPage.submitForm();

    // Wait for error response
    await page.waitForLoadState('networkidle');

    // Assert - Check if we're still on the register page (URL should contain "register")
    await expect(page).toHaveURL(/.*register/);

    // Assert - Check for error indicators
    const errorMessages = page.locator('.error-messages li');
    await expect(errorMessages).toBeVisible({ timeout: 10000 });

    // Check if the error contains expected text about username
    const errorText = (await errorMessages.textContent()) || '';
    expect(errorText.toLowerCase()).toContain('username');
  });

  test('should show validation error for existing email', async ({ page, browserName, pageManager }) => {
    const registerPage = pageManager.registerPage;

    // Get credentials of the auth user created in setup
    const authUser = getAuthCredentials();

    // Use the page object's navigate method which calls the correct URL structure
    await registerPage.navigate();

    // Wait for multiple conditions to ensure page is fully loaded
    await page.waitForLoadState('networkidle');

    // Wait specifically for the username input field to be visible
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible({
      timeout: 10000,
    });

    // Try to register another user with the same email but different username
    const newUsername = TestDataGenerator.generateUsername();
    await registerPage.fillRegistrationForm(newUsername, authUser.email, authUser.password);
    await registerPage.submitForm();

    // Wait for error response
    await page.waitForLoadState('networkidle');

    // Assert - Check if we're still on the register page (URL should contain "register")
    await expect(page).toHaveURL(/.*register/);

    // Assert - Check for error indicators
    const errorMessages = page.locator('.error-messages li');
    await expect(errorMessages).toBeVisible({ timeout: 10000 });

    // Check if the error contains expected text about email
    const errorText = (await errorMessages.textContent()) || '';
    expect(errorText.toLowerCase()).toContain('email');
  });

  test('should enable sign-up button only with all fields filled', async ({ page, browserName, pageManager }) => {
    const registerPage = pageManager.registerPage;

    await registerPage.navigate();

    // Initially, button should be disabled (no fields filled)
    expect(await registerPage.isSignUpButtonEnabled()).toBeFalsy();

    // Fill username only - use generator without adding browser name to avoid making it too long
    await registerPage.usernameInput.fill(TestDataGenerator.generateUsername());
    expect(await registerPage.isSignUpButtonEnabled()).toBeFalsy();

    // Fill email too - use generator directly
    await registerPage.emailInput.fill(TestDataGenerator.generateEmail());
    expect(await registerPage.isSignUpButtonEnabled()).toBeFalsy();

    // Fill password too (all fields filled)
    await registerPage.passwordInput.fill(TestDataGenerator.generatePassword());
    expect(await registerPage.isSignUpButtonEnabled()).toBeTruthy();
  });
});

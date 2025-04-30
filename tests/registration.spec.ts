import { test as base, expect } from '@playwright/test';
import { RegisterPage } from '../src/pages/RegisterPage';
import { HomePage } from '../src/pages/HomePage';
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
    console.log('Found auth credentials for user:', credentials.username);
    return credentials;
  } catch (error) {
    console.error('Error reading auth credentials:', error);
    return {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };
  }
}

// Create a test that doesn't use the stored authentication state
// This ensures we're always logged out for registration tests
const test = base.extend({
  storageState: { cookies: [], origins: [] }, // Empty storage state = logged out
});

test.describe('User Registration', () => {
  test('should register a new user with valid credentials', async ({
    page,
    browserName,
  }) => {
    // Use our shared credentials for the first successful registration
    const username = `testuser_${Date.now()}`;
    const email = TestDataGenerator.generateEmail(username);
    const password = TestDataGenerator.generatePassword();

    console.log(`[${browserName}] Registering new user: ${username}`);

    // Create page objects
    const registerPage = new RegisterPage(page);

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

  test('should show validation error for existing username', async ({
    page,
    browserName,
  }) => {
    // Get credentials of the auth user created in setup
    const authUser = getAuthCredentials();
    console.log(
      `[${browserName}] Testing duplicate username validation with setup user: ${authUser.username}`
    );

    const registerPage = new RegisterPage(page);

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
    await registerPage.fillRegistrationForm(
      authUser.username,
      newEmail,
      authUser.password
    );
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

  test('should show validation error for existing email', async ({
    page,
    browserName,
  }) => {
    // Get credentials of the auth user created in setup
    const authUser = getAuthCredentials();
    console.log(
      `[${browserName}] Testing duplicate email validation with setup user email: ${authUser.email}`
    );

    const registerPage = new RegisterPage(page);

    // Use the page object's navigate method which calls the correct URL structure
    await registerPage.navigate();

    // Wait for multiple conditions to ensure page is fully loaded
    await page.waitForLoadState('networkidle');

    // Wait specifically for the username input field to be visible
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible({
      timeout: 10000,
    });

    // Try to register another user with the same email but different username
    const newUsername = `new_${authUser.username}_${browserName}`;
    await registerPage.fillRegistrationForm(
      newUsername,
      authUser.email,
      authUser.password
    );
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

  test('should enable sign-up button only with all fields filled', async ({
    page,
    browserName,
  }) => {
    const registerPage = new RegisterPage(page);

    console.log(`[${browserName}] Testing sign-up button activation`);

    await registerPage.navigate();

    // Initially, button should be disabled (no fields filled)
    expect(await registerPage.isSignUpButtonEnabled()).toBeFalsy();

    // Fill username only
    await registerPage.usernameInput.fill(
      `${TestDataGenerator.generateUsername()}_${browserName}`
    );
    expect(await registerPage.isSignUpButtonEnabled()).toBeFalsy();

    // Fill email too
    await registerPage.emailInput.fill(
      TestDataGenerator.generateEmail(browserName)
    );
    expect(await registerPage.isSignUpButtonEnabled()).toBeFalsy();

    // Fill password too (all fields filled)
    await registerPage.passwordInput.fill(TestDataGenerator.generatePassword());
    expect(await registerPage.isSignUpButtonEnabled()).toBeTruthy();
  });
});

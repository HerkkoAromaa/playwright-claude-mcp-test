import { test as setup, expect } from '@playwright/test';
import { RegisterPage } from '../src/pages/RegisterPage';
import { HomePage } from '../src/pages/HomePage';
import { TestDataGenerator } from '../src/utils/TestDataGenerator';
import path from 'path';
import fs from 'fs';

// File paths for storing auth state
const authFile = path.join(process.cwd(), '.auth', 'user.json');

// Make sure the auth directory exists
const authDir = path.join(process.cwd(), '.auth');
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

setup('authenticate', async ({ page }) => {
  // Generate new user credentials
  const username = TestDataGenerator.generateUsername();
  const email = TestDataGenerator.generateEmail();
  const password = TestDataGenerator.generatePassword();

  console.log(`Setting up test user: ${username}, ${email}`);

  // Register a new user
  const registerPage = new RegisterPage(page);
  await registerPage.navigate();
  await registerPage.fillRegistrationForm(username, email, password);
  await registerPage.submitForm();

  // Wait for authentication to complete by checking for user-specific elements
  const homePage = new HomePage(page);

  // Wait for the user profile link to appear with username, which indicates successful authentication
  await expect(homePage.userProfileLink).toBeVisible({ timeout: 5000 });

  // Double-check that we're actually logged in with the correct user
  const loggedInUsername = await homePage.getLoggedInUsername();
  console.log(`Authenticated as: ${loggedInUsername}`);
  expect(loggedInUsername).toContain(username);

  // Save authentication state
  await page.context().storageState({ path: authFile });

  // Verify auth file was created successfully
  if (fs.existsSync(authFile)) {
    const stats = fs.statSync(authFile);
    console.log(
      `Authentication state saved to ${authFile} (${stats.size} bytes)`
    );

    // Optionally verify the file content contains expected data
    try {
      const authData = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
      if (authData.origins && authData.origins.length > 0) {
        console.log('Auth state contains valid origin data');
      }
    } catch (err) {
      console.error('Error validating auth file:', err);
    }
  } else {
    console.error(`Failed to save authentication state to ${authFile}`);
  }

  // Save credentials to a companion file for reference
  fs.writeFileSync(
    path.join(authDir, 'credentials.json'),
    JSON.stringify({ username, email, password }),
    'utf8'
  );
});

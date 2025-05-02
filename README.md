# Conduit Playwright Test Framework

![Playwright](https://img.shields.io/badge/Playwright-v1.40+-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.0+-green.svg)
![Allure](https://img.shields.io/badge/Allure-v2.0+-orange.svg)

A comprehensive end-to-end test framework for the [Conduit](https://conduit.bondaracademy.com/) application built with Playwright and TypeScript. This enterprise-grade framework demonstrates test automation best practices including page object model, test fixtures, parallel execution, and comprehensive reporting.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running Tests](#running-tests)
  - [Basic Test Commands](#basic-test-commands)
  - [Advanced Test Commands](#advanced-test-commands)
  - [Environment Variables](#environment-variables)
  - [Logging Configuration](#logging-configuration)
- [Test Reports](#test-reports)
  - [Playwright HTML Reports](#playwright-html-reports)
  - [Allure Reports](#allure-reports)
- [Authentication System](#authentication-system)
- [Test Data Management](#test-data-management)
- [Page Object Model](#page-object-model)
- [Test Fixtures](#test-fixtures)
- [Utilities & Helper Scripts](#utilities--helper-scripts)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Overview

This enterprise-ready test framework automates testing of the Conduit application (a Medium.com clone) with a focus on reliability, maintainability, and performance. The framework follows SOLID principles and implements industry best practices for test architecture.

## Key Features

- **🏗️ Architecture**

  - Page Object Model for clear separation of concerns
  - Type-safe implementation with TypeScript
  - Worker-scoped authentication for parallel test execution
  - Singleton pattern for resource management
  - Modular and extensible design

- **🔄 Test Execution**

  - Parallel test execution across multiple workers
  - Cross-browser testing (Chromium, Firefox, WebKit)
  - Device emulation for mobile viewport testing
  - Configurable retries for handling flaky tests
  - Granular test filtering options

- **📊 Reporting**

  - Built-in Playwright HTML reports
  - Allure reporting with rich test analytics
  - Screenshot capture on test failure
  - Trace recording for debugging
  - Test history tracking

- **🔐 Authentication**

  - Cached authentication states for fast test execution
  - Worker-specific authentication to prevent conflicts
  - API-based authentication shortcuts
  - Session state persistence between runs

- **📝 Test Data**

  - Dynamic test data generation
  - Test data cleanup mechanisms
  - Data persistence for debugging
  - API-driven test data creation

- **🧩 Extensions**
  - Compatibility with Playwright's Model-Context Protocol (MCP)
  - Context7 integration capabilities
  - Custom command-line tools

## Project Structure

```
conduit-playwright-tests/
├── playwright.config.ts   # Playwright configuration
├── package.json          # Project dependencies
├── run-playwright-tests.sh # Shell script to run tests with options
├── src/
│   ├── fixtures/         # Test fixtures
│   │   ├── AuthFixture.ts          # Authentication fixtures
│   │   ├── BaseFixture.ts          # Base fixtures for all tests
│   │   ├── PageFixture.ts          # Page object fixtures
│   │   ├── TestDataFixture.ts      # Test data fixtures
│   │   └── globalSetup.ts          # Global setup for tests
│   ├── manager/          # Managers
│   │   └── PageManager.ts          # Central manager for page objects
│   ├── pages/            # Page Object Models
│   │   ├── BasePage.ts             # Base page with common functionality
│   │   ├── EditorPage.ts           # Article editor page
│   │   ├── HomePage.ts             # Home page
│   │   ├── LoginPage.ts            # Login page
│   │   └── RegisterPage.ts         # Registration page
│   └── utils/            # Utility functions
│       ├── ApiClient.ts            # API client for backend calls
│       ├── AuthManager.ts          # Authentication manager
│       ├── TestDataGenerator.ts    # Test data generation
│       └── TestDataManager.ts      # Test data management and cleanup
└── tests/                # Test files
    ├── article-creation.spec.ts    # Article creation tests
    ├── auth.setup.ts               # Authentication setup
    └── registration.spec.ts        # User registration tests
```

## Prerequisites

- Node.js (v16+)
- npm or yarn
- Java Runtime Environment (JRE) for Allure reporting
- Supported browsers will be installed automatically by Playwright

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd conduit-playwright-tests
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Install browsers:

   ```bash
   npx playwright install
   ```

4. Install Allure command-line tool (optional, for advanced reporting):
   ```bash
   npm install -g allure-commandline
   ```

## Running Tests

### Basic Test Commands

Run all tests in headless mode:

```bash
npx playwright test
```

Run tests with UI mode:

```bash
npx playwright test --ui
```

Run tests in specific browser:

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

Run specific test file:

```bash
npx playwright test tests/registration.spec.ts
```

Run tests filtered by title:

```bash
npx playwright test -g "should register a new user"
```

### Advanced Test Commands

Run tests with headed browsers:

```bash
npx playwright test --headed
```

Run tests with debug mode:

```bash
npx playwright test --debug
```

Run tests with specific concurrency:

```bash
npx playwright test --workers=4
```

Run tests with trace recording:

```bash
npx playwright test --trace=on
```

Run tests with video recording:

```bash
npx playwright test --video=on
```

Run tests using the shell script with common options:

```bash
./run-playwright-tests.sh --browser=chromium --headless --retries=2
```

The shell script supports these options:

- `--browser`: chromium, firefox, webkit, or all (default: all)
- `--headless`: true or false (default: true)
- `--retries`: number of retries for failed tests (default: 1)
- `--workers`: number of parallel workers (default: 50% of CPU cores)
- `--reporter`: reporter to use (default: list,allure-playwright)

### Environment Variables

The framework supports these environment variables:

| Variable          | Description                         | Default                           |
| ----------------- | ----------------------------------- | --------------------------------- |
| BASE_URL          | Base URL for the application        | https://conduit.bondaracademy.com |
| TIMEOUT           | Default timeout in milliseconds     | 30000                             |
| RETRY_COUNT       | Number of retries for failed tests  | 1                                 |
| BROWSER           | Browser to use for tests            | chromium                          |
| CLEANUP_TEST_DATA | Whether to clean up test data       | false                             |
| DEBUG_LOGS        | Enable verbose debug logging        | false                             |
| TEST_ENV          | Test environment (dev/staging/prod) | dev                               |

Example:

```bash
BASE_URL=https://staging.conduit.com BROWSER=firefox npx playwright test
```

### Logging Configuration

The framework provides clean logging for the release version by default. For debugging purposes, you can enable additional logs:

```bash
DEBUG_LOGS=true npx playwright test
```

For minimal logging output, run tests with the quiet option:

```bash
npx playwright test --quiet
```

## Test Reports

### Playwright HTML Reports

To view the Playwright HTML report after test execution:

```bash
npx playwright show-report
```

This will open the HTML report in your default browser, showing:

- Test results summary
- Test execution timeline
- Screenshots of test failures
- Detailed logs and error messages
- Trace viewer for debugging

Example output:

```
Running 25 tests using 5 workers
  ✓ registration.spec.ts:18:3 › should register a new user (1.2s)
  ✓ registration.spec.ts:42:3 › should show validation error for existing username (1.8s)
  ...
```

### Allure Reports

This framework provides comprehensive Allure reporting for advanced test analytics:

Generate and view the Allure report:

```bash
# Generate Allure report from results
npx allure generate allure-results --clean

# Serve the report locally (opens in browser automatically)
npx allure serve allure-results
```

#### Running Tests with Allure Reporting

To run tests and automatically generate an Allure report in one command:

```bash
# Run tests and generate Allure report
npx playwright test && npx allure generate allure-results --clean && npx allure open allure-report
```

Or use these individual steps:

```bash
# Step 1: Run the tests (Allure results are automatically created)
npx playwright test

# Step 2: Generate the HTML report from results
npx allure generate allure-results --clean

# Step 3: Open the report in your default browser
npx allure open allure-report
```

For CI environments, you can use:

```bash
# Run tests with explicit Allure reporter configuration
npx playwright test --reporter=list,allure-playwright
```

#### Managing Allure Results Between Test Runs

⚠️ **Important:** Allure results accumulate between test runs, which can lead to misleading reports. For example, running only chromium tests might show results from previous firefox or webkit runs.

To ensure your report only shows results from the current test run, clear the allure-results directory before running tests:

```bash
# Clear previous results before running tests
rm -rf allure-results/* && npx playwright test --project=chromium

# Then generate the report
npx allure generate allure-results --clean && npx allure open allure-report
```

For macOS/Linux users, you can use this all-in-one command:

```bash
rm -rf allure-results/* && npx playwright test --project=chromium && npx allure generate allure-results --clean && npx allure open allure-report
```

For Windows users:

```bash
rmdir /s /q allure-results && mkdir allure-results && npx playwright test --project=chromium && npx allure generate allure-results --clean && npx allure open allure-report
```

The Allure report provides:

- Test execution statistics and trends
- Environment information
- Test case duration breakdown
- Failure analysis
- Screenshots and traces integration
- Categorized test failures

## Authentication System

The framework implements a sophisticated authentication system with several key features:

### Worker-Scoped Authentication

Tests running in parallel each get their own authenticated user:

```typescript
// Example from BaseFixture.ts
workerAuth: [
  async ({ browser, testData }, use, workerInfo) => {
    const workerAuthPath = path.join(AUTH_DIR, `worker-auth-${workerInfo.workerIndex}.json`);
    // Load or create authentication state for this worker
    // ...
    await use({ context, credentials, testUser });
  },
  { scope: 'worker' },
],
```

### Authentication State Caching

Authentication states are cached to disk for faster test execution:

```typescript
// Save authentication state
await context.storageState({ path: workerAuthPath });

// Load existing auth state
context = await browser.newContext({
  storageState: workerAuthPath,
});
```

### API Authentication Shortcut

For tests that don't need UI login:

```typescript
// Example usage in a test
test('create article with authenticated user', async ({ authenticatedPage }) => {
  const { page, pageManager, credentials } = authenticatedPage;
  // Test can immediately use authenticated user
});
```

## Test Data Management

### Dynamic Test Data Generation

```typescript
// Generate unique test data
const username = TestDataGenerator.generateUsername();
const email = TestDataGenerator.generateEmail();
const password = TestDataGenerator.generatePassword();
const title = TestDataGenerator.generateArticleTitle();
```

### Test Data Cleanup

The framework includes automatic cleanup of test data:

```typescript
// Example usage
await testDataManager.cleanupTestData(24); // Clean up data older than 24 hours
```

### API-Driven Data Creation

For faster test setup:

```typescript
// Create article via API instead of UI
const article = await testDataManager.createArticle(author, true);
```

## Page Object Model

### Page Manager Pattern

The framework uses a centralized Page Manager for accessing page objects:

```typescript
// Example usage in a test
test('should create an article', async ({ page, pageManager }) => {
  const editorPage = pageManager.editorPage;
  await editorPage.navigate();
  await editorPage.fillArticleForm(title, description, content);
  await editorPage.publishArticle();
});
```

### Interface-Based Design

All page objects implement interfaces for better maintainability:

```typescript
export interface IEditorPage {
  navigate(): Promise<void>;
  fillArticleForm(title: string, description: string, body: string, tags?: string[]): Promise<void>;
  publishArticle(): Promise<void>;
}

export class EditorPage extends BasePage implements IEditorPage {
  // Implementation
}
```

## Test Fixtures

The framework provides several custom fixtures to enhance test reliability:

### Base Fixtures

```typescript
// Example test using fixtures
test('should create article with authenticated user', async ({ authenticatedPage, baseURL }) => {
  const { page, pageManager, credentials } = authenticatedPage;
  // Test code
});
```

### Test Data Fixtures

```typescript
// Example usage of test data fixtures
test('should create an article', async ({ testData }) => {
  const user = await testData.registerAndLoginUser();
  const article = await testData.createArticle(user);
  // Test code
});
```

## Utilities & Helper Scripts

### Split Tests Utility

Split test files into individual files for increased parallelism:

```bash
node split-tests.js
```

This creates individual test files in subdirectories:

- `tests/registration/` - Split registration tests
- `tests/articles/` - Split article tests

### Test Data Manager

The `TestDataManager` class provides utilities for:

- Creating test users
- Creating test articles
- Managing test data
- Cleaning up old test data

```typescript
// Example usage
const manager = TestDataManager.getInstance(baseUrl);
const user = await manager.createUser(true); // true = register via API
const article = await manager.createArticle(user, true);
```

## Best Practices

The framework follows these best practices:

### KISS (Keep It Simple, Stupid)

- Clean, readable test code
- Minimal logging in release mode
- Single responsibility for each component

### DRY (Don't Repeat Yourself)

- Shared fixtures for common functionality
- Page Object Model for UI interactions
- Helper utilities for common tasks

### SOLID Principles

- Single Responsibility: Each class has one job
- Open/Closed: Framework can be extended without modification
- Liskov Substitution: Page interfaces can be substituted
- Interface Segregation: Specific interfaces for each component
- Dependency Inversion: High-level modules depend on abstractions

## CI/CD Integration

The framework is designed to run in CI environments with these features:

### Parallel Execution

Configure the number of parallel workers:

```bash
npx playwright test --workers=4
```

### Reports Integration

Generate both Playwright and Allure reports:

```bash
# Add to your CI script
npx playwright test --reporter=list,allure-playwright
npx allure generate allure-results --clean
```

### Retry Logic

Configure retries for flaky tests:

```bash
npx playwright test --retries=2
```

### CI Example

GitHub Actions example:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run tests
        run: npx playwright test
      - name: Generate Allure Report
        if: always()
        run: npx allure generate allure-results --clean
      # Upload artifacts
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## Troubleshooting

### Common Issues

**Authentication Issues**

- Delete the `.auth` directory to reset authentication state
- Check if the application API endpoints have changed

**Test Data Issues**

- Clear the `.test-data` directory to reset test data
- Check if the application has been reset or data cleaned up

**Reporting Issues**

- Ensure Java is installed for Allure reporting
- Clear the `allure-results` directory for fresh reports

### Debug Mode

Run tests in debug mode to diagnose issues:

```bash
DEBUG_LOGS=true npx playwright test --debug
```

### Trace Viewer

Use trace viewer to analyze test execution:

```bash
npx playwright test --trace=on
npx playwright show-report
```

Then click on the trace icon for any test to open the trace viewer.

### Using Playwright Trace Viewer

Playwright provides a powerful trace viewer that helps with debugging test failures by capturing detailed execution information.

#### Opening Traces from HTML Reports

The easiest way to view traces is directly from the HTML report:

1. Generate an HTML report with traces:

   ```bash
   npx playwright test --trace=on
   ```

2. Open the HTML report:

   ```bash
   npx playwright show-report
   ```

3. Navigate to a test in the report and click on the "Trace" button (chain icon) to open the trace viewer.

#### Opening Downloaded Trace Files

You can also download trace files (.zip) from the HTML report and view them later:

1. From the HTML report, click the download icon next to the trace you want to save.

2. Open the downloaded trace file using Playwright's trace viewer command:

   ```bash
   npx playwright show-trace path/to/trace.zip
   ```

3. For example, to open a trace from the test-results folder:
   ```bash
   npx playwright show-trace test-results/my-test/trace.zip
   ```

#### Trace Viewer Features

Playwright's trace viewer offers several powerful features:

- **Timeline View**: Visualize actions, events, and screenshots along a timeline.
- **Snapshots**: View DOM snapshots at each action point.
- **Network**: Inspect network requests made during test execution.
- **Console**: View console logs that occurred during the test.
- **Source**: See the test source code that triggered each action.
- **Errors**: Quickly identify and analyze errors that occurred during the test.

#### Configuring Trace Options

The project's `playwright.config.ts` configures trace recording with:

```typescript
trace: 'on-first-retry'; // Options: 'on', 'off', 'on-first-retry', 'retain-on-failure'
```

To enable traces for all test runs:

```bash
npx playwright test --trace=on
```

For more detailed traces with screenshots and snapshots:

```bash
npx playwright test --trace=on --trace-screenshots=on
```

### Manual Browser Launch

For direct debugging:

```bash
npx playwright open https://conduit.bondaracademy.com
```

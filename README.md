# Conduit Playwright Test Suite

![Playwright](https://img.shields.io/badge/Playwright-v1.40+-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.0+-green.svg)

A comprehensive end-to-end test suite for the [Conduit](https://conduit.bondaracademy.com/) application built with Playwright and TypeScript. This project demonstrates test automation best practices including page object model, test fixtures, and parallel test execution.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running Tests](#running-tests)
- [Test Reports](#test-reports)
- [Test Development Guide](#test-development-guide)
- [Utilities](#utilities)
- [Continuous Integration](#continuous-integration)
- [Contributing](#contributing)

## Overview

This test suite automates testing of the Conduit application, a Medium.com clone. The tests cover key functionality including user registration, authentication, article creation and management.

## Features

- **Page Object Model**: Well-structured page objects for maintainable tests
- **Authentication Fixtures**: Pre-built user authentication for tests
- **Test Data Generation**: Dynamic test data creation for reliable tests
- **Cross-browser Testing**: Tests run across multiple browsers (Chromium, Firefox, WebKit)
- **Mobile Viewport Testing**: Tests run with mobile viewport simulation
- **Parallel Test Execution**: Tests can be executed in parallel for faster feedback
- **HTML Test Reports**: Comprehensive reports with screenshots and traces

## Project Structure

```
conduit-playwright-tests/
├── playwright.config.ts   # Playwright configuration
├── package.json          # Project dependencies
├── split-tests.js        # Utility to split tests into individual files
├── src/
│   ├── fixtures/        # Test fixtures
│   │   ├── AuthFixture.ts          # Authentication fixtures
│   │   └── globalSetup.ts          # Global setup for tests
│   ├── pages/           # Page Object Models
│   │   ├── BasePage.ts             # Base page with common functionality
│   │   ├── EditorPage.ts           # Article editor page
│   │   ├── HomePage.ts             # Home page
│   │   ├── LoginPage.ts            # Login page
│   │   └── RegisterPage.ts         # Registration page
│   └── utils/           # Utility functions
│       └── TestDataGenerator.ts    # Test data generation
└── tests/              # Test files
    ├── article-creation.spec.ts   # Article creation tests
    ├── auth.setup.ts              # Authentication setup
    └── registration.spec.ts       # User registration tests
```

## Prerequisites

- Node.js (v16+)
- npm or yarn
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

## Running Tests

### Run All Tests

```bash
npx playwright test
```

### Run Tests in Specific Browser

```bash
npx playwright test --project=chromium
```

### Run Tests with UI Mode

```bash
npx playwright test --ui
```

### Run a Specific Test File

```bash
npx playwright test tests/registration.spec.ts
```

### Run a Specific Test by Title

```bash
npx playwright test -g "should register a new user"
```

### Run Tests in Debug Mode

```bash
npx playwright test --debug
```

### Run Tests with Headed Browsers

```bash
npx playwright test --headed
```

## Test Reports

After test execution, an HTML report is generated:

```bash
npx playwright show-report
```

This report includes:

- Test results summary
- Test execution timeline
- Screenshots of test failures
- Detailed logs and error messages
- Trace viewer for debugging

## Test Development Guide

### Creating a New Test

1. Identify which existing spec file the test belongs to, or create a new one
2. Use the Page Object Model pattern to interact with the application
3. Follow the Arrange-Act-Assert pattern for test structure
4. Use the TestDataGenerator to create unique test data

### Page Object Example

```typescript
// Creating a new test using Page Objects
test('should create a new article', async ({ page }) => {
  const editorPage = new EditorPage(page);
  const title = TestDataGenerator.generateArticleTitle();

  // Navigate and fill form
  await editorPage.navigate();
  await editorPage.fillArticleForm(title, 'description', 'content');

  // Submit and verify
  await editorPage.publishArticle();
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
});
```

## Utilities

### Split Tests Utility

The project includes a utility script to split test files into individual files for increased parallelism:

```bash
node split-tests.js
```

This creates individual test files in subdirectories:

- `tests/registration/` - Split registration tests
- `tests/articles/` - Split article tests

## Continuous Integration

This test suite is designed to run in CI environments. Key considerations:

- Tests run in headless mode by default
- Authentication state is saved to speed up tests
- Screenshots and videos are captured for failed tests
- Retries are configurable for flaky tests

## Contributing

1. Create a feature branch
2. Add or modify tests
3. Ensure all tests pass
4. Submit a pull request with detailed description
5. Update documentation as needed

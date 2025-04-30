const fs = require('fs');
const path = require('path');

// Function to create directories if they don't exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Read the registration.spec.ts file
const registrationFilePath = path.join(
  __dirname,
  'tests',
  'registration.spec.ts'
);
const registrationContent = fs.readFileSync(registrationFilePath, 'utf8');

// Extract imports to reuse in new files
const importSection = registrationContent.match(/import.*?\n\n/s)[0];

// Split the tests based on test function declarations
const testRegex = /test\('([^']+)'/g;
const tests = [];
let match;

// Extract all test cases with their implementations
let prevIndex = registrationContent.indexOf(
  "test.describe('User Registration', () => {"
);
prevIndex = registrationContent.indexOf('test(', prevIndex);

while ((match = testRegex.exec(registrationContent)) !== null) {
  const testName = match[1];
  const startIndex = match.index;

  // Find the end of this test function (start of the next test or end of file)
  let endIndex;
  const nextTestMatch = testRegex.exec(registrationContent);

  if (nextTestMatch) {
    endIndex = nextTestMatch.index;
    testRegex.lastIndex = nextTestMatch.index; // Reset regex to this position
  } else {
    // If no more tests, find the end of the describe block
    endIndex = registrationContent.indexOf('});', startIndex);
    if (endIndex === -1) endIndex = registrationContent.length;
  }

  const testImplementation = registrationContent.substring(
    startIndex,
    endIndex
  );
  tests.push({ name: testName, implementation: testImplementation });
}

// Create a directory for split test files
const splitTestsDir = path.join(__dirname, 'tests', 'registration');
ensureDirectoryExists(splitTestsDir);

// Create individual test files
tests.forEach((test, index) => {
  const normalizedName = test.name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  const fileName = `reg-${index + 1}-${normalizedName}.spec.ts`;
  const filePath = path.join(splitTestsDir, fileName);

  const fileContent = `${importSection}
test.describe('User Registration - ${test.name}', () => {
  ${test.implementation}
});
`;

  fs.writeFileSync(filePath, fileContent);
});

// Create a similar file for article tests
const articleFilePath = path.join(
  __dirname,
  'tests',
  'article-creation.spec.ts'
);
const articleContent = fs.readFileSync(articleFilePath, 'utf8');

// Extract imports to reuse in new files
const articleImportSection = articleContent.match(/import.*?\n\n/s)[0];

// Split the article tests
const articleTestRegex = /test\('([^']+)'/g;
const articleTests = [];

// Extract all test cases with their implementations
let articlePrevIndex = articleContent.indexOf(
  "test.describe('Article Creation', () => {"
);
articlePrevIndex = articleContent.indexOf('test(', articlePrevIndex);

while ((match = articleTestRegex.exec(articleContent)) !== null) {
  const testName = match[1];
  const startIndex = match.index;

  // Find the end of this test function (start of the next test or end of file)
  let endIndex;
  const nextTestMatch = articleTestRegex.exec(articleContent);

  if (nextTestMatch) {
    endIndex = nextTestMatch.index;
    articleTestRegex.lastIndex = nextTestMatch.index; // Reset regex to this position
  } else {
    // If no more tests, find the end of the describe block
    endIndex = articleContent.indexOf('});', startIndex);
    if (endIndex === -1) endIndex = articleContent.length;
  }

  const testImplementation = articleContent.substring(startIndex, endIndex);
  articleTests.push({ name: testName, implementation: testImplementation });
}

// Create a directory for split article test files
const splitArticleTestsDir = path.join(__dirname, 'tests', 'articles');
ensureDirectoryExists(splitArticleTestsDir);

// Extract utility functions from article tests
const utilityFunctions = articleContent.match(
  /function getTestUser\(\) {[^}]*}/s
)[0];

// Create individual article test files
articleTests.forEach((test, index) => {
  const normalizedName = test.name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  const fileName = `article-${index + 1}-${normalizedName}.spec.ts`;
  const filePath = path.join(splitArticleTestsDir, fileName);

  const fileContent = `${articleImportSection}
// Use the authentication setup
test.use({ storageState: path.join(process.cwd(), '.auth', 'user.json') });

// Load the saved user credentials if available
${utilityFunctions}

test.describe('Article Creation - ${test.name}', () => {
  ${test.implementation}
});
`;

  fs.writeFileSync(filePath, fileContent);
});

console.log(
  'Split complete! Tests have been divided into multiple files to increase parallelism.'
);

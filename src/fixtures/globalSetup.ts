import fs from 'fs';
import path from 'path';

/**
 * Global setup function that runs once before all tests
 */
async function globalSetup() {
  // Create necessary directories for test artifacts
  const directories = [
    '.auth',
    'test-results',
    'playwright-report',
    'screenshots',
  ];

  for (const dir of directories) {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  console.log('Global setup complete - directories created');
}

export default globalSetup;

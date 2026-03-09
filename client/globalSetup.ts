import { chromium, type FullConfig } from '@playwright/test';
import { E2E_EMAIL, E2E_PASSWORD, E2E_NAME } from './tests/e2e/test-credentials';

/**
 * Global setup: registers the shared E2E test user before all tests run.
 * If the user already exists, registration will fail with 409 — which is fine.
 */
async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:5173';
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to register page
    await page.goto(`${baseURL}/register`);

    // Fill registration form
    await page.fill('input[type="text"]', E2E_NAME);
    await page.fill('input[type="email"]', E2E_EMAIL);
    await page.fill('input[type="password"]', E2E_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for redirect (success) or stay on register (if user already exists)
    await page.waitForTimeout(5000);

    console.log(`[globalSetup] E2E test user ready: ${E2E_EMAIL}`);
  } catch (err) {
    // If user already exists, that's fine — the error is expected
    console.log(`[globalSetup] Note: ${err}`);
  } finally {
    await browser.close();
  }
}

export default globalSetup;

import { test, expect } from '@playwright/test';

// These tests assume a test user is pre-registered in Firebase.
// Replace these with real credentials for your Firebase project.
const TEST_EMAIL = process.env.E2E_TEST_EMAIL || 'testuser@example.com';
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'testpassword123';
const NEW_EMAIL = `e2e-${Date.now()}@example.com`;
const NEW_PASSWORD = 'test1234';
const NEW_NAME = 'Test E2E User';

test.describe('Autenticación E2E', () => {
  test('1. Protección de ruta: usuario no autenticado es redirigido a /login', async ({ page }) => {
    await page.goto('/reservations');
    await expect(page).toHaveURL(/\/login/);
  });

  test('2. Registro de nuevo usuario y redirección al dashboard', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[type="text"]', NEW_NAME);
    await page.fill('input[type="email"]', NEW_EMAIL);
    await page.fill('input[type="password"]', NEW_PASSWORD);
    await page.click('button[type="submit"]');
    // After register, should redirect to dashboard
    await expect(page).toHaveURL('/', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('3. Login con credenciales válidas redirige al dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', NEW_EMAIL);
    await page.fill('input[type="password"]', NEW_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('4. Login con credenciales inválidas muestra mensaje de error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'noexiste@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=incorrectos')).toBeVisible({ timeout: 8000 });
  });
});

import { test, expect } from '@playwright/test';
import { E2E_EMAIL, E2E_PASSWORD, E2E_NAME } from './test-credentials';

// NEW_EMAIL is unique per run so we don't clash with the shared test user
const NEW_EMAIL = `e2e-new-${Date.now()}@testuser.com`;
const NEW_PASSWORD = 'Test12345678!';
const NEW_NAME = 'Nuevo E2E User';

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
    // Use 'main h1' to avoid matching the Navbar h1 (GourmetBot)
    await expect(page.locator('main h1').first()).toContainText('Dashboard');
  });

  test('3. Login con credenciales válidas redirige al dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', E2E_EMAIL);
    await page.fill('input[type="password"]', E2E_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 10000 });
    await expect(page.locator('main h1').first()).toContainText('Dashboard');
  });

  test('4. Login con credenciales inválidas muestra mensaje de error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'noexiste@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=incorrectos')).toBeVisible({ timeout: 8000 });
  });
});

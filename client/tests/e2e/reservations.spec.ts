import { test, expect } from '@playwright/test';
import { E2E_EMAIL, E2E_PASSWORD } from './test-credentials';

test.describe('CRUD de Reservas E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Log in using the shared test user (registered in globalSetup)
    await page.goto('/login');
    await page.fill('input[type="email"]', E2E_EMAIL);
    await page.fill('input[type="password"]', E2E_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('/', { timeout: 10000 });
  });

  test('5. Usuario logueado puede crear una reserva', async ({ page }) => {
    await page.goto('/reservations');
    await page.click('text=Nueva Reserva');
    // Fill the modal
    await page.selectOption('select', { index: 1 });
    await page.fill('input[placeholder="Ej. Juan Pérez"]', 'Test E2E');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await page.fill('input[type="date"]', dateStr);
    await page.click('text=Guardar');
    // Reservation should appear in list (use first() since previous runs may have left duplicates)
    await expect(page.locator('text=Test E2E').first()).toBeVisible({ timeout: 8000 });
  });

  test('6. Usuario ve el listado de reservas', async ({ page }) => {
    await page.goto('/reservations');
    await expect(page.locator('table')).toBeVisible();
  });
});

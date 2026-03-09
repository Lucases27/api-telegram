import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.E2E_TEST_EMAIL || 'testuser@example.com';
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'testpassword123';

test.describe('CRUD de Reservas E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Log in before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
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
    // Reservation should appear in list
    await expect(page.locator('text=Test E2E')).toBeVisible({ timeout: 8000 });
  });

  test('6. Usuario ve el listado de reservas', async ({ page }) => {
    await page.goto('/reservations');
    await expect(page.locator('table')).toBeVisible();
  });
});

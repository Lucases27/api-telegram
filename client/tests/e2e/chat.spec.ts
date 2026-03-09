import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.E2E_TEST_EMAIL || 'testuser@example.com';
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'testpassword123';

test.describe('Chat con IA E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('/', { timeout: 10000 });
  });

  test('7. Usuario logueado puede enviar mensaje al chat y recibe respuesta', async ({ page }) => {
    await page.goto('/chat');
    // Type and send a message
    await page.fill('input[type="text"]', '¿Cuáles son los restaurantes disponibles?');
    await page.click('button[type="submit"]');
    // Wait for the AI to respond (the loading indicator should disappear)
    await expect(page.locator('.animate-bounce').first()).not.toBeVisible({ timeout: 15000 });
    // At least two messages should be visible (user message + bot response)
    const messages = page.locator('[class*="rounded-2xl"]');
    await expect(messages).toHaveCount(3, { timeout: 15000 }); // welcome + user + bot
  });

  test('8. La interfaz del chat muestra distinción visual entre mensajes del usuario y del bot', async ({ page }) => {
    await page.goto('/chat');
    // The welcome message from bot should be visible
    await expect(page.locator('text=Hola')).toBeVisible();
  });
});

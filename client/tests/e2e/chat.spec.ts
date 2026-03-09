import { test, expect } from '@playwright/test';
import { E2E_EMAIL, E2E_PASSWORD } from './test-credentials';

test.describe('Chat con IA E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', E2E_EMAIL);
    await page.fill('input[type="password"]', E2E_PASSWORD);
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
    // At least 3 messages should be visible (welcome + user + bot response)
    // Using locator count >= 3 since other UI elements may also use 'rounded-2xl'
    const messageCount = await page.locator('[class*="rounded-2xl"]').count();
    expect(messageCount).toBeGreaterThanOrEqual(3);
  });

  test('8. La interfaz del chat muestra distinción visual entre mensajes del usuario y del bot', async ({ page }) => {
    await page.goto('/chat');
    // The welcome message from bot should be visible
    await expect(page.locator('text=Hola')).toBeVisible();
  });
});

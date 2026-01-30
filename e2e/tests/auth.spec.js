import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    // Check that login form is visible
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByPlaceholder(/username|utilizator/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password|parola/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /login|autentificare/i })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByPlaceholder(/username|utilizator/i).fill('wronguser');
    await page.getByPlaceholder(/password|parola/i).fill('wrongpassword');
    await page.getByRole('button', { name: /login|autentificare/i }).click();

    // Wait for error message
    await expect(page.getByText(/invalid|greșit|incorrect/i)).toBeVisible({ timeout: 5000 });
  });

  test('should login with valid credentials', async ({ page }) => {
    // Note: This test requires a seeded test user in the database
    await page.getByPlaceholder(/username|utilizator/i).fill('admin');
    await page.getByPlaceholder(/password|parola/i).fill('admin123');
    await page.getByRole('button', { name: /login|autentificare/i }).click();

    // Should redirect to dashboard after login
    await expect(page).toHaveURL(/dashboard/i, { timeout: 10000 });
  });

  test('should persist session across page reload', async ({ page }) => {
    // Login first
    await page.getByPlaceholder(/username|utilizator/i).fill('admin');
    await page.getByPlaceholder(/password|parola/i).fill('admin123');
    await page.getByRole('button', { name: /login|autentificare/i }).click();

    // Wait for dashboard
    await expect(page).toHaveURL(/dashboard/i, { timeout: 10000 });

    // Reload page
    await page.reload();

    // Should still be on dashboard (session persisted)
    await expect(page).toHaveURL(/dashboard/i);
  });

  test('should logout and redirect to login', async ({ page }) => {
    // Login first
    await page.getByPlaceholder(/username|utilizator/i).fill('admin');
    await page.getByPlaceholder(/password|parola/i).fill('admin123');
    await page.getByRole('button', { name: /login|autentificare/i }).click();

    // Wait for dashboard
    await expect(page).toHaveURL(/dashboard/i, { timeout: 10000 });

    // Click logout button
    await page.getByRole('button', { name: /logout|deconectare/i }).click();

    // Should be redirected to login
    await expect(page).toHaveURL(/login|\/$/);
  });

  test('should protect routes from unauthenticated access', async ({ page }) => {
    // Try to access dashboard directly without login
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/login|\/$/);
  });
});

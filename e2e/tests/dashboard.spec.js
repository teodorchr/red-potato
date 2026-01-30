import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.getByPlaceholder(/username|utilizator/i).fill('admin');
    await page.getByPlaceholder(/password|parola/i).fill('admin123');
    await page.getByRole('button', { name: /login|autentificare/i }).click();
    await expect(page).toHaveURL(/dashboard/i, { timeout: 10000 });
  });

  test('should display dashboard statistics', async ({ page }) => {
    // Check for stat cards
    await expect(page.getByText(/total|clients|clienți/i).first()).toBeVisible();
  });

  test('should display upcoming expirations', async ({ page }) => {
    // Check for expiring section
    const expiringSection = page.getByText(/expir|upcoming/i).first();
    await expect(expiringSection).toBeVisible();
  });

  test('should navigate to clients from dashboard', async ({ page }) => {
    await page.getByRole('link', { name: /clients|clienți/i }).click();
    await expect(page).toHaveURL(/clients/i);
  });

  test('should navigate to notifications from dashboard', async ({ page }) => {
    await page.getByRole('link', { name: /notification|notificări/i }).click();
    await expect(page).toHaveURL(/notification/i);
  });

  test('should show recent clients', async ({ page }) => {
    // Dashboard should show recent clients section
    await expect(page.getByText(/recent/i)).toBeVisible();
  });
});

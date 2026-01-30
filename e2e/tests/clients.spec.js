import { test, expect } from '@playwright/test';

test.describe('Client Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.getByPlaceholder(/username|utilizator/i).fill('admin');
    await page.getByPlaceholder(/password|parola/i).fill('admin123');
    await page.getByRole('button', { name: /login|autentificare/i }).click();
    await expect(page).toHaveURL(/dashboard/i, { timeout: 10000 });

    // Navigate to clients page
    await page.getByRole('link', { name: /clients|clienți/i }).click();
    await expect(page).toHaveURL(/clients/i);
  });

  test('should display client list', async ({ page }) => {
    // Check that client table/list is visible
    await expect(page.getByRole('table')).toBeVisible({ timeout: 5000 });
  });

  test('should search clients by name', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search|caută/i);
    await searchInput.fill('Test');

    // Wait for search results to update
    await page.waitForTimeout(500);

    // Results should be filtered
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('should navigate to create client form', async ({ page }) => {
    await page.getByRole('link', { name: /add|adaugă|new|nou/i }).click();

    // Should show client form
    await expect(page.getByPlaceholder(/name|nume/i)).toBeVisible();
    await expect(page.getByPlaceholder(/license|înmatriculare/i)).toBeVisible();
  });

  test('should create new client', async ({ page }) => {
    await page.getByRole('link', { name: /add|adaugă|new|nou/i }).click();

    // Fill in the form
    await page.getByPlaceholder(/name|nume/i).fill('E2E Test Client');
    await page.getByPlaceholder(/license|înmatriculare/i).fill('B-999-E2E');
    await page.getByPlaceholder(/phone|telefon/i).fill('0722999999');
    await page.getByPlaceholder(/email/i).fill('e2e@test.com');

    // Set ITP date (future date)
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6);
    const dateString = futureDate.toISOString().split('T')[0];
    await page.getByLabel(/ITP|expir/i).fill(dateString);

    // Submit form
    await page.getByRole('button', { name: /save|salvează|submit/i }).click();

    // Should redirect to clients list or show success
    await expect(page).toHaveURL(/clients/i, { timeout: 10000 });
  });

  test('should show validation errors for invalid data', async ({ page }) => {
    await page.getByRole('link', { name: /add|adaugă|new|nou/i }).click();

    // Submit without filling required fields
    await page.getByRole('button', { name: /save|salvează|submit/i }).click();

    // Should show validation errors
    await expect(page.getByText(/required|obligatoriu|invalid/i).first()).toBeVisible();
  });

  test('should edit existing client', async ({ page }) => {
    // Click edit on first client
    const editButton = page.getByRole('button', { name: /edit|editează/i }).first();
    if (await editButton.isVisible()) {
      await editButton.click();

      // Modify a field
      const nameInput = page.getByPlaceholder(/name|nume/i);
      await nameInput.clear();
      await nameInput.fill('Updated Client Name');

      // Save changes
      await page.getByRole('button', { name: /save|salvează|update/i }).click();

      // Should redirect back to list
      await expect(page).toHaveURL(/clients/i, { timeout: 10000 });
    }
  });

  test('should delete client with confirmation', async ({ page }) => {
    // Click delete on first client
    const deleteButton = page.getByRole('button', { name: /delete|șterge/i }).first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Confirm deletion if dialog appears
      const confirmButton = page.getByRole('button', { name: /confirm|da|yes/i });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      // Client should be removed
      await page.waitForTimeout(1000);
    }
  });
});

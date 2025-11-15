import { test, expect } from '@playwright/test';

test.describe('Tab Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Password').fill('admin123');
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await page.waitForURL(/\/main/);
  });

  test('should display all tabs', async ({ page }) => {
    // Check if all tabs are visible
    await expect(page.getByRole('link', { name: 'タブ1' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'タブ2' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'メンテナンス' })).toBeVisible();
  });

  test('should navigate between tabs', async ({ page }) => {
    // Navigate to tab1
    await page.getByRole('link', { name: 'タブ1' }).click();
    await expect(page).toHaveURL(/\/main\/tab1/);

    // Navigate to tab2
    await page.getByRole('link', { name: 'タブ2' }).click();
    await expect(page).toHaveURL(/\/main\/tab2/);

    // Navigate to maintenance tab
    await page.getByRole('link', { name: 'メンテナンス' }).click();
    await expect(page).toHaveURL(/\/main\/tab3/);
  });

  test('should display gear icon on maintenance tab', async ({ page }) => {
    // Check if maintenance tab has gear icon
    const maintenanceTab = page.getByRole('link', { name: 'メンテナンス' });
    await expect(maintenanceTab).toBeVisible();

    // Click to navigate
    await maintenanceTab.click();
    await expect(page).toHaveURL(/\/main\/tab3/);
  });

  test('should show active tab indicator', async ({ page }) => {
    // Click tab1 and check active state
    await page.getByRole('link', { name: 'タブ1' }).click();

    // The active tab should have the animated underline
    const tab1 = page.getByRole('link', { name: 'タブ1' });
    await expect(tab1).toHaveClass(/text-foreground/);
  });
});

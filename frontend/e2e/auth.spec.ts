import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    // Check if login form is displayed
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('should login with credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in login form
    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Password').fill('admin123');

    // Click login button
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // Wait for navigation to main page
    await page.waitForURL(/\/main/);

    // Verify we're on the main page
    await expect(page).toHaveURL(/\/main/);
  });

  test('should show SSO login options', async ({ page }) => {
    await page.goto('/login');

    // Check for SSO buttons
    await expect(page.getByRole('button', { name: 'Login with Google' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login with Github' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login with Azure AD', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login with Azure AD B2C' })).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Company Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Password').fill('admin123');
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await page.waitForURL(/\/main/);

    // Navigate to maintenance tab
    await page.getByRole('link', { name: 'メンテナンス' }).click();
    await page.waitForURL(/\/main\/tab3/);
  });

  test('should display company management card on maintenance page', async ({ page }) => {
    // Check if company management card is visible
    await expect(page.getByRole('heading', { name: '会社管理' })).toBeVisible();
    await expect(page.getByText('会社情報の登録・編集・削除')).toBeVisible();
  });

  test('should navigate to company management page', async ({ page }) => {
    // Click company management card
    await page.getByRole('button', { name: '会社管理を開く' }).click();

    // Verify navigation
    await expect(page).toHaveURL(/\/main\/tab3\/company/);
    await expect(page.getByRole('heading', { name: '会社管理' })).toBeVisible();
  });

  test('should display company list', async ({ page }) => {
    // Navigate to company page
    await page.goto('/main/tab3/company');

    // Wait for data to load
    await page.waitForTimeout(1000);

    // Check if company table is visible
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('should open new company dialog', async ({ page }) => {
    // Navigate to company page
    await page.goto('/main/tab3/company');

    // Click new company button
    await page.getByRole('button', { name: '会社を追加' }).click();

    // Check if dialog is open
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('新規会社追加')).toBeVisible();
  });

  test('should create new company', async ({ page }) => {
    // Navigate to company page
    await page.goto('/main/tab3/company');

    // Click new company button
    await page.getByRole('button', { name: '会社を追加' }).click();

    // Fill in form
    const uniqueCode = `TEST${Date.now()}`;
    await page.getByLabel('会社コード *').fill(uniqueCode);
    await page.getByLabel('会社名 *').fill(`Test Company ${Date.now()}`);

    // Submit form
    await page.getByRole('button', { name: '追加' }).click();

    // Wait for success message
    await page.waitForTimeout(1000);

    // Verify company was created
    await expect(page.getByText(uniqueCode)).toBeVisible();
  });
});

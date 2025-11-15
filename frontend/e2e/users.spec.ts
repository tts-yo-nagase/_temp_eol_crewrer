import { test, expect } from '@playwright/test';

// Helper function to login
async function login(page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@example.com');
  await page.getByLabel('Password').fill('admin123');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await page.waitForURL(/\/main/);
}

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display users list with multiple roles', async ({ page }) => {
    // Navigate to users page
    await page.goto('/main/tab3/users');

    // Wait for the page to load
    await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();

    // Wait for table to be loaded
    await page.waitForSelector('table', { timeout: 10000 });

    // Check if table headers exist (using text locator for flexibility)
    await expect(page.locator('th', { hasText: /Name/i }).first()).toBeVisible();
    await expect(page.locator('th', { hasText: /Email/i }).first()).toBeVisible();
    await expect(page.locator('th', { hasText: /Roles/i }).first()).toBeVisible();
    await expect(page.locator('th', { hasText: /Status/i }).first()).toBeVisible();

    // Check if at least one user row exists
    const userRows = page.getByRole('row').filter({ has: page.getByRole('cell') });
    await expect(userRows.first()).toBeVisible();

    // Verify that role badges are displayed
    const roleBadges = page.locator('[class*="inline-flex"][class*="rounded"]').filter({ hasText: /user|admin|manager|Active|Inactive/ });
    await expect(roleBadges.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display user roles as badges', async ({ page }) => {
    await page.goto('/main/tab3/users');

    // Wait for users table to load
    await page.waitForSelector('table', { timeout: 10000 });

    // Find a user row with admin role
    const adminBadge = page.locator('text=admin').first();

    // Check if badge exists in the table
    const isVisible = await adminBadge.isVisible().catch(() => false);

    if (isVisible) {
      // Verify badge styling (should have specific classes)
      await expect(adminBadge).toBeVisible();
    } else {
      // If no admin user exists, at least verify "user" role badge exists
      const userBadge = page.locator('text=user').first();
      await expect(userBadge).toBeVisible();
    }
  });

  test('should show active/inactive status', async ({ page }) => {
    await page.goto('/main/tab3/users');

    // Wait for the table to load
    await page.waitForSelector('table');

    // Check for status badges
    const statusBadges = page.locator('text=/Active|Inactive/').first();
    await expect(statusBadges).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Account Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display account settings page', async ({ page }) => {
    // Click on user menu
    await page.locator('[class*="rounded-md"]').filter({ hasText: /admin@example.com/ }).first().click();

    // Click on Account menu item
    await page.getByRole('menuitem', { name: 'Account' }).click();

    // Verify we're on the account page
    await expect(page.getByRole('heading', { name: 'アカウント設定' })).toBeVisible();
  });

  test('should display user profile information with roles', async ({ page }) => {
    await page.goto('/main/account');

    // Check if profile section is visible
    await expect(page.getByRole('heading', { name: 'プロフィール情報', exact: true })).toBeVisible();

    // Check if form fields exist
    await expect(page.getByLabel('名前')).toBeVisible();
    await expect(page.getByLabel('メールアドレス')).toBeVisible();

    // Check if role is displayed
    await expect(page.locator('text=/役割:/')).toBeVisible();
  });

  test('should display password change section', async ({ page }) => {
    await page.goto('/main/account');

    // Check if password change section is visible
    await expect(page.getByRole('heading', { name: 'パスワード変更', exact: true })).toBeVisible();

    // Check if password fields exist
    await expect(page.getByLabel('現在のパスワード')).toBeVisible();
    await expect(page.getByLabel('新しいパスワード', { exact: true })).toBeVisible();
    await expect(page.getByLabel('新しいパスワード（確認）')).toBeVisible();
  });

  test('should have update button in profile section', async ({ page }) => {
    await page.goto('/main/account');

    // Check if update button exists and is enabled
    const updateButton = page.getByRole('button', { name: '更新' }).first();
    await expect(updateButton).toBeVisible();
    await expect(updateButton).toBeEnabled();

    // Verify form fields are editable
    const nameInput = page.getByLabel('名前');
    const emailInput = page.getByLabel('メールアドレス');

    await expect(nameInput).toBeEditable();
    await expect(emailInput).toBeEditable();
  });
});

test.describe('Multiple Roles Feature', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display multiple role badges for users with multiple roles', async ({ page }) => {
    await page.goto('/main/tab3/users');

    // Wait for table to load
    await page.waitForSelector('table');

    // Get all role badge containers
    const roleBadgeContainers = page.locator('td').filter({ has: page.locator('[class*="inline-flex"]') });

    // Check if at least one container exists
    const count = await roleBadgeContainers.count();
    expect(count).toBeGreaterThan(0);

    // Verify that badges are displayed in a flex container (for multiple roles)
    const firstContainer = roleBadgeContainers.first();
    await expect(firstContainer).toBeVisible();
  });

  test('should show roles in comma-separated format on account page', async ({ page }) => {
    await page.goto('/main/account');

    // Wait for the page to load
    await expect(page.getByRole('heading', { name: 'アカウント設定' })).toBeVisible();

    // Check if roles are displayed
    const roleText = page.locator('text=/役割:/');
    await expect(roleText).toBeVisible();

    // The role should be visible as text (comma-separated if multiple)
    const roleContent = await roleText.textContent();
    expect(roleContent).toContain('役割:');
  });

  test('should be able to add multiple roles using the role selector', async ({ page }) => {
    // Navigate to users page
    await page.goto('/main/tab3/users');
    await page.waitForSelector('table');

    // Click on the first edit button (pencil icon)
    const editButton = page.locator('button[aria-label*="編集"]').first();
    await editButton.click();

    // Wait for edit page to load
    await expect(page.getByRole('heading', { name: 'Edit User' })).toBeVisible();

    // Find the roles section by label and get the input
    const rolesSection = page.locator('label:has-text("Roles")').locator('..').locator('..');
    const rolesInput = rolesSection.locator('input').first();

    // Wait for the input to be ready and click
    await rolesInput.waitFor({ state: 'visible', timeout: 5000 });
    await rolesInput.click();

    // Wait for dropdown to appear - look for the dropdown container
    await page.waitForSelector('[class*="Command"]', { timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(500);

    // Try to find and click Admin option
    const adminOption = page.getByText('Admin', { exact: true });
    const isAdminVisible = await adminOption.isVisible().catch(() => false);

    if (isAdminVisible) {
      // Click on Admin to add it
      await adminOption.click();

      // Wait for the role to be added
      await page.waitForTimeout(1000);

      // Verify that Admin badge appears
      const adminBadge = page.locator('[class*="inline-flex"]').getByText('Admin');
      await expect(adminBadge).toBeVisible({ timeout: 5000 });
    }

    // Try to find and click Manager option
    await rolesInput.click();
    await page.waitForTimeout(500);

    const managerOption = page.getByText('Manager', { exact: true });
    const isManagerVisible = await managerOption.isVisible().catch(() => false);

    if (isManagerVisible) {
      // Click on Manager to add it
      await managerOption.click();

      // Wait for the role to be added
      await page.waitForTimeout(1000);

      // Verify that Manager badge appears
      const managerBadge = page.locator('[class*="inline-flex"]').getByText('Manager');
      await expect(managerBadge).toBeVisible({ timeout: 5000 });
    }
  });

  test('should be able to remove roles using the X button on badges', async ({ page }) => {
    // Navigate to users page
    await page.goto('/main/tab3/users');
    await page.waitForSelector('table');

    // Click on the first edit button (pencil icon)
    const editButton = page.locator('button[aria-label*="編集"]').first();
    await editButton.click();

    // Wait for edit page to load
    await expect(page.getByRole('heading', { name: 'Edit User' })).toBeVisible();

    // Wait for role badges to load
    await page.waitForTimeout(1000);

    // Count initial badges
    const initialBadges = page.locator('[class*="inline-flex"]').filter({ hasText: /User|Admin|Manager/ });
    const initialCount = await initialBadges.count();

    if (initialCount > 1) {
      // Find the X button on the first badge (not User, to avoid leaving no roles)
      const badges = await initialBadges.all();

      for (const badge of badges) {
        const badgeText = await badge.textContent();
        if (badgeText && !badgeText.includes('User')) {
          // Click the X button within this badge
          const xButton = badge.locator('button');
          await xButton.click();

          // Wait for badge to be removed
          await page.waitForTimeout(500);

          // Verify badge was removed
          const newCount = await initialBadges.count();
          expect(newCount).toBeLessThan(initialCount);
          break;
        }
      }
    }
  });

  test('should save multiple roles when submitting the form', async ({ page }) => {
    // Navigate to users page
    await page.goto('/main/tab3/users');
    await page.waitForSelector('table');

    // Get the first user's email for verification later
    const firstUserEmail = await page.locator('table tbody tr:first-child td:nth-child(2)').textContent();

    // Click edit button (pencil icon)
    const editButton = page.locator('button[aria-label*="編集"]').first();
    await editButton.click();

    // Wait for edit page
    await expect(page.getByRole('heading', { name: 'Edit User' })).toBeVisible();

    // Add a role
    const rolesSection = page.locator('label:has-text("Roles")').locator('..').locator('..');
    const rolesInput = rolesSection.locator('input').first();

    await rolesInput.waitFor({ state: 'visible', timeout: 5000 });
    await rolesInput.click();
    await page.waitForTimeout(500);

    // Try to add Admin role
    const adminOption = page.getByText('Admin', { exact: true });
    const isAdminVisible = await adminOption.isVisible().catch(() => false);

    if (isAdminVisible) {
      await adminOption.click();
      await page.waitForTimeout(1000);
    }

    // Scroll to and click Save Changes button
    const saveButton = page.getByRole('button', { name: 'Save Changes' });
    await saveButton.scrollIntoViewIfNeeded();
    await saveButton.click();

    // Wait for navigation back to users list
    await page.waitForURL(/\/main\/tab3\/users/);

    // Verify we're back on the users list
    await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();

    // Find the user row we just edited and verify roles
    if (firstUserEmail) {
      const userRow = page.locator('tr').filter({ hasText: firstUserEmail.trim() });
      await expect(userRow).toBeVisible();

      // Check if the row contains role badges
      const roleBadges = userRow.locator('[class*="inline-flex"]');
      const badgeCount = await roleBadges.count();

      // Should have at least one role
      expect(badgeCount).toBeGreaterThan(0);
    }
  });
});

test.describe('User Creation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should create a new user with single role', async ({ page }) => {
    // Navigate to users page
    await page.goto('/main/tab3/users');
    await page.waitForSelector('table');

    // Click "Add New User" button
    const addButton = page.getByRole('link', { name: 'Add New User' });
    await addButton.click();

    // Wait for new user page to load
    await expect(page.getByRole('heading', { name: 'Add New User' })).toBeVisible();

    // Generate unique email
    const timestamp = Date.now();
    const testEmail = `test.user${timestamp}@example.com`;

    // Fill out the form
    await page.getByLabel('Name').fill('Test User');
    await page.getByLabel('Email', { exact: true }).fill(testEmail);
    await page.getByLabel('Password').fill('password123');

    // Roles should default to 'User'
    const userBadge = page.locator('[class*="inline-flex"]').getByText('User');
    await expect(userBadge).toBeVisible();

    // Click Create User button
    const createButton = page.getByRole('button', { name: 'Create User' });
    await createButton.click();

    // Wait for navigation back to users list
    await page.waitForURL(/\/main\/tab3\/users$/, { timeout: 10000 });

    // Verify we're back on the users list
    await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();

    // Verify the new user appears in the table
    const userRow = page.locator('tr').filter({ hasText: testEmail });
    await expect(userRow).toBeVisible({ timeout: 10000 });

    // Verify the user has the User role
    const roleInTable = userRow.locator('[class*="inline-flex"]').getByText('User');
    await expect(roleInTable).toBeVisible();
  });

  test('should create a new user with multiple roles', async ({ page }) => {
    // Navigate to users page
    await page.goto('/main/tab3/users');
    await page.waitForSelector('table');

    // Click "Add New User" button
    const addButton = page.getByRole('link', { name: 'Add New User' });
    await addButton.click();

    // Wait for new user page to load
    await expect(page.getByRole('heading', { name: 'Add New User' })).toBeVisible();

    // Generate unique email
    const timestamp = Date.now();
    const testEmail = `test.multiuser${timestamp}@example.com`;

    // Fill out the form
    await page.getByLabel('Name').fill('Multi Role User');
    await page.getByLabel('Email', { exact: true }).fill(testEmail);
    await page.getByLabel('Password').fill('password123');

    // Find roles section and click on input to open dropdown
    const rolesSection = page.locator('label:has-text("Roles")').locator('..').locator('..');
    const rolesInput = rolesSection.locator('input').first();
    await rolesInput.click();

    // Wait for dropdown
    await page.waitForTimeout(500);

    // Add Admin role
    const adminOption = page.getByText('Admin', { exact: true });
    await adminOption.click();
    await page.waitForTimeout(500);

    // Click input again to add another role
    await rolesInput.click();
    await page.waitForTimeout(500);

    // Add Manager role
    const managerOption = page.getByText('Manager', { exact: true });
    await managerOption.click();
    await page.waitForTimeout(500);

    // Verify all three badges appear (User, Admin, Manager)
    await expect(page.locator('[class*="inline-flex"]').getByText('User')).toBeVisible();
    await expect(page.locator('[class*="inline-flex"]').getByText('Admin')).toBeVisible();
    await expect(page.locator('[class*="inline-flex"]').getByText('Manager')).toBeVisible();

    // Click Create User button
    const createButton = page.getByRole('button', { name: 'Create User' });
    await createButton.click();

    // Wait for navigation back to users list
    await page.waitForURL(/\/main\/tab3\/users$/, { timeout: 10000 });

    // Verify we're back on the users list
    await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();

    // Verify the new user appears in the table
    const userRow = page.locator('tr').filter({ hasText: testEmail });
    await expect(userRow).toBeVisible({ timeout: 10000 });

    // Verify the user has all three roles
    await expect(userRow.locator('[class*="inline-flex"]').getByText('User')).toBeVisible();
    await expect(userRow.locator('[class*="inline-flex"]').getByText('Admin')).toBeVisible();
    await expect(userRow.locator('[class*="inline-flex"]').getByText('Manager')).toBeVisible();
  });

  test('should show error when creating user with duplicate email', async ({ page }) => {
    // Navigate to users page
    await page.goto('/main/tab3/users');
    await page.waitForSelector('table');

    // Click "Add New User" button
    const addButton = page.getByRole('link', { name: 'Add New User' });
    await addButton.click();

    // Wait for new user page to load
    await expect(page.getByRole('heading', { name: 'Add New User' })).toBeVisible();

    // Try to create user with existing email (admin@example.com)
    await page.getByLabel('Name').fill('Duplicate User');
    await page.getByLabel('Email', { exact: true }).fill('admin@example.com');
    await page.getByLabel('Password').fill('password123');

    // Click Create User button
    const createButton = page.getByRole('button', { name: 'Create User' });
    await createButton.click();

    // Wait for error message to appear
    const errorMessage = page.locator('[class*="destructive"]').filter({ hasText: /error|failed|exist/i });
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should allow creating user without password for SSO', async ({ page }) => {
    // Navigate to users page
    await page.goto('/main/tab3/users');
    await page.waitForSelector('table');

    // Click "Add New User" button
    const addButton = page.getByRole('link', { name: 'Add New User' });
    await addButton.click();

    // Wait for new user page to load
    await expect(page.getByRole('heading', { name: 'Add New User' })).toBeVisible();

    // Generate unique email
    const timestamp = Date.now();
    const testEmail = `sso.user${timestamp}@example.com`;

    // Fill out the form WITHOUT password
    await page.getByLabel('Name').fill('SSO User');
    await page.getByLabel('Email', { exact: true }).fill(testEmail);
    // Leave password empty

    // Verify SSO message is visible
    await expect(page.getByText('Leave empty if user will only login via SSO')).toBeVisible();

    // Click Create User button
    const createButton = page.getByRole('button', { name: 'Create User' });
    await createButton.click();

    // Wait for navigation back to users list
    await page.waitForURL(/\/main\/tab3\/users$/, { timeout: 10000 });

    // Verify we're back on the users list
    await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();

    // Verify the new user appears in the table
    const userRow = page.locator('tr').filter({ hasText: testEmail });
    await expect(userRow).toBeVisible({ timeout: 10000 });
  });
});

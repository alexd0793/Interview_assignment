const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { InventoryPage } = require('../pages/InventoryPage');
const { users, messages } = require('../utils/test-data');

test.describe('Authentication regression suite', () => {
  test('AUTH_001 - standard user can log in successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);

    await inventoryPage.assertInventoryLoaded();
    await expect(page).toHaveURL(/inventory.html/);
  });

  test('AUTH_002 - locked out user sees correct error message', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);

    await loginPage.assertError(messages.lockedOut);
  });

  test('AUTH_003 - invalid credentials show authentication error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(users.invalid.username, users.invalid.password);

    await loginPage.assertError(messages.invalidCredentials);
  });

  test('AUTH_004 - empty username triggers validation error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('', users.standard.password);

    await loginPage.assertError(messages.usernameRequired);
  });

  test('AUTH_005 - empty password triggers validation error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(users.standard.username, '');

    await loginPage.assertError(messages.passwordRequired);
  });

  test('AUTH_006 - empty username and password trigger validation error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('', '');

    await loginPage.assertError(messages.usernameRequired);
  });

  test('AUTH_007 - error banner can be dismissed', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(users.invalid.username, users.invalid.password);
    await loginPage.assertError(messages.invalidCredentials);
    await loginPage.dismissError();
  });

  test('AUTH_008 - user can log out successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.logout();

    await loginPage.assertOnLoginPage();
  });

  test('AUTH_009 - protected route redirects unauthenticated user to login page', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await page.goto('/inventory.html');

    await loginPage.assertOnLoginPage();
  });

  test('AUTH_010 - browser back after logout does not restore authenticated access', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.logout();
    await page.goBack();

    await expect(page).not.toHaveURL(/inventory.html/);
    await loginPage.assertOnLoginPage();
  });
});

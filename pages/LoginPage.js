const { expect } = require('@playwright/test');

class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.errorCloseButton = page.locator('[data-test="error-button"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  async login(username, password) {
    if (username !== undefined) await this.usernameInput.fill(username);
    if (password !== undefined) await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async assertOnLoginPage() {
    await expect(this.loginButton).toBeVisible();
    await expect(this.page).toHaveURL(/saucedemo\.com\/?$/);
  }

  async assertError(message) {
    await expect(this.errorMessage).toHaveText(message);
  }

  async dismissError() {
    await this.errorCloseButton.click();
    await expect(this.errorMessage).toBeHidden();
  }
}

module.exports = { LoginPage };

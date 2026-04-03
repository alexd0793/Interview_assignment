const { expect } = require('@playwright/test');

class CheckoutPage {
  constructor(page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.completeHeader = page.locator('[data-test="complete-header"]');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.itemTotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
  }

  async assertCheckoutInfoLoaded() {
    await expect(this.title).toHaveText('Checkout: Your Information');
  }

  async fillCheckoutInformation(firstName, lastName, postalCode) {
    if (firstName !== undefined) await this.firstNameInput.fill(firstName);
    if (lastName !== undefined) await this.lastNameInput.fill(lastName);
    if (postalCode !== undefined) await this.postalCodeInput.fill(postalCode);
  }

  async submitCheckoutInfo() {
    await this.continueButton.click();
  }

  async submitCheckoutInformation(firstName, lastName, postalCode) {
    await this.fillCheckoutInformation(firstName, lastName, postalCode);
    await this.submitCheckoutInfo();
  }

  async assertOverviewLoaded() {
    await expect(this.title).toHaveText('Checkout: Overview');
  }

  async finishOrder() {
    await this.finishButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async assertOrderCompleted(expectedMessage) {
    await expect(this.completeHeader).toHaveText(expectedMessage);
    await expect(this.backHomeButton).toBeVisible();
  }

  async assertError(message) {
    await expect(this.errorMessage).toHaveText(message);
  }

  async getSummaryNumbers() {
    const itemTotal = Number((await this.itemTotalLabel.textContent()).replace('Item total: $', ''));
    const tax = Number((await this.taxLabel.textContent()).replace('Tax: $', ''));
    const total = Number((await this.totalLabel.textContent()).replace('Total: $', ''));
    return { itemTotal, tax, total };
  }
}

module.exports = { CheckoutPage };

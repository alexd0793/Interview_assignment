const { expect } = require('@playwright/test');

class CartPage {
  constructor(page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    //this.cartItems = page.locator('[data-test="cart-item"]');
    this.cartItems = page.locator('.cart_item');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
  }

  removeButton(productName) {
    return this.page.locator(`[data-test="remove-${this.slugify(productName)}"]`);
  }

  cartItemByName(productName) {
    return this.page.locator('[data-test="inventory-item-name"]', { hasText: productName });
  }


 cartPriceByName(productName) {
  return this.page
    .locator('.cart_item')
    .filter({ hasText: productName })
    .locator('.inventory_item_price');
}

  async assertCartLoaded() {
    await expect(this.title).toHaveText('Your Cart');
  }

  async assertItemsCount(count) {
    await expect(this.cartItems).toHaveCount(count);
  }

  async removeProduct(productName) {
    await this.removeButton(productName).click();
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }

  slugify(productName) {
    return productName.toLowerCase().replace(/[()]/g, '').replace(/\./g, '').replace(/'/g, '').replace(/\s+/g, '-');
  }
}

module.exports = { CartPage };

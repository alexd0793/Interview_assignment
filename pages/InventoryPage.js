const { expect } = require('@playwright/test');

class InventoryPage {
  constructor(page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
    this.resetAppStateLink = page.locator('[data-test="reset-sidebar-link"]');
    this.backToProductsButton = page.locator('[data-test="back-to-products"]');
  }

  addToCartButton(productName) {
    return this.page.locator(`[data-test="add-to-cart-${this.slugify(productName)}"]`);
  }

  removeButton(productName) {
    return this.page.locator(`[data-test="remove-${this.slugify(productName)}"]`);
  }

  itemName(productName) {
    return this.page.locator('[data-test="inventory-item-name"]', { hasText: productName });
  }

  itemPriceWithinCard(productName) {
    const card = this.page.locator('[data-test="inventory-item"]', {
      has: this.page.locator('[data-test="inventory-item-name"]', { hasText: productName })
    });
    return card.locator('[data-test="inventory-item-price"]');
  }

  async assertInventoryLoaded() {
    await expect(this.title).toHaveText('Products');
    await expect(this.inventoryItems).toHaveCount(6);
  }

  async addProductToCart(productName) {
    await this.addToCartButton(productName).click();
  }

  async removeProductFromInventory(productName) {
    await this.removeButton(productName).click();
  }

  async openProductDetails(productName) {
    await this.itemName(productName).click();
  }

  async openCart() {
    await this.cartLink.click();
  }

  async sortBy(value) {
    await this.sortDropdown.selectOption(value);
  }

  async openMenu() {
    await this.menuButton.click();
    await expect(this.logoutLink).toBeVisible();
  }

  async logout() {
    await this.openMenu();
    await this.logoutLink.click();
  }

  async resetAppState() {
    await this.openMenu();
    await this.resetAppStateLink.click();
  }

  async getDisplayedProductNames() {
    return this.page.locator('[data-test="inventory-item-name"]').allTextContents();
  }

  async getDisplayedProductPrices() {
    const prices = await this.page.locator('[data-test="inventory-item-price"]').allTextContents();
    return prices.map((price) => Number(price.replace('$', '')));
  }

  async assertCartBadgeCount(count) {
    if (count === 0) {
      await expect(this.cartBadge).toHaveCount(0);
      return;
    }
    await expect(this.cartBadge).toHaveText(String(count));
  }

  async assertProductDetailPage(productName) {
    await expect(this.page.locator('[data-test="inventory-item-name"]')).toHaveText(productName);
    await expect(this.page.locator('[data-test="inventory-item-desc"]')).toBeVisible();
    await expect(this.page.locator('[data-test="inventory-item-price"]')).toBeVisible();
  }

  slugify(productName) {
    return productName.toLowerCase().replace(/[()]/g, '').replace(/\./g, '').replace(/'/g, '').replace(/\s+/g, '-');
  }
}

module.exports = { InventoryPage };

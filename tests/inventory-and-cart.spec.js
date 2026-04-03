const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { InventoryPage } = require('../pages/InventoryPage');
const { CartPage } = require('../pages/CartPage');
const { users, products, sortOptions } = require('../utils/test-data');

async function loginAsStandardUser(page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(users.standard.username, users.standard.password);
}

test.describe('Inventory and cart regression suite', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStandardUser(page);
  });

  test('INV_001 - inventory page displays all expected products', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.assertInventoryLoaded();

    const names = await inventoryPage.getDisplayedProductNames();
    expect(names).toEqual([
      products.backpack,
      products.bikeLight,
      products.boltShirt,
      products.fleeceJacket,
      products.onesie,
      products.redShirt
    ]);
  });

  test('INV_002 - product details page shows consistent name and visible price/description', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const listPrice = await inventoryPage.itemPriceWithinCard(products.backpack).textContent();

    await inventoryPage.openProductDetails(products.backpack);
    await inventoryPage.assertProductDetailPage(products.backpack);

    await expect(page.locator('[data-test="inventory-item-price"]')).toHaveText(listPrice);
    await inventoryPage.backToProductsButton.click();
    await inventoryPage.assertInventoryLoaded();
  });

  test('INV_003 - sort by name A to Z displays correct order', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.sortBy(sortOptions.az);

    const names = await inventoryPage.getDisplayedProductNames();
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  test('INV_004 - sort by name Z to A displays correct order', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.sortBy(sortOptions.za);

    const names = await inventoryPage.getDisplayedProductNames();
    expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
  });

  test('INV_005 - sort by price low to high displays ascending price order', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.sortBy(sortOptions.lohi);

    const prices = await inventoryPage.getDisplayedProductPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('INV_006 - sort by price high to low displays descending price order', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.sortBy(sortOptions.hilo);

    const prices = await inventoryPage.getDisplayedProductPrices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('CART_001 - user can add a single product to cart', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await inventoryPage.addProductToCart(products.backpack);
    await inventoryPage.assertCartBadgeCount(1);
    await inventoryPage.openCart();
    await cartPage.assertCartLoaded();
    await expect(cartPage.cartItemByName(products.backpack)).toBeVisible();
  });

  test('CART_002 - user can add multiple products to cart', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await inventoryPage.addProductToCart(products.backpack);
    await inventoryPage.addProductToCart(products.bikeLight);
    await inventoryPage.addProductToCart(products.onesie);

    await inventoryPage.assertCartBadgeCount(3);
    await inventoryPage.openCart();
    await cartPage.assertItemsCount(3);
  });

  test('CART_003 - removing a product from inventory updates cart badge', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.addProductToCart(products.backpack);
    await inventoryPage.addProductToCart(products.bikeLight);
    await inventoryPage.assertCartBadgeCount(2);

    await inventoryPage.removeProductFromInventory(products.bikeLight);
    await inventoryPage.assertCartBadgeCount(1);
  });

  test('CART_004 - removing a product from cart updates item list and badge', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await inventoryPage.addProductToCart(products.backpack);
    await inventoryPage.addProductToCart(products.bikeLight);
    await inventoryPage.openCart();

    await cartPage.removeProduct(products.bikeLight);
    await cartPage.assertItemsCount(1);
    await expect(cartPage.cartItemByName(products.bikeLight)).toHaveCount(0);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
  });

  test('CART_005 - continue shopping navigates back to inventory page', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await inventoryPage.addProductToCart(products.backpack);
    await inventoryPage.openCart();
    await cartPage.continueShopping();

    await inventoryPage.assertInventoryLoaded();
    await inventoryPage.assertCartBadgeCount(1);
  });

  test('CART_006 - cart state persists when navigating between pages', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await inventoryPage.addProductToCart(products.fleeceJacket);
    await inventoryPage.openProductDetails(products.backpack);
    await inventoryPage.backToProductsButton.click();
    await inventoryPage.openCart();

    await expect(cartPage.cartItemByName(products.fleeceJacket)).toBeVisible();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
  });

  test('CART_007 - direct checkout from empty cart is accessible and shows zero items', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await inventoryPage.openCart();
    await cartPage.assertItemsCount(0);
    await cartPage.proceedToCheckout();
    await expect(page).toHaveURL(/checkout-step-one.html/);
  });

  test('CART_008 - item name and price remain consistent between inventory and cart', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    const inventoryPrice = await inventoryPage.itemPriceWithinCard(products.onesie).textContent();
    await inventoryPage.addProductToCart(products.onesie);
    await inventoryPage.openCart();

    await expect(cartPage.cartItemByName(products.onesie)).toBeVisible();
    await expect(cartPage.cartPriceByName(products.onesie)).toHaveText(inventoryPrice);
  });

  test('CART_009 - reset app state clears cart badge and removes items', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await inventoryPage.addProductToCart(products.backpack);
    await inventoryPage.addProductToCart(products.bikeLight);
    await inventoryPage.resetAppState();
    await inventoryPage.assertCartBadgeCount(0);
    await inventoryPage.openCart();
    await cartPage.assertItemsCount(0);
  });
});

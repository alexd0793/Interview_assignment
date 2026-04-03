const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { InventoryPage } = require('../pages/InventoryPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');
const { users, products, checkout, messages } = require('../utils/test-data');

async function loginAndOpenCheckout(page, items = []) {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);

  await loginPage.goto();
  await loginPage.login(users.standard.username, users.standard.password);

  for (const item of items) {
    await inventoryPage.addProductToCart(item);
  }

  await inventoryPage.openCart();
  await cartPage.proceedToCheckout();
}

test.describe('Checkout and order placement regression suite', () => {
  test('CHK_001 - user can complete order with a single item', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    await loginAndOpenCheckout(page, [products.backpack]);
    await checkoutPage.submitCheckoutInformation(
      checkout.validCustomer.firstName,
      checkout.validCustomer.lastName,
      checkout.validCustomer.postalCode
    );
    await checkoutPage.assertOverviewLoaded();
    await checkoutPage.finishOrder();
    await checkoutPage.assertOrderCompleted(messages.completeOrder);
  });

  test('CHK_002 - user can complete order with multiple items', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    await loginAndOpenCheckout(page, [products.backpack, products.bikeLight, products.onesie]);
    await checkoutPage.submitCheckoutInformation(
      checkout.validCustomer.firstName,
      checkout.validCustomer.lastName,
      checkout.validCustomer.postalCode
    );
    await checkoutPage.assertOverviewLoaded();
    //await expect(page.locator('[data-test="cart-item"]')).toHaveCount(3);
    await expect(page.locator('.cart_item')).toHaveCount(3);
    await checkoutPage.finishOrder();
    await checkoutPage.assertOrderCompleted(messages.completeOrder);
  });

  test('CHK_003 - missing first name blocks checkout progression', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    await loginAndOpenCheckout(page, [products.backpack]);
    await checkoutPage.submitCheckoutInformation('', checkout.validCustomer.lastName, checkout.validCustomer.postalCode);

    await checkoutPage.assertError(messages.firstNameRequired);
  });

  test('CHK_004 - missing last name blocks checkout progression', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    await loginAndOpenCheckout(page, [products.backpack]);
    await checkoutPage.submitCheckoutInformation(checkout.validCustomer.firstName, '', checkout.validCustomer.postalCode);

    await checkoutPage.assertError(messages.lastNameRequired);
  });

  test('CHK_005 - missing postal code blocks checkout progression', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    await loginAndOpenCheckout(page, [products.backpack]);
    await checkoutPage.submitCheckoutInformation(checkout.validCustomer.firstName, checkout.validCustomer.lastName, '');

    await checkoutPage.assertError(messages.postalCodeRequired);
  });

  test('CHK_006 - spaces-only first name still allows continuation as current app behavior', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    await loginAndOpenCheckout(page, [products.backpack]);
    await checkoutPage.submitCheckoutInformation('   ', checkout.validCustomer.lastName, checkout.validCustomer.postalCode);

    await checkoutPage.assertOverviewLoaded();
  });

  test('CHK_007 - long input values are accepted in checkout form', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    await loginAndOpenCheckout(page, [products.bikeLight]);
    await checkoutPage.submitCheckoutInformation(
      checkout.longCustomer.firstName,
      checkout.longCustomer.lastName,
      checkout.longCustomer.postalCode
    );

    await checkoutPage.assertOverviewLoaded();
  });

  test('CHK_008 - checkout accepts special characters in customer information fields', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    await loginAndOpenCheckout(page, [products.onesie]);
    await checkoutPage.submitCheckoutInformation(
      checkout.specialCharsCustomer.firstName,
      checkout.specialCharsCustomer.lastName,
      checkout.specialCharsCustomer.postalCode
    );

    await checkoutPage.assertOverviewLoaded();
  });

  test('CHK_009 - cancel from checkout information returns user to cart', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    const cartPage = new CartPage(page);

    await loginAndOpenCheckout(page, [products.backpack]);
    await checkoutPage.cancel();

    await cartPage.assertCartLoaded();
    await cartPage.assertItemsCount(1);
  });

  test('CHK_010 - cancel from checkout overview returns user to inventory', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginAndOpenCheckout(page, [products.backpack]);
    await checkoutPage.submitCheckoutInformation(
      checkout.validCustomer.firstName,
      checkout.validCustomer.lastName,
      checkout.validCustomer.postalCode
    );
    await checkoutPage.cancel();

    await inventoryPage.assertInventoryLoaded();
  });

  test('CHK_011 - checkout summary shows correct item total, tax and final total', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    await loginAndOpenCheckout(page, [products.backpack, products.bikeLight]);
    await checkoutPage.submitCheckoutInformation(
      checkout.validCustomer.firstName,
      checkout.validCustomer.lastName,
      checkout.validCustomer.postalCode
    );

    const { itemTotal, tax, total } = await checkoutPage.getSummaryNumbers();
    expect(total).toBeCloseTo(itemTotal + tax, 2);
  });

  test('CHK_012 - item name and price remain consistent between cart and checkout overview', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);

    const inventoryPrice = await inventoryPage.itemPriceWithinCard(products.backpack).textContent();
    await inventoryPage.addProductToCart(products.backpack);
    await inventoryPage.openCart();
    const cartPrice = await cartPage.cartPriceByName(products.backpack).textContent();
    await cartPage.proceedToCheckout();
    await checkoutPage.submitCheckoutInformation(
      checkout.validCustomer.firstName,
      checkout.validCustomer.lastName,
      checkout.validCustomer.postalCode
    );

    await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText(products.backpack);
    await expect(page.locator('[data-test="inventory-item-price"]')).toHaveText(inventoryPrice);
    expect(cartPrice).toBe(inventoryPrice);
  });

  test('CHK_013 - removing an item before checkout changes checkout summary total', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.addProductToCart(products.backpack);
    await inventoryPage.addProductToCart(products.fleeceJacket);
    await inventoryPage.openCart();
    await cartPage.removeProduct(products.fleeceJacket);
    await cartPage.proceedToCheckout();
    await checkoutPage.submitCheckoutInformation(
      checkout.validCustomer.firstName,
      checkout.validCustomer.lastName,
      checkout.validCustomer.postalCode
    );

    const summary = await checkoutPage.getSummaryNumbers();
    expect(summary.itemTotal).toBe(29.99);
  });

  test('CHK_014 - completing order and clicking Back Home returns user to inventory', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginAndOpenCheckout(page, [products.backpack]);
    await checkoutPage.submitCheckoutInformation(
      checkout.validCustomer.firstName,
      checkout.validCustomer.lastName,
      checkout.validCustomer.postalCode
    );
    await checkoutPage.finishOrder();
    await checkoutPage.backHomeButton.click();

    await inventoryPage.assertInventoryLoaded();
  });
});

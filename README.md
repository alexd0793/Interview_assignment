# SauceDemo Senior QA Regression Suite - Playwright + JavaScript

This project contains a broader, interview-ready functional regression suite for https://www.saucedemo.com.

## Scope covered

### Authentication
- valid login
- locked out user
- invalid credentials
- missing username/password validations
- dismissible error banner
- logout
- protected route access without authentication
- browser back after logout

### Inventory / Product listing / Cart
- inventory visibility and expected product set
- product details consistency
- all sorting modes
- add/remove single and multiple products
- cart badge validation
- continue shopping
- cart persistence across navigation
- empty cart access to checkout flow
- data consistency between inventory and cart
- reset app state behavior

### Checkout / Order placement
- successful order with one item
- successful order with multiple items
- mandatory checkout field validations
- spaces-only input current behavior coverage
- long input values
- special characters in customer data
- cancel flows from step one and overview
- summary total validation
- data consistency across cart and checkout overview
- total recalculation after item removal
- Back Home navigation after order completion

## Tech stack
- JavaScript
- Playwright Test
- Page Object Model

## Project structure
- `pages/` - page objects
- `tests/` - test specs grouped by feature area
- `utils/` - reusable test data

## Installation
```bash
npm install
npx playwright install
```

## Run all tests
```bash
npm test
```

## Run in headed mode
```bash
npm run test:headed
```

## Notes for interview discussion
This suite is intentionally positioned as a **risk-based functional regression baseline**, not as an absolute exhaustive universe of all possible tests. It focuses on the highest-value functional flows requested in the assignment while still adding senior-level coverage around access control, state consistency, boundary-like UI validation, and navigation recovery.

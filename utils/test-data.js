module.exports = {
  users: {
    standard: { username: 'standard_user', password: 'secret_sauce' },
    lockedOut: { username: 'locked_out_user', password: 'secret_sauce' },
    invalid: { username: 'invalid_user', password: 'wrong_password' }
  },
  checkout: {
    validCustomer: {
      firstName: 'Giorgi',
      lastName: 'QA',
      postalCode: '300100'
    },
    longCustomer: {
      firstName: 'A'.repeat(50),
      lastName: 'B'.repeat(50),
      postalCode: '1234567890'
    },
    specialCharsCustomer: {
      firstName: "Ana-Maria",
      lastName: "O'Connor",
      postalCode: 'AB12 3CD'
    }
  },
  products: {
    backpack: 'Sauce Labs Backpack',
    bikeLight: 'Sauce Labs Bike Light',
    boltShirt: 'Sauce Labs Bolt T-Shirt',
    fleeceJacket: 'Sauce Labs Fleece Jacket',
    onesie: 'Sauce Labs Onesie',
    redShirt: 'Test.allTheThings() T-Shirt (Red)'
  },
  sortOptions: {
    az: 'az',
    za: 'za',
    lohi: 'lohi',
    hilo: 'hilo'
  },
  messages: {
    lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
    invalidCredentials: 'Epic sadface: Username and password do not match any user in this service',
    usernameRequired: 'Epic sadface: Username is required',
    passwordRequired: 'Epic sadface: Password is required',
    firstNameRequired: 'Error: First Name is required',
    lastNameRequired: 'Error: Last Name is required',
    postalCodeRequired: 'Error: Postal Code is required',
    completeOrder: 'Thank you for your order!'
  }
};

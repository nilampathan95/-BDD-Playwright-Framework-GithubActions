import { Given, When, Then } from '@cucumber/cucumber';
import { config } from '../config/config';

// Step definitions connect readable Gherkin statements to page-object actions.
Given('I navigate to the login page', async function () {
  await this.getLoginPage().navigateToLoginPage();
});

When('I enter valid username and password', async function () {
  const loginPage = this.getLoginPage();
  await loginPage.enterUsername(config.username);
  await loginPage.enterPassword(config.password);
});

When('I enter invalid username and password', async function () {
  const loginPage = this.getLoginPage();
  await loginPage.enterUsername('invalid_user');
  await loginPage.enterPassword('invalid_password');
});

When('I click the login button', async function () {
  await this.getLoginPage().clickLogin();
});

Then('I should be successfully logged in', async function () {
  await this.getLoginPage().verifySuccessfulLogin();
});

Then('I should see a login error message', async function () {
  await this.getLoginPage().verifyLoginError();
});

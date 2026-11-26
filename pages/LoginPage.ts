import type { Locator, Page } from 'playwright';
import { config } from '../config/config';

// A page object keeps selectors and UI interactions out of step definitions.
export class LoginPage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async navigateToLoginPage(): Promise<void> {
    await this.page.goto(config.baseUrl);
  }

  async enterUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  async verifySuccessfulLogin(): Promise<void> {
    await this.page.waitForURL('**/inventory.html', {
      timeout: config.timeoutMs,
    });

    const productsHeading = this.page.locator('[data-test="title"]');
    await productsHeading.waitFor({
      state: 'visible',
      timeout: config.timeoutMs,
    });
    const headingText = await productsHeading.textContent();
    if (headingText?.trim() !== 'Products') {
      throw new Error(`Unexpected inventory heading: "${headingText?.trim()}".`);
    }
  }

  async verifyLoginError(): Promise<void> {
    await this.errorMessage.waitFor({
      state: 'visible',
      timeout: config.timeoutMs,
    });

    const message = await this.errorMessage.textContent();
    if (!message?.includes('Username and password do not match')) {
      throw new Error(`Unexpected login error message: "${message?.trim()}".`);
    }
  }
}

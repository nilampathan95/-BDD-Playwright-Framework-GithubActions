import {
  After,
  Before,
  setDefaultTimeout,
  Status,
  World,
  type IWorldOptions,
} from '@cucumber/cucumber';
import {
  chromium,
  firefox,
  webkit,
  type Browser,
  type BrowserContext,
  type Page,
} from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config/config';
import { LoginPage } from '../pages/LoginPage';

setDefaultTimeout(config.timeoutMs);

// Cucumber creates one World per scenario to hold its browser and page state.
class CustomWorld extends World {
  browser?: Browser;
  browserContext?: BrowserContext;
  page?: Page;
  loginPage?: LoginPage;

  constructor(options: IWorldOptions) {
    super(options);
  }

  getLoginPage(): LoginPage {
    if (!this.loginPage) {
      throw new Error('Login page is not initialized. Check the Before hook.');
    }
    return this.loginPage;
  }
}

import { setWorldConstructor } from '@cucumber/cucumber';
setWorldConstructor(CustomWorld);

Before(async function (this: CustomWorld) {
  const browserType = { chromium, firefox, webkit }[
    config.browserName as 'chromium' | 'firefox' | 'webkit'
  ];

  if (!browserType) {
    throw new Error(`Unsupported browser configuration: ${config.browserName}`);
  }

  this.browser = await browserType.launch(config.launchOptions);
  this.browserContext = await this.browser.newContext();
  this.page = await this.browserContext.newPage();
  this.loginPage = new LoginPage(this.page);
});

After(async function (this: CustomWorld, scenario) {
  const errors: Error[] = [];

  if (scenario.result?.status === Status.FAILED && this.page) {
    try {
      const screenshotDirectory = path.resolve(process.cwd(), 'screenshots');
      await fs.mkdir(screenshotDirectory, { recursive: true });
      const screenshotName = scenario.pickle.name
        .replace(/[^a-z0-9-_]+/gi, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();
      const screenshotPath = path.join(
        screenshotDirectory,
        `${screenshotName}-${Date.now()}.png`,
      );
      const screenshot = await this.page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });
      await this.attach(screenshot, 'image/png');
    } catch (error) {
      errors.push(
        new Error('Could not capture or attach the failed scenario screenshot.', {
          cause: error,
        }),
      );
    }
  }

  const resources: Array<{ close: () => Promise<void> } | undefined> = [
    this.page,
    this.browserContext,
    this.browser,
  ];
  for (const resource of resources) {
    if (!resource) {
      continue;
    }
    try {
      await resource.close();
    } catch (error) {
      errors.push(new Error('Could not close a browser resource.', { cause: error }));
    }
  }

  if (errors.length > 0) {
    throw new AggregateError(errors, 'Scenario cleanup or screenshot handling failed.');
  }
});

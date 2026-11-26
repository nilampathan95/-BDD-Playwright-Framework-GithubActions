# Playwright BDD Framework

A beginner-friendly browser automation framework that uses Cucumber to execute
Gherkin scenarios and Playwright as the browser automation library. It does not
use the Playwright Test runner.

## A. Project architecture

```text
playwright-bdd-framework/
├── features/
│   └── login.feature
├── step-definitions/
│   └── login.steps.ts
├── pages/
│   └── LoginPage.ts
├── hooks/
│   └── hooks.ts
├── config/
│   ├── config.ts
│   ├── .env.qa
│   └── .env.uat
├── test-runner/
│   └── runner.ts
├── utils/
├── reports/
├── screenshots/
├── cucumber.js
├── playwright.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

- `features/`: Gherkin feature files describe behavior in readable Given/When/Then steps.
- `step-definitions/`: TypeScript functions connect each Gherkin step to a page object.
- `pages/`: Page Object Model classes own selectors and reusable UI interactions.
- `hooks/`: Cucumber `Before` and `After` hooks create/close browser resources and capture failures.
- `config/`: Loads the selected dotenv file and validates application/browser settings.
- `test-runner/`: Starts the Cucumber CLI and configures the HTML report.
- `utils/`: Location for shared helpers as the framework grows.
- `reports/`: Cucumber HTML report output.
- `screenshots/`: Failure screenshots saved by the `After` hook.
- `cucumber.js`: Cucumber feature and TypeScript step-definition discovery settings.
- `playwright.config.ts`: Browser launch settings for the Playwright library, not Playwright Test.
- `tsconfig.json`: TypeScript compiler settings.
- `package.json`: Dependencies and convenient npm scripts.

## B. Install dependencies

```bash
npm install
```

## C. Install Playwright browsers

Install Chromium (the default browser):

```bash
npx playwright install chromium
```

To use another supported browser, set `BROWSER=firefox` or `BROWSER=webkit`
and install it with `npx playwright install firefox` or
`npx playwright install webkit`.

## D. Configure environments

Choose the environment using `TEST_ENV=qa` or `TEST_ENV=uat`. The framework
loads `config/.env.<environment>` and requires `BASE_URL`, `USERNAME`, and
`PASSWORD`. Optional `APP_BASE_URL`, `APP_USERNAME`, and `APP_PASSWORD`
environment variables override those file values; the `APP_` prefix avoids
collisions with operating-system variables such as Windows `USERNAME`. The
included files are configured for the SauceDemo test account.
For another environment, update those local files and do not commit real
credentials.

Optional browser settings are `BROWSER` (`chromium`, `firefox`, or `webkit`),
`HEADLESS` (`true` or `false`), and `TIMEOUT_MS` (positive number of
milliseconds). For example:

```powershell
$env:TEST_ENV = "qa"
$env:HEADLESS = "false"
npm run test:bdd
```

Or select the environment through the runner:

```bash
npm run test:bdd -- --env=uat
```

## E. Run all BDD tests

```bash
npm run test:bdd
```

## F. Run a specific feature

```bash
npm run test:bdd -- features/login.feature
```

## G. Run a specific scenario or tag

Use the tags already defined in `login.feature`:

```bash
npm run test:bdd -- --tags "@smoke"
npm run test:bdd -- --tags "@regression"
```

Direct Cucumber CLI invocation also works after dependencies are installed:

```bash
npx cucumber-js --tags "@smoke"
```

## H. Run in headed mode

```bash
npm run test:bdd:headed
```

## I. Generate the HTML report

Every `test:bdd` run generates `reports/cucumber-report.html`. To explicitly
request the report:

```bash
npm run test:bdd:html
```

The report includes the feature, scenario, steps and their statuses, duration,
and failure details. Screenshots attached by Cucumber are included when the
scenario fails.

## J. Failure screenshots

The Cucumber `After` hook checks the scenario result. On failure it saves a
full-page PNG to `screenshots/` and attaches the image to the Cucumber report.
The hook then closes the page context and browser even if screenshot handling
fails.

## K. End-to-end execution flow

The `features/login.feature` file describes behavior using Gherkin. Cucumber
loads the feature and matches each step to `step-definitions/login.steps.ts`.
The step definitions use `pages/LoginPage.ts` to interact through Playwright's
`Page`. Cucumber hooks create a Playwright `Browser`, a `BrowserContext`
(isolated session), and a `Page` (a browser tab) for each scenario. Playwright
drives the browser against SauceDemo; Cucumber records step outcomes,
execution duration, failures, and screenshots in the HTML report.

```text
Feature File
     ↓
Cucumber
     ↓
Step Definition
     ↓
Page Object
     ↓
Playwright
     ↓
Browser
     ↓
Application
     ↓
Cucumber Report
```

import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

const testEnvironment = process.env.TEST_ENV ?? 'qa';
if (!['qa', 'uat'].includes(testEnvironment)) {
  throw new Error(`Unsupported TEST_ENV "${testEnvironment}". Use qa or uat.`);
}

const environmentFile = path.resolve(__dirname, `.env.${testEnvironment}`);
const fileExists = fs.existsSync(environmentFile);
const dotenvResult = fileExists
  ? dotenv.config({ path: environmentFile })
  : { parsed: {}, error: undefined };
const errorCode =
  dotenvResult.error && typeof dotenvResult.error === 'object' && 'code' in dotenvResult.error
    ? String(dotenvResult.error.code)
    : undefined;
if (
  dotenvResult.error &&
  errorCode !== 'ENOENT' &&
  errorCode !== 'NOT_FOUND_DOTENV_ENVIRONMENT'
) {
  throw new Error(
    `Could not load environment file "${environmentFile}": ${dotenvResult.error.message}`,
  );
}

const environmentValues = dotenvResult.parsed ?? {};
const BASE_URL =
  process.env.APP_BASE_URL ?? environmentValues.BASE_URL ?? process.env.BASE_URL;
const USERNAME =
  process.env.APP_USERNAME ?? environmentValues.USERNAME ?? process.env.USERNAME;
const PASSWORD =
  process.env.APP_PASSWORD ?? environmentValues.PASSWORD ?? process.env.PASSWORD;
if (!BASE_URL || !USERNAME || !PASSWORD) {
  throw new Error(
    `BASE_URL, USERNAME, and PASSWORD must be set in "${environmentFile}" or provided as environment variables.`,
  );
}

const browserName = (process.env.BROWSER ?? 'chromium').toLowerCase();
if (!['chromium', 'firefox', 'webkit'].includes(browserName)) {
  throw new Error(`Unsupported BROWSER "${browserName}". Use chromium, firefox, or webkit.`);
}

const headless = (process.env.HEADLESS ?? 'true').toLowerCase() !== 'false';
const timeoutMs = Number(process.env.TIMEOUT_MS ?? 30000);
if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
  throw new Error(`TIMEOUT_MS must be a positive number. Received "${process.env.TIMEOUT_MS}".`);
}

export const config = {
  baseUrl: BASE_URL,
  username: USERNAME,
  password: PASSWORD,
  testEnvironment,
  browserName,
  headless,
  timeoutMs,
  launchOptions: {
    headless,
    args: process.env.CI ? ['--no-sandbox', '--disable-dev-shm-usage'] : [],
  },
};

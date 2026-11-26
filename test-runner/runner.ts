import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// This runner delegates scenario execution to Cucumber CLI, never Playwright Test.
const cliArguments = process.argv.slice(2);
const cucumberArguments: string[] = [];

for (const argument of cliArguments) {
  if (argument === '--headed') {
    process.env.HEADLESS = 'false';
  } else if (argument.startsWith('--env=')) {
    process.env.TEST_ENV = argument.slice('--env='.length);
  } else if (argument === '--html') {
    continue;
  } else {
    cucumberArguments.push(argument);
  }
}

const reportsDirectory = path.resolve(process.cwd(), 'reports');
fs.mkdirSync(reportsDirectory, { recursive: true });

const formatterArguments = [
  '--format',
  'progress',
  '--format',
  'html:reports/cucumber-report.html',
];
const cucumberCli = path.resolve(
  process.cwd(),
  'node_modules',
  '@cucumber',
  'cucumber',
  'bin',
  'cucumber.js',
);
const result = spawnSync(
  process.execPath,
  [cucumberCli, ...cucumberArguments, ...formatterArguments],
  {
    cwd: process.cwd(),
    stdio: 'inherit',
  },
);

if (result.error) {
  throw new Error('Could not start the Cucumber CLI.', { cause: result.error });
}

process.exitCode = result.status ?? 1;

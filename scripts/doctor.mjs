import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, '..');
const checkInstall = process.argv.includes('--check-install');
const verbose = process.argv.includes('--verbose');

const requiredFiles = [
    'package.json',
    'package-lock.json',
    'playwright.config.ts',
    'tsconfig.json',
    'tests/todo.spec.ts',
];

// If the user wants to check if Playwright is installed, add its package.json to the list of required files
if (checkInstall) {
    requiredFiles.push('node_modules/@playwright/test/package.json');
}

console.log('Node.js:', process.version);
console.log('Platform:', process.platform);
console.log('CI mode:', process.env.CI === 'true');
console.log(
    'TEST_BASE_URL configured:',
    Boolean(process.env.TEST_BASE_URL?.trim())
);

// If verbose mode is enabled, print the current working directory and project root
if (verbose) {
    console.log('Current directory:', process.cwd());
    console.log('Project root:', projectRoot);
}

const missingFiles = requiredFiles.filter(
    (path) => !existsSync(resolve(projectRoot, path))
);

if (missingFiles.length > 0) {
    console.error('Missing required files:');

    for (const path of missingFiles) {
        console.error(`- ${path}`);
    }

    process.exitCode = 1;
} else {
    console.log('Project preflight: OK');
}
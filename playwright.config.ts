import { defineConfig, devices } from '@playwright/test';

type Runtime = 'local' | 'ci';

const runtime: Runtime =
    process.env.CI === 'true' ? 'ci' : 'local';

const retryPolicy: Record<Runtime, number> = {
    local: 0,
    ci: 1,
};
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './tests',
    timeout: getTestTimeout(),
    expect: {
        timeout: 5_000,
    },
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: runtime === 'ci',
    /* Retry on CI only */
    retries: retryPolicy[runtime],
    /* Opt out of parallel tests on CI. */
    workers: runtime === 'ci' ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['list'],
        ['html', { open: 'never' }],
    ],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        headless: runtime === 'ci',
        /* Base URL to use in actions like `await page.goto('')`. */
        baseURL: getBaseURL(),

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'retain-on-failure',
        /* Save the current page screenshot when a test fails. */
        screenshot: 'only-on-failure',
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },

        /*{
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] },
        },
    
        {
          name: 'webkit',
          use: { ...devices['Desktop Safari'] },
        },*/

        /* Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },

        /* Test against branded browsers. */
        // {
        //   name: 'Microsoft Edge',
        //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
        // },
        // {
        //   name: 'Google Chrome',
        //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        // },
    ],

    /* Run your local dev server before starting the tests */
    // webServer: {
    //   command: 'npm run start',
    //   url: 'http://localhost:3000',
    //   reuseExistingServer: !process.env.CI,
    // },
});

// Returns the base URL from the environment variable or a default value.
function getBaseURL(): string {
    const rawURL =
        process.env.TEST_BASE_URL?.trim() ||
        'https://demo.playwright.dev';

    let parsedURL: URL;

    try {
        parsedURL = new URL(rawURL);
    } catch {
        throw new Error(
            `Invalid TEST_BASE_URL: "${rawURL}"`
        );
    }

    if (
        parsedURL.protocol !== 'http:' &&
        parsedURL.protocol !== 'https:'
    ) {
        throw new Error(
            'TEST_BASE_URL must use HTTP or HTTPS'
        );
    }

    return parsedURL.toString();
}

// Returns the test timeout value from the environment variable or a default value.
function getTestTimeout(): number {
    const rawValue = process.env.PW_TEST_TIMEOUT_MS;

    if (rawValue === undefined) {
        return 30_000;
    }

    const timeout = Number(rawValue);

    if (
        !Number.isSafeInteger(timeout) ||
        timeout <= 0
    ) {
        throw new Error(
            'PW_TEST_TIMEOUT_MS must be a positive integer'
        );
    }

    return timeout;
}
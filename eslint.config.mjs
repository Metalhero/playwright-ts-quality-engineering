import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default defineConfig([
    {
        ignores: ['playwright-report/**', 'test-results/**'],
    },

    // general rules for all JS/TS files
    {
        files: ['**/*.{js,mjs,ts}'],
        languageOptions: {
            globals: {
                console: 'readonly',
            },
        },
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
        ],
    },

    // no floating promises in the source code (awaits must be used)
    {
        files: ['playwright.config.ts', 'src/**/*.ts', 'tests/**/*.ts'],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            '@typescript-eslint/no-floating-promises': [
                'error',
                { ignoreVoid: false },
            ],
        },
    },

    // No waitForTimeout in the source code and tests
    {
        files: ['src/{pages,fixtures}/**/*.ts'],
        plugins: { playwright },
        rules: {
            'playwright/no-wait-for-timeout': 'error',
        },
    },

    // Rules for Playwright tests
    {
        files: ['tests/**/*.ts'],
        extends: [
            playwright.configs['flat/recommended'],
        ],
        rules: {
            'playwright/missing-playwright-await': 'error',
            'playwright/no-focused-test': 'error',
            'playwright/no-skipped-test': 'error',
            'playwright/no-wait-for-timeout': 'error',
        },
    },
]);
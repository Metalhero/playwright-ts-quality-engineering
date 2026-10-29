import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default defineConfig([
    {
        files: ['**/*.{js,ts}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
        ],
    },
    {
        files: ['tests/**/*.ts'],
        extends: [
            playwright.configs['flat/recommended'],
        ],
    },
]);

import { test, expect } from '@playwright/test';
import { parseBaseURL, parseTimeout, } from '../src/utils/runtime-config';

test.describe('Runtime configuration validation', () => {

    const invalidTimeouts = ['0', '-1', '12.5', 'abc', ''];

    test('Test URL parsings', () => {
        const result1 = parseBaseURL(undefined);
        const result2 = parseBaseURL('https://example.com');

        expect(result1).toBe('https://demo.playwright.dev/');
        expect(result2).toBe('https://example.com/');
        expect(() => parseBaseURL('invalid-url')).toThrow('Invalid TEST_BASE_URL');
        expect(() => parseBaseURL('ftp://example.com')).toThrow('TEST_BASE_URL must use HTTP or HTTPS');
    });

    test('Test timeout parsing', () => {
        expect(parseTimeout(undefined)).toBe(30_000);
        expect(parseTimeout('45000')).toBe(45_000);
        expect(() => parseTimeout('0')).toThrow('PW_TEST_TIMEOUT_MS must be a positive integer');
    });

    test('Rejects invalid timeout values', () => {
        expect(() => parseTimeout('12.5')).toThrow();
        expect(() => parseTimeout('abc')).toThrow();
    });

    for (const value of invalidTimeouts) {
        test(`rejects invalid timeout: ${JSON.stringify(value)}`, () => {
            expect(() => parseTimeout(value)).toThrow(
                'PW_TEST_TIMEOUT_MS must be a positive integer'
            );
        });
    }
});


import { test, expect } from '@playwright/test';
import { parseBaseURL, parseTimeout, parseWorkers } from '../src/utils/runtime-config';

test.describe('Runtime configuration validation', () => {

    const invalidTimeouts = ['0', '-1', '12.5', 'abc', ''];

    test('URL parsings', () => {
        const result1 = parseBaseURL(undefined);
        const result2 = parseBaseURL('https://example.com');

        expect(result1).toBe('https://demo.playwright.dev/');
        expect(result2).toBe('https://example.com/');
        expect(() => parseBaseURL('invalid-url')).toThrow('Invalid TEST_BASE_URL');
        expect(() => parseBaseURL('ftp://example.com')).toThrow('TEST_BASE_URL must use HTTP or HTTPS');
    });

    // Test cases for parseTimeout function
    test('Timeout parsing', () => {
        expect(parseTimeout(undefined)).toBe(30_000);
        expect(parseTimeout('45000')).toBe(45_000);
    });

    test('Rejects invalid timeout values', () => {
        expect(() => parseTimeout('0')).toThrow('PW_TEST_TIMEOUT_MS must be a positive integer');
        expect(() => parseTimeout('12.5')).toThrow();
        expect(() => parseTimeout('abc')).toThrow();
    });

    for (const timeoutValue of invalidTimeouts) {
        test(`rejects invalid timeout: ${JSON.stringify(timeoutValue)}`, () => {
            expect(() => parseTimeout(timeoutValue)).toThrow(
                'PW_TEST_TIMEOUT_MS must be a positive integer'
            );
        });
    }

    // Test cases for parseWorkers function
    test('uses Playwright default when not configured', () => {
        expect(parseWorkers(undefined)).toBeUndefined();
    });

    test('accepts a positive worker count', () => {
        expect(parseWorkers(' 4 ')).toBe(4);
    });

    for (const workerValue of ['0', '-1', '1.5', 'asd', '', ' ', '1e2', '50%', '0x10', '9007199254740992']) {
        test(`Rejects invalid worker count: ${JSON.stringify(workerValue)}`, () => {
            expect(() => parseWorkers(workerValue)).toThrow(
                'PW_WORKERS must be a positive decimal integer'
            );
        });
    }
});
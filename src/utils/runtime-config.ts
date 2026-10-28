export function parseBaseURL(raw?: string): string {
    const value = raw?.trim() || 'https://demo.playwright.dev';

    let url: URL;

    try {
        url = new URL(value);
    } catch {
        throw new Error(`Invalid TEST_BASE_URL: "${value}"`);
    }

    if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('TEST_BASE_URL must use HTTP or HTTPS');
    }

    return url.toString();
}

export function parseTimeout(time?: string): number {
    if (time === undefined) {
        return 30_000;
    }

    const value = Number(time);

    if (!Number.isSafeInteger(value) || value <= 0) {
        throw new Error(
            'PW_TEST_TIMEOUT_MS must be a positive integer'
        );
    }

    return value;
}
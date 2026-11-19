/* eslint-disable no-undef */

import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = (__ENV.BASE_URL || 'https://target:8080');
const endpoint = __ENV.ENDPOINT || '/api/todos';
const expectedStatus = Number(__ENV.EXPECTED_STATUS || '200');

if (!endpoint.startsWith('/')) {
    throw new Error('The endpoint must start with a forward slash "/"');
}

if (!Number.isInteger(expectedStatus) || expectedStatus < 100 || expectedStatus > 599) {
    throw new Error('The EXPECTED_STATUS must be a valid HTTP status code.');
}

http.setResponseCallback(http.expectedStatuses(expectedStatus));

export const options = {
    stages: [
        { duration: '10s', target: 5 },
        { duration: '20s', target: 5 },
        { duration: '10s', target: 0 },
    ],

    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<500'],
        checks: ['rate>0.99'],
    },
};

export default function load() {
    const response = http.get(`${baseUrl}${endpoint}`, {
        tags: { endpoint },
    });

    check(response, {
        'HTTP status matches expectation': (r) => r.status === expectedStatus,
    });

    sleep(1);
}

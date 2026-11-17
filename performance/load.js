
import http from 'k6/http';
import { check, sleep } from 'k6';

// eslint-disable-next-line no-undef
const baseUrl = __ENV.BASE_URL || 'http://target:8080';

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
    const response = http.get(`${baseUrl}/api/todos`, {
        tags: { endpoint: 'get_todos' },
    });

    check(response, {
        'status is 200': (r) => r.status === 200,
        'response contains todos': (r) => {
            try {
                const data = r.json();
                return Array.isArray(data) && data.length === 2;
            } catch {
                return false;
            }
        },
    });

    sleep(1);
}

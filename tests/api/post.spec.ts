import { test, expect } from '@playwright/test';
import type { CreatePostRequest, PostResponse } from '../../src/types/post.types';

test('Get existing post', async ({ request }) => {
    const response = await test.step('Retrieve post', async () => {
        return request.get('/posts/1');
    });

    await test.step('Verify response status and content type', async () => {
        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toContain('application/json');
    });

    await test.step('Verify response payload', async () => {
        const body: unknown = await response.json();

        expect(body).toEqual({
            id: 1,
            userId: 1,
            title: expect.any(String),
            body: expect.any(String),
        });
    });
});

// Test with .step() can store the request and response data in the report for easier debugging.

test('Submit new post', async ({ request }) => {
    const payload: CreatePostRequest = {
        title: 'Playwright API testing',
        body: 'API test with TypeScript',
        userId: 1,
    };

    const response = await test.step('Submit new post', async () => {
        return request.post('/posts', {
            data: payload,
        });
    });

    await test.step('Verify creation status', async () => {
        expect(response.status()).toBe(201);
    });

    await test.step('Verify response payload', async () => {
        const body: unknown = await response.json();

        expect(body).toMatchObject({
            ...payload,
            id: expect.any(Number),
        });
    });
});

test('Update existing post', async ({ request }) => {
    const payload: PostResponse = {
        id: 1,
        title: 'Updated Playwright post',
        body: 'Updated API test with TypeScript',
        userId: 1,
    };

    const response = await test.step('Update post', async () => {
        return request.put(`/posts/${payload.id}`, {
            data: payload,
        });
    });

    await test.step('Verify update status', async () => {
        expect(response.status()).toBe(200);
    });

    await test.step('Verify updated response payload', async () => {
        const body: unknown = await response.json();

        expect(body).toEqual(payload);
    });
});

test('Delete existing post', async ({ request }) => {
    const response = await test.step('Delete post', async () => {
        return request.delete('/posts/1');
    });

    await test.step('Verify deletion status', async () => {
        expect(response.status()).toBe(200);
    });

    await test.step('Verify empty response payload', async () => {
        const body: unknown = await response.json();

        expect(body).toEqual({});
    });
});


// Negative test cases
test('Get unknown post returns not found', async ({ request }) => {
    const response = await request.get(
        '/posts/999999',
        {
            failOnStatusCode: false,
        }
    );

    expect(response.status()).toBe(404);
});
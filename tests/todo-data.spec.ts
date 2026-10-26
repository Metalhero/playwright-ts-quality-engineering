import { test, expect } from '@playwright/test';
import { createTodo } from '../src/utils/todo-data';

test.describe('createTodo validation', () => {

    // Test cases for the createTodo function
    test('creates an active todo by default', () => {
        const todo = createTodo('Apple');

        expect(todo.value).toBe('Apple');
        expect(todo.status).toBe('active');
    });

    // Test cases for the createTodo function with different statuses
    test('trims the title and accepts completed status', () => {
        const todo = createTodo('  Pear  ', 'completed');

        expect(todo.value).toBe('Pear');
        expect(todo.status).toBe('completed');
    });

    // Test cases for the createTodo function with invalid input
    test('rejects whitespace-only titles', () => {
        expect(() => createTodo('             ')).toThrow(
            'Todo title cannot be empty or whitespace.'
        );
    });

});
import { test, expect } from '@playwright/test';
import { TodoPage } from '../src/pages/todo.page';
import { createTodoSet } from '../src/utils/todo-data';

test('only the selected todo is completed', async ({ page }) => {
    const todoPage = new TodoPage(page);
    const appleCheckbox = todoPage.getTodoCheckbox('Apple');
    const melonCheckbox = todoPage.getTodoCheckbox('Melon');

    await todoPage.goto();
    await todoPage.addTodos(['Apple', 'Melon']);

    await expect(todoPage.getTodoItems()).toHaveCount(2);
    await expect(appleCheckbox).not.toBeChecked();
    await expect(melonCheckbox).not.toBeChecked();
    await todoPage.setTodoStatus('Apple', 'completed');
    await expect(appleCheckbox).toBeChecked();
    await expect(melonCheckbox).not.toBeChecked();
});

test('Active filter shows only active todos', async ({ page }) => {
    const todoPage = new TodoPage(page);

    await todoPage.goto();
    await todoPage.addTodos(['Apple', 'Pear']);
    await todoPage.setTodoStatus('Apple', 'completed');

    await todoPage.selectFilter('Active');
    await expect(todoPage.getTodoItems()).toHaveCount(1);
    await expect(todoPage.getTodoItem('Pear')).toBeVisible();
});

test('Completed filter shows only completed todos', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.addTodos(['First item', 'Second item']);

    await todoPage.setTodoStatus('First item', 'completed');
    await todoPage.selectFilter('Completed');
    await expect(todoPage.getTodoItems()).toHaveCount(1);
    await expect(todoPage.getTodoItem('First item')).toBeVisible();
});

test('Todo status matches the expected data', async ({ page }) => {
    const todoPage = new TodoPage(page);
    const todos = createTodoSet();
    await todoPage.goto();
    await todoPage.addTodos(todos.map((todo) => todo.value));

    for (const todo of todos) {
        await todoPage.setTodoStatus(todo.value, todo.status);
        await expect(todoPage.getTodoCheckbox(todo.value))
            .toBeChecked({ checked: todo.status === 'completed' });
    }
    await expect(todoPage.getTodoItems()).toHaveCount(todos.length);

    await todoPage.addTodo(' ');
    await expect(todoPage.getTodoItems()).toHaveCount(todos.length);
    for (const todo of todos) {
        await expect(todoPage.getTodoCheckbox(todo.value))
            .toBeChecked({ checked: todo.status === 'completed' });
    }
});

test('completed todo disappears after clearing', async ({ page }) => {
    const todoPage = new TodoPage(page);
    const todo = todoPage.getTodoItem('Temporary task');

    await todoPage.goto();
    await todoPage.addTodo('Temporary task');
    await expect(todo).toHaveCount(1);
    await todoPage.setTodoStatus('Temporary task', 'completed');
    await expect(todo).toHaveClass(/completed/);
    await todoPage.clearCompleted();
    await expect(todo).toHaveCount(0);
});

test('completed todo can be cleared reliably', async ({ page }) => {
    const todoPage = new TodoPage(page);
    const title = 'Temporary task';
    const todo = todoPage.getTodoItem(title);

    await test.step('Create todo', async () => {
        await todoPage.goto();
        await todoPage.addTodo(title);

        await expect(todo).toHaveCount(1);
    });

    await test.step('Complete todo', async () => {
        await todoPage.setTodoStatus(title, 'completed');
        await expect(todo).toHaveClass(/completed/);
    });

    await test.step('Clear completed todo', async () => {
        await todoPage.clearCompleted();
        await expect(todo).toHaveCount(0);
    });
});
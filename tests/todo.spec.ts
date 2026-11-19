import { createTodoSet } from '../src/utils/todo-data';
import { test, expect } from '../src/fixtures/todo.fixture';

test('only the selected todo is completed', async ({ readyTodoPage }) => {
    const appleCheckbox = readyTodoPage.getTodoCheckbox('Apple');
    const pineappleCheckbox = readyTodoPage.getTodoCheckbox('Pineapple');
    const melonCheckbox = readyTodoPage.getTodoCheckbox('Melon');

    await readyTodoPage.addTodos(['Apple', 'Pineapple', 'Melon']);

    await expect(readyTodoPage.getTodoItems()).toHaveCount(3);
    await expect(appleCheckbox).not.toBeChecked();
    await expect(pineappleCheckbox).not.toBeChecked();
    await expect(melonCheckbox).not.toBeChecked();
    await readyTodoPage.setTodoStatus('Apple', 'completed');
    await expect(appleCheckbox).toBeChecked();
    await expect(pineappleCheckbox).not.toBeChecked();
    await expect(melonCheckbox).not.toBeChecked();
});

test('Active filter shows only active todos', async ({ readyTodoPage }) => {
    await readyTodoPage.addTodos(['Apple', 'Pear']);
    await readyTodoPage.setTodoStatus('Apple', 'completed');

    await readyTodoPage.selectFilter('Active');
    await expect(readyTodoPage.getTodoItems()).toHaveCount(1);
    await expect(readyTodoPage.getTodoItem('Pear')).toBeVisible();
});

test('Completed filter shows only completed todos', async ({ readyTodoPage }) => {
    await readyTodoPage.addTodos(['First item', 'Second item']);

    await readyTodoPage.setTodoStatus('First item', 'completed');
    await readyTodoPage.selectFilter('Completed');
    await expect(readyTodoPage.getTodoItems()).toHaveCount(1);
    await expect(readyTodoPage.getTodoItem('First item')).toBeVisible();
});

test('Todo status matches the expected data', async ({ readyTodoPage }) => {
    const todos = createTodoSet();
    await readyTodoPage.addTodos(todos.map((todo) => todo.value));

    for (const todo of todos) {
        await readyTodoPage.setTodoStatus(todo.value, todo.status);
        await expect(readyTodoPage.getTodoCheckbox(todo.value))
            .toBeChecked({ checked: todo.status === 'completed' });
    }
    await expect(readyTodoPage.getTodoItems()).toHaveCount(todos.length);

    await readyTodoPage.addTodo(' ');
    await expect(readyTodoPage.getTodoItems()).toHaveCount(todos.length);
    for (const todo of todos) {
        await expect(readyTodoPage.getTodoCheckbox(todo.value))
            .toBeChecked({ checked: todo.status === 'completed' });
    }
});

test('completed todo can be cleared reliably', async ({ readyTodoPage }) => {
    const title = 'Temporary task';
    const todo = readyTodoPage.getTodoItem(title);

    await test.step('Create todo', async () => {
        await readyTodoPage.addTodo(title);

        await expect(todo).toHaveCount(1);
    });

    await test.step('Complete todo', async () => {
        await readyTodoPage.setTodoStatus(title, 'completed');
        await expect(todo).toHaveClass(/completed/);
    });

    await test.step('Clear completed todo', async () => {
        await readyTodoPage.clearCompleted();
        await expect(todo).toHaveCount(0);
    });
});
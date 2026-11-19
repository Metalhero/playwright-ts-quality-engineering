import { test as base, expect } from '@playwright/test';
import { TodoPage } from '../pages/todo.page';

type TodoFixtures = {
    todoPage: TodoPage;
    readyTodoPage: TodoPage;
};

export const test = base.extend<TodoFixtures>({
    todoPage: async ({ page }, use) => {
        await use(new TodoPage(page));
    },

    readyTodoPage: async ({ todoPage }, use) => {
        await todoPage.goto();
        await use(todoPage);
    },
});

export { expect };
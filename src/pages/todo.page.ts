import type { Locator, Page } from '@playwright/test';
import type { TodoStatus } from '../types/todo.types';

export type TodoFilter = 'Active' | 'Completed';

export class TodoPage {
    constructor(private readonly page: Page) { }

    async goto(): Promise<void> {
        await this.page.goto('/todomvc/');
    }

    async addTodo(title: string): Promise<void> {
        const input = this.page.getByPlaceholder('What needs to be done?');
        await input.fill(title);
        await input.press('Enter');
    }

    async addTodos(titles: readonly string[]): Promise<void> {
        for (const title of titles) {
            await this.addTodo(title);
        }
    }

    getTodoItems(): Locator {
        return this.page.getByTestId('todo-item');
    }

    getTodoItem(title: string): Locator {
        return this.getTodoItems().filter({
            has: this.page.getByText(title, { exact: true })
        });
    }

    getTodoCheckbox(title: string): Locator {
        return this.getTodoItem(title).getByRole('checkbox');
    }

    async setTodoStatus(title: string, status: TodoStatus): Promise<void> {
        await this.getTodoCheckbox(title).setChecked(status === 'completed');
    }

    async selectFilter(filter: TodoFilter): Promise<void> {
        await this.page.getByRole('link', { name: filter }).click();
    }

    async clearCompleted(): Promise<void> {
        await this.page.getByRole('button', { name: 'Clear completed' }).click();
    }
}

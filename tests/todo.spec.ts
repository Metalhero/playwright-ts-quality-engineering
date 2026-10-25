import { test, expect } from '@playwright/test';
import { createTodoSet } from '../src/utils/todo-data';

test('only the selected todo is completed', async ({ page }) => {
  const input = page.getByPlaceholder('What needs to be done?');
  const appleTodo = page.getByTestId('todo-item').filter({ hasText: 'Apple' });
  const melonTodo = page.getByTestId('todo-item').filter({ hasText: 'Melon' });
  const appleCbox = appleTodo.getByRole('checkbox');
  const melonCbox = melonTodo.getByRole('checkbox');

  // Go to the todomvc demo page and add two todo items
  await page.goto('/todomvc');
  await input.fill('Apple');
  await input.press('Enter');
  await input.fill('Melon');
  await input.press('Enter');

  /* Verify that both todo items are present and unchecked, 
  then check the Apple todo and verify that only it is checked*/
  await expect(page.getByTestId('todo-item')).toHaveCount(2);
  await expect(appleCbox).not.toBeChecked();
  await expect(melonCbox).not.toBeChecked();
  await appleCbox.check();
  await expect(appleCbox).toBeChecked();
  await expect(melonCbox).not.toBeChecked();
});

test('Todolist second test', async ({ page }) => {
  const newTodo = page.getByPlaceholder("What needs to be done?");

  // Go to the todomvc demo page and add two todo items
  await page.goto('/todomvc');
  await newTodo.fill("Apple");
  await newTodo.press('Enter');
  await newTodo.fill("Pear");
  await newTodo.press('Enter');
  await page.getByTestId('todo-item').filter({ hasText: 'Apple' }).getByRole('checkbox').check();

  // click on the active filter and verify that only the active item is visible
  await page.getByRole('link', { name: 'Active' }).click();
  await expect(page.getByTestId('todo-item')).toHaveCount(1);
  await expect(page.getByTestId('todo-item').filter({ hasText: 'Pear' })).toBeVisible();
});

test('Completed filter shows only completed todos', async ({ page }) => {
  await page.goto('/todomvc');

  // Add two todos
  const newTodo = page.getByPlaceholder("What needs to be done?");
  await newTodo.fill("First item");
  await newTodo.press('Enter');
  await newTodo.fill("Second item");
  await newTodo.press('Enter');

  // Mark the first todo as completed and click on the completed filter
  await page.getByTestId('todo-item').filter({ hasText: 'First item' }).getByRole('checkbox').check();
  await page.getByRole('link', { name: 'Completed' }).click();
  await expect(page.getByTestId('todo-item')).toHaveCount(1);
  await expect(page.getByTestId('todo-item').filter({ hasText: 'First item' })).toBeVisible();
});

test('Todo status matches the expected data', async ({ page }) => {
  const todos = createTodoSet();
  const input = page.getByPlaceholder('What needs to be done?');
  await page.goto("/todomvc/");

  // Add todos to the list
  for (const todo of todos) {
    await input.fill(todo.title);
    await input.press('Enter');
  }

  // Verify that the status of each todo matches the expected data
  for (const todo of todos) {
    const item = page.getByTestId('todo-item').filter({ hasText: todo.title });
    const checkbox = item.getByRole('checkbox');

    // Check the checkbox if the todo is completed
    if (todo.status === "completed") {
      await checkbox.check();
    }

    // Verify the checkbox state matches the expected status
    if (todo.status === "completed") {
      await expect(checkbox).toBeChecked();
    } else {
      await expect(checkbox).not.toBeChecked();
    }
  }
  await expect(page.getByTestId('todo-item')).toHaveCount(todos.length);
});
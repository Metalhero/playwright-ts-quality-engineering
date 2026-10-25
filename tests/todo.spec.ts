import { test, expect } from '@playwright/test';

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

  // 1. Add two todos
  const newTodo = page.getByPlaceholder("What needs to be done?");
  await newTodo.fill("First item");
  await newTodo.press('Enter');
  await newTodo.fill("Second item");
  await newTodo.press('Enter');

  // 2. Mark only one as completed
  await page.getByTestId('todo-item').filter({ hasText: 'First item' }).getByRole('checkbox').check();

  // 3. Click the Completed filter
  await page.getByRole('link', { name: 'Completed' }).click();

  // 4. Verify exactly one todo is visible
  await expect(page.getByTestId('todo-item')).toHaveCount(1);

  // 5. Verify it is the correct todo
  await expect(page.getByTestId('todo-item').filter({ hasText: 'First item' })).toBeVisible();
});
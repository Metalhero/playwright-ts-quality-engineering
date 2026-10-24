import { test, expect } from '@playwright/test';

test('Todolist', async ({ page }) => {
  const newTodo = page.getByPlaceholder("What needs to be done?");
  const firstItem = page.getByText('Learn Playwright');
  const todoItems = page.getByTestId('todo-item');

  // Go to the todomvc demo page
  await page.goto('https://demo.playwright.dev/todomvc/?utm_source=chatgpt.com#/');
  await expect(firstItem).toBeHidden();
  await newTodo.fill("Learn Playwright");
  await newTodo.press('Enter');
  await expect(firstItem).toBeVisible();
  await expect(firstItem).toHaveCount(1);

  // Add another todo item
  await newTodo.fill("Learn TypeScript");
  await newTodo.press('Enter');
  await expect(todoItems).toHaveCount(2);

  // Mark the items as completed
  await expect(await page.locator('.completed')).toHaveCount(0);
  await todoItems.first().getByRole('checkbox').isEnabled();
  await todoItems.first().getByRole('checkbox').check();
  await expect(await page.locator('.completed')).toHaveCount(1);
  await expect(todoItems.nth(1)).not.toHaveClass(/completed/);
  await todoItems.nth(1).getByRole('checkbox').check();

  // Verify that the items are marked as completed
  await expect(todoItems.first()).toHaveClass(/completed/);
  await expect(todoItems.nth(1)).toHaveClass(/completed/);
});

test('Todolist second test', async ({ page }) => {
  const newTodo = page.getByPlaceholder("What needs to be done?");

  // Go to the todomvc demo page and add two todo items
  await page.goto('https://demo.playwright.dev/todomvc/?utm_source=chatgpt.com#/');
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

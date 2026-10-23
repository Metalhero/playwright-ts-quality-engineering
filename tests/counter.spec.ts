import { test, expect } from '@playwright/test';

test('Todolist', async ({ page }) => {
  let whatNeedsToBeDone = await page.getByPlaceholder("What needs to be done?");
  let learnPlaywright = await page.getByText('Learn Playwright');
  let todoItems = page.getByTestId('todo-item');

  // Go to the todomvc demo page
  await page.goto('https://demo.playwright.dev/todomvc/?utm_source=chatgpt.com#/');
  await whatNeedsToBeDone.fill("Learn Playwright");
  await whatNeedsToBeDone.press('Enter');
  await expect(learnPlaywright).toBeVisible();
  await expect(learnPlaywright).toHaveCount(1);

  // Add another todo item
  await whatNeedsToBeDone.fill("Learn another Playwright");
  await whatNeedsToBeDone.press('Enter');
  await expect(todoItems).toHaveCount(2);

  // Mark the items as completed
  await todoItems.first().getByRole('checkbox').check();
  await todoItems.nth(1).getByRole('checkbox').check();
});
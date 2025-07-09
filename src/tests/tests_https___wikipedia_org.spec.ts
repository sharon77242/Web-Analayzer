import { test, expect } from '@playwright/test';

test('example test', async ({ page }) => {
  await page.goto('https://www.example.com');
  const title = await page.innerText('h1');
  expect(title).toBe('Example Domain');
});
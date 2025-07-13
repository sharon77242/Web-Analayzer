import { test, expect } from '@playwright/test';

test('should allow a user to search for a valid term', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  await page.getByRole('searchbox', { name: 'Search Wikipedia' }).fill('Playwright');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/.*Playwright/);
  await expect(page.getByText('Playwright')).toBeVisible();
});

test('should handle a search term with special characters', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  await page.getByRole('searchbox', { name: 'Search Wikipedia' }).fill('C++');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/.*C%2B%2B/);
  await expect(page.getByText('C++')).toBeVisible();
});

test('should not perform a search with an empty search term', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  await page.getByRole('searchbox', { name: 'Search Wikipedia' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('https://www.wikipedia.org/');
});

test('should allow a user to select a different language and search', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  await page.getByRole('combobox', { name: 'Search language' }).selectOption('ja');
  await page.getByRole('searchbox', { name: 'Search Wikipedia' }).fill('Playwright');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/.*ja.*Playwright/);
  await expect(page.getByText('Playwright')).toBeVisible();
});

test('should redirect to the selected language Wikipedia page', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  await page.getByRole('link', { name: 'English', exact: true }).click();
  await expect(page).toHaveURL('https://en.wikipedia.org/wiki/Main_Page');
});

test('should display a mobile-friendly layout for top languages', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.getByRole('link', { name: 'English', exact: true })).toBeVisible();
});

test('should expand the list of all languages when clicked', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  await page.getByRole('button', { name: 'Read Wikipedia in your language' }).click();
  await expect(page.getByRole('link', { name: 'Afrikaans' })).toBeVisible();
});

test('should filter the list of all languages when searched', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  await page.getByRole('button', { name: 'Read Wikipedia in your language' }).click();
  await page.getByPlaceholder('Search for a language').fill('Japanese');
  await expect(page.getByRole('link', { name: 'Japanese' })).toBeVisible();
});

test('should redirect to the selected project page', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  await page.getByRole('link', { name: 'Commons Free media collection' }).click();
  await expect(page).toHaveURL('https://commons.wikimedia.org/');
});

test('should redirect to the app download page', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  await page.getByRole('link', { name: 'Download Wikipedia for Android or iOS' }).click();
  await expect(page).toHaveURL('https://en.wikipedia.org/wiki/List_of_Wikipedia_mobile_applications');
});

test('should adjust layout for mobile devices', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.getByRole('searchbox', { name: 'Search Wikipedia' })).toBeVisible();
});

test('should support keyboard navigation', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('searchbox', { name: 'Search Wikipedia' })).toBeFocused();
});
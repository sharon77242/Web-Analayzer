import { test, expect } from '@playwright/test';

test.describe('SearchForm', () => {
  test('Verify that the search input field is present and can be focused.', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await expect(page.getByRole('searchbox')).toBeVisible();
    await page.getByRole('searchbox').focus();
  });

  test('Enter a valid search term and press Enter; expect the page to redirect to the search results page.', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('searchbox').fill('Playwright');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/.*Playwright/);
  });

  test('Enter a valid search term and click the search button; expect the page to redirect to the search results page.', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('searchbox').fill('Playwright');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page).toHaveURL(/.*Playwright/);
  });

  test('Enter an invalid search term and press Enter; expect no action or an error message.', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('searchbox').fill('invalidsearchterm');
    await page.keyboard.press('Enter');
    await expect(page).not.toHaveURL(/.*invalidsearchterm/);
  });

  test('Enter an invalid search term and click the search button; expect no action or an error message.', async ({ page }) => {
    await page.goto('https://
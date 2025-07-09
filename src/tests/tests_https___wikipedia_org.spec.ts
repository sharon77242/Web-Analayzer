import { test, expect } from '@playwright/test';

test('should load the Wikipedia home page', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  await expect(page).toHaveURL('https://www.wikipedia.org/');
  await expect(page.locator('.central-textlogo')).toContainText('Wikipedia');
  await expect(page.locator('.central-textlogo .localized-slogan')).toContainText('The Free Encyclopedia');
});

test('should navigate to English Wikipedia', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  const englishLink = page.locator('#js-link-box-en');
  await englishLink.click();
  await expect(page).toHaveURL('https://en.wikipedia.org/');
});

test('should navigate to Japanese Wikipedia', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  const japaneseLink = page.locator('#js-link-box-ja');
  await japaneseLink.click();
  await expect(page).toHaveURL('https://ja.wikipedia.org/');
});

test('should navigate to Russian Wikipedia', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  const russianLink = page.locator('#js-link-box-ru');
  await russianLink.click();
  await expect(page).toHaveURL('https://ru.wikipedia.org/');
});

test('should navigate to German Wikipedia', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  const germanLink = page.locator('#js-link-box-de');
  await germanLink.click();
  await expect(page).toHaveURL('https://de.wikipedia.org/');
});

test('should search for a term and show suggestions', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  const searchInput = page.locator('#searchInput');
  await searchInput.fill('Playwright');
  await expect(page.locator('.suggestions-dropdown')).toBeVisible();
  await expect(page.locator('.suggestion-link')).toBeVisible();
});

test('should search for a term and submit the form', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  const searchInput = page.locator('#searchInput');
  const searchButton = page.locator('.pure-button-primary-progressive');
  await searchInput.fill('Playwright');
  await searchButton.click();
  await expect(page).not.toHaveURL('https://www.wikipedia.org/');
});

test('should toggle the language list and verify visibility', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  const languageListButton = page.locator('#js-lang-list-button');
  await languageListButton.click();
  await expect(page.locator('.lang-list-container')).toBeVisible();
  await expect(page.locator('.langlist')).toBeVisible();
});

test('should navigate to Meta-Wiki from the footer', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  const metaWikiLink = page.locator('.footer .other-project-link').filter({ hasText: 'Meta-Wiki' });
  await metaWikiLink.click();
  await expect(page).toHaveURL('https://meta.wikimedia.org/');
});

test('should navigate to Commons from the footer', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  const commonsLink = page.locator('.footer .other-project-link').filter({ hasText: 'Commons' });
  await commonsLink.click();
  await expect(page).toHaveURL('https://commons.wikimedia.org/');
});

test('should check the Creative Commons license link in the footer', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  const ccLicenseLink = page.locator('.site-license a').first();
  await ccLicenseLink.click();
  await expect(page).toHaveURL('https://creativecommons.org/licenses/by-sa/4.0/');
});

test('should check the Terms of Use link in the footer', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  const termsOfUseLink = page.locator('.site-license a').nth(1);
  await termsOfUseLink.click();
  await expect(page).toHaveURL('https://foundation.wikimedia.org/wiki/Special:MyLanguage/Policy:Terms_of_Use');
});

test('should check the Privacy Policy link in the footer', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  const privacyPolicyLink = page.locator('.site-license a').last();
  await privacyPolicyLink.click();
  await expect(page).toHaveURL('https://foundation.wikimedia.org/wiki/Special:MyLanguage/Policy:Privacy_policy');
});
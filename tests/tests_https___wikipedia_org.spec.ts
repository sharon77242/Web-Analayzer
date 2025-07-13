import { test, expect } from '@playwright/test';

test.describe('SearchForm', () => {
  test('Searching with term Quantum mechanics redirects to search results', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('searchbox', { name: 'Search Wikipedia' }).fill('Quantum mechanics');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page).toHaveURL(/en\.wikipedia\.org\/wiki\/Quantum_mechanics/);
  });

  test('Pressing Enter after entering Helium redirects to search results', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const searchBox = page.getByRole('searchbox', { name: 'Search Wikipedia' });
    await searchBox.fill('Helium');
    await searchBox.press('Enter');
    await expect(page).toHaveURL(/en\.wikipedia\.org\/wiki\/Helium/);
  });

  test('Submitting empty form redirects to search page', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page).toHaveURL(/en\.wikipedia\.org/);
    await expect(page).toHaveURL(/search=/);
  });
});

test.describe('LanguageSelectionDropdown', () => {
  test("Selecting Español and searching 'Sol' redirects to Spanish results", async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.locator('select[name="language"]').selectOption('es');
    const searchBox = page.getByRole('searchbox', { name: 'Search Wikipedia' });
    await searchBox.fill('Sol');
    await searchBox.press('Enter');
    await expect(page).toHaveURL('https://es.wikipedia.org/wiki/Sol');
  });

  test('Selecting Japanese and submitting empty search redirects to Japanese search page', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.locator('select[name="language"]').selectOption('ja');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page).toHaveURL(/ja\.wikipedia\.org/);
    await expect(page).toHaveURL(/search=/);
  });

  test('Unable to select invalid language option from dropdown', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const options = await page.locator('select[name="language"] option').all();
    const validOptions = await Promise.all(options.map(opt => opt.getAttribute('value')));
    await expect(validOptions).not.toContain('invalid-value');
  });
});

test.describe('TypeaheadSuggestions', () => {
  test("Typing 'App' shows relevant suggestions", async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('searchbox', { name: 'Search Wikipedia' }).fill('App');
    await expect(page.locator('.suggestions-dropdown')).toBeVisible();
    await expect(page.locator('.suggestion-title', { hasText: 'Apple' }).first()).toBeVisible();
  });

  test('Clicking suggestion Apple Inc. navigates directly to article', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('searchbox', { name: 'Search Wikipedia' }).fill('Apple');
    await page.locator('.suggestion-link:has-text("Apple Inc.")').first().click();
    await expect(page).toHaveURL(/en\.wikipedia\.org\/wiki\/Apple_Inc\./);
  });

  test("Typing '###' shows no results message", async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('searchbox', { name: 'Search Wikipedia' }).fill('###');
    await expect(page.locator('.suggestions-dropdown').getByText('No results')).toBeVisible();
  });
});

test.describe('LanguageListButton', () => {
  test('Clicking language button expands the language list', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('button', { name: 'Read Wikipedia in your language' }).click();
    await expect(page.locator('.lang-list-container')).toBeVisible();
  });

  test('Clicking expanded language button collapses the list', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const button = page.getByRole('button', { name: 'Read Wikipedia in your language' });
    await button.click();
    await button.click();
    await expect(page.locator('.lang-list-container')).not.toBeVisible();
  });

  test('Repeated clicks toggle language list reliably', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const button = page.getByRole('button', { name: 'Read Wikipedia in your language' });
    
    for (let i = 0; i < 5; i++) {
      await button.click();
      const isVisible = await page.locator('.lang-list-container').isVisible();
      
      await button.click();
      await expect(page.locator('.lang-list-container')).not.toBeVisible();
      
      await expect(page.locator('.central-featured')).toBeVisible();
    }
  });
});

test.describe('TopLanguageLinks', () => {
  test('Clicking English language link navigates to en.wikipedia.org', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.locator('#js-link-box-en').click();
    await expect(page).toHaveURL('https://en.wikipedia.org/wiki/Main_Page');
  });

  test('Clicking 日本語 link navigates to ja.wikipedia.org', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.locator('#js-link-box-ja').click();
    await expect(page).toHaveURL(/ja\.wikipedia\.org/);
  });

  test('All top language links have valid URLs', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const languageLinks = page.locator('.central-featured-lang .link-box');
    const count = await languageLinks.count();
    
    for (let i = 0; i < count; i++) {
      const href = await languageLinks.nth(i).getAttribute('href');
      await expect(href).toMatch(/^(\/\/|https:\/\/)/);
    }
  });
});

test.describe('OtherProjectsLinks', () => {
  test('Clicking Commons link navigates to commons.wikimedia.org', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('link', { name: /^Commons$/ }).click();
    await expect(page).toHaveURL('https://commons.wikimedia.org/wiki/Main_Page');
  });

  test('Clicking Wikidata link navigates to wikidata.org', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('link', { name: /^Wikidata$/ }).click();
    await expect(page).toHaveURL('https://www.wikidata.org/wiki/Wikidata:Main_Page');
  });

  test('All project links have accessible text', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const projectLinks = page.locator('.other-project-link');
    const count = await projectLinks.count();
    
    for (let i = 0; i < count; i++) {
      const link = projectLinks.nth(i);
      const linkText = await link.textContent();
      await expect(linkText.trim()).not.toBe('');
    }
  });
});

test.describe('AppDownloadBadges', () => {
  test('Clicking Google Play badge opens store page', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.locator('.app-badge-android a').click()
    ]);
    await expect(newPage).toHaveURL(/play\.google\.com\/store\/apps\/.*wikipedia/);
  });

  test('Clicking App Store badge opens store page', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.locator('.app-badge-ios a').click()
    ]);
    await expect(newPage).toHaveURL(/apple\.com\/app\/wikipedia/);
  });

  test('App store links remain functional without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('https://www.wikipedia.org');
    
    const googleHref = await page.locator('.app-badge-android a').getAttribute('href');
    await expect(googleHref).toContain('play.google.com');
    
    const appleHref = await page.locator('.app-badge-ios a').getAttribute('href');
    await expect(appleHref).toContain('itunes.apple.com');
  });
});

test.describe('LicenseAndPolicyLinks', () => {
  test('Creative Commons license link navigates correctly', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('link', { name: 'Creative Commons Attribution-ShareAlike License' }).click();
    await expect(page).toHaveURL('https://creativecommons.org/licenses/by-sa/4.0/');
  });

  test('Privacy Policy link navigates correctly', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('link', { name: 'Privacy Policy' }).click();
    await expect(page).toHaveURL(/foundation\.wikimedia\.org.*\/Policy:Privacy_policy/);
  });

  test('License links meet contrast accessibility standards', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const licenseLinks = page.locator('.site-license a');
    const count = await licenseLinks.count();
    
    for (let i = 0; i < count; i++) {
      const link = licenseLinks.nth(i);
      const color = await link.evaluate(el => window.getComputedStyle(el).color);
      const bgColor = await link.evaluate(el => window.getComputedStyle(el).backgroundColor);
      
      const getRgbValues = (str) => {
        const match = str.match(/rgba?\((\d+), (\d+), (\d+)/);
        return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : null;
      };
      
      const textRgb = getRgbValues(color);
      const bgRgb = getRgbValues(bgColor);
      
      if (!textRgb || !bgRgb) continue;
      
      const lum1 = (textRgb[0] * 0.299 + textRgb[1] * 0.587 + textRgb[2] * 0.114) / 255;
      const lum2 = (bgRgb[0] * 0.299 + bgRgb[1] * 0.587 + bgRgb[2] * 0.114) / 255;
      const ratio = lum1 > lum2 ? (lum1 + 0.05) / (lum2 + 0.05) : (lum2 + 0.05) / (lum1 + 0.05);

      await expect(ratio).toBeGreaterThan(4.5);
    }
  });
});
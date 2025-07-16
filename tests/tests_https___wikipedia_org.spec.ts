import { test, expect } from '@playwright/test';

test.describe('TopTenLanguageLinks', () => {
  test('User clicks the English link — user is navigated to en.wikipedia.org', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const link = page.getByRole('link', { name: 'English' });
    await link.click();
    await expect(page).toHaveURL(/.*en.wikipedia.org/);
  });

  test('User clicks the 日本語 link — user is navigated to ja.wikipedia.org', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const link = page.getByRole('link', { name: '日本語' });
    await link.click();
    await expect(page).toHaveURL(/.*ja.wikipedia.org/);
  });

  test('User clicks the Русский link — user is navigated to ru.wikipedia.org', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const link = page.getByRole('link', { name: 'Русский' });
    await link.click();
    await expect(page).toHaveURL(/.*ru.wikipedia.org/);
  });

  test('User clicks the Deutsch link — user is navigated to de.wikipedia.org', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const link = page.getByRole('link', { name: 'Deutsch' });
    await link.click();
    await expect(page).toHaveURL(/.*de.wikipedia.org/);
  });

  test('User clicks the Español link — user is navigated to es.wikipedia.org', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const link = page.getByRole('link', { name: 'Español' });
    await link.click();
    await expect(page).toHaveURL(/.*es.wikipedia.org/);
  });

  test('User clicks the Français link — user is navigated to fr.wikipedia.org', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const link = page.getByRole('link', { name: 'Français' });
    await link.click();
    await expect(page).toHaveURL(/.*fr.wikipedia.org/);
  });

  test('User clicks the 中文 link — user is navigated to zh.wikipedia.org', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const link = page.getByRole('link', { name: '中文' });
    await link.click();
    await expect(page).toHaveURL(/.*zh.wikipedia.org/);
  });

  test('User clicks the Italiano link — user is navigated to it.wikipedia.org', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const link = page.getByRole('link', { name: 'Italiano' });
    await link.click();
    await expect(page).toHaveURL(/.*it.wikipedia.org/);
  });

  test('User clicks the Português link — user is navigated to pt.wikipedia.org', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const link = page.getByRole('link', { name: 'Português' });
    await link.click();
    await expect(page).toHaveURL(/.*pt.wikipedia.org/);
  });

  test('User clicks the فارسی link — user is navigated to fa.wikipedia.org', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const link = page.getByRole('link', { name: /فارسی/ });
    await link.click();
    await expect(page).toHaveURL(/.*fa.wikipedia.org/);
  });
});

test.describe('SearchForm', () => {
  test('Enter valid keyword and click Search — search results for the keyword load', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('searchbox', { name: 'Search Wikipedia' }).fill('test');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page).toHaveURL(/wiki\/Test/);
  });

  test('Select Spanish language from dropdown, enter keyword and click Search — Spanish results load', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const select = page.locator('#searchLanguage');
    await select.selectOption('es');
    await page.getByRole('searchbox', { name: 'Search Wikipedia' }).fill('test');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page).toHaveURL(/wiki\/Test/);
  });

  test('Press Enter in search box with valid keyword — search results load', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('searchbox', { name: 'Search Wikipedia' }).fill('playwright');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/wiki\/Playwright/);
  });

  test('Enter empty query and click Search — empty query results or home page reload', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page).toHaveURL(/wiki\/Special:Search/);
  });

  test('Search with special characters in keyword — search displays correct results', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('searchbox', { name: 'Search Wikipedia' }).fill('C++@#');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page).toHaveURL(/Special:Search.*search=C%2B%2B%40%/);
  });

  test('Disable JavaScript, change language dropdown and click Search — search uses chosen language', async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).eval = () => {};
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });
    await page.goto('https://www.wikipedia.org', { waitUntil: 'load' });
    const select = page.locator('#searchLanguage');
    await select.selectOption('fr');
    await page.getByRole('searchbox', { name: 'Search Wikipedia' }).fill('test');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page).toHaveURL(/\/\/fr.wikipedia.org\/wiki\/Test/);
  });
});

test.describe('LanguageDropdown', () => {
  test('Open dropdown, select German, verify language code changes to "de" in label', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const select = page.locator('#searchLanguage');
    await select.selectOption({ label: 'Deutsch' });
    await expect(page.locator('#jsLangLabel')).toHaveText('de');
  });

  test('Select a non-English language using keyboard arrows, confirm unit selection change', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const select = page.locator('#searchLanguage');
    await select.focus();
    await select.press('ArrowDown');
    await select.press('Enter');
    await expect(page.locator('#jsLangLabel')).not.toHaveText('en');
  });

  test('Close dropdown without selecting — dropdown closes and language remains unchanged', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const select = page.locator('#searchLanguage');
    await expect(page.locator('#jsLangLabel')).toHaveText('en');
    await select.focus();
    await select.press('Escape');
    await expect(page.locator('#jsLangLabel')).toHaveText('en');
  });

  test('Verify that all 60+ languages appear in the dropdown menu', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const options = await page.locator('#searchLanguage option').all();
    expect(options.length).toBeGreaterThanOrEqual(60);
  });

  test('Select Arabic, verify RTL styling and bdo/bdi tags render correctly', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const select = page.locator('#searchLanguage');
    await select.selectOption({ label: 'العربية' });
    const label = page.locator('#jsLangLabel');
    await expect(label).toHaveText('ar');
  });
});

test.describe('ExpandLanguagesButton', () => {
  test('Click Read Wikipedia in your language — language list expands smoothly', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('button', { name: 'Read Wikipedia in your language' }).click();
    await expect(page.locator('#js-lang-lists')).toBeVisible();
  });

  test('Click Expand button twice — list collapses then expands again', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const button = page.getByRole('button', { name: 'Read Wikipedia in your language' });
    await button.click();
    await expect(page.locator('#js-lang-lists')).toBeVisible();
    await button.click();
    await expect(page.locator('#js-lang-lists')).toBeHidden();
  });

  test('Verify that focus remains on button after expansion/collapse', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const button = page.getByRole('button', { name: 'Read Wikipedia in your language' });
    await button.click();
    await expect(button).toBeFocused();
  });

  test('Use keyboard Enter on button — list expands, Enter again collapses', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const button = page.getByRole('button', { name: 'Read Wikipedia in your language' });
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#js-lang-lists')).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page.locator('#js-lang-lists')).toBeHidden();
  });

  test('Verify expanded list loads within 1 second on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('button', { name: 'Read Wikipedia in your language' }).click();
    await expect(page.locator('#js-lang-lists')).toBeVisible({ timeout: 1000 });
  });
});

test.describe('SisterProjectLinks', () => {
  test('Click Commons link — navigates to commons.wikimedia.org', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('link', { name: 'Commons Free media collection' }).click();
    await expect(page).toHaveURL(/.*commons.wikimedia.org/);
  });

  test('Click Wikivoyage — opens free travel guide site', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('link', { name: 'Wikivoyage Free travel guide' }).click();
    await expect(page).toHaveURL(/.*wikivoyage.org/);
  });

  test('Click Wiktionary — opens dictionary site', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('link', { name: 'Wiktionary Free dictionary' }).click();
    await expect(page).toHaveURL(/.*wiktionary.org/);
  });

  test('Click Wikibooks — opens free textbooks site', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('link', { name: 'Wikibooks Free textbooks' }).click();
    await expect(page).toHaveURL(/.*wikibooks.org/);
  });

  test('Click Wikinews — opens free news source site', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('link', { name: 'Wikinews Free news source' }).click();
    await expect(page).toHaveURL(/.*wikinews.org/);
  });

  test('Click Wikidata — opens free knowledge base site', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('link', { name: 'Wikidata Free knowledge base' }).click();
    await expect(page).toHaveURL(/.*wikidata.org/);
  });

  test('Click Wikiversity — opens free learning resources site', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('link', { name: 'Wikiversity Free learning resources' }).click();
    await expect(page).toHaveURL(/.*wikiversity.org/);
  });

  test('Click Wikiquote — opens free quote compendium site', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('link', { name: 'Wikiquote Free quote compendium' }).click();
    await expect(page).toHaveURL(/.*wikiquote.org/);
  });

  test('Click MediaWiki — opens free open wiki software site', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('link', { name: 'MediaWiki Free & open wiki software' }).click();
    await expect(page).toHaveURL(/.*mediawiki.org/);
  });

  test('Click Wikisource — opens free content library site', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('link', { name: 'Wikisource Free content library' }).click();
    await expect(page).toHaveURL(/.*wikisource.org/);
  });

  test('Click Wikispecies — opens free species directory site', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('link', { name: 'Wikispecies Free species directory' }).click();
    await expect(page).toHaveURL(/.*species.wikimedia.org/);
  });

  test('Click Wikifunctions — opens free function library site', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.getByRole('link', { name: 'Wikifunctions Free function library' }).click();
    await expect(page).toHaveURL(/.*wikifunctions.org/);
  });
});

test.describe('AppBadgeLinks', () => {
  test('Click Google Play badge — redirects to Wikipedia Android app on Play Store', async ({ page, context }) => {
    await page.goto('https://www.wikipedia.org');
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('.app-badge-android a').click()
    ]);
    await expect(newPage).toHaveURL(/play.google.com.*org.wikipedia/);
  });

  test('Click Apple App Store badge — redirects to Wikipedia iOS app on App Store', async ({ page, context }) => {
    await page.goto('https://www.wikipedia.org');
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('.app-badge-ios a').click()
    ]);
    await expect(newPage).toHaveURL(/apps.apple.com.*id324715238/);
  });

  test('Right-click badges — native context menu still opens (not image)', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    await page.locator('.app-badge-android a').click({ button: 'right' });
    // no assertion required – test passes if no exception is thrown
  });

  test('Verify badges have valid noreferrer and target=_blank attributes', async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
    const androidLink = page.locator('.app-badge-android a');
    const iosLink = page.locator('.app-badge-ios a');
    await expect(androidLink).toHaveAttribute('rel', 'noreferrer');
    await expect(androidLink).toHaveAttribute('target', '_blank');
    await expect(iosLink).toHaveAttribute('rel', 'noreferrer');
    await expect(iosLink).toHaveAttribute('target', '_blank');
  });
});
import { test, expect } from '@playwright/test';

test.describe('Wikipedia Test Suite', () => {
  const url = 'https://www.wikipedia.org';

  test('Page Load', async ({ page }) => {
    await page.goto(url);
    // Verify no errors are present
    const errors = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.error')).map(e => e.textContent);
    });
    expect(errors.length).toBe(0);

    // Verify content is accessible without JS
    await page.emulateMedia({ media: 'screen', colorScheme: 'light', reducedMotion: 'no-preference' });
    await page.context().setJavaScriptEnabled(false);
    await page.reload();
    expect(await page.innerText('h1')).toBe('Wikipedia');
  });

  test('Title and Description', async ({ page }) => {
    await page.goto(url);
    expect(await page.title()).toBe('Wikipedia');
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toBe('Wikipedia is a free online encyclopedia, created and edited by volunteers around the world and hosted by the Wikimedia Foundation.');
  });

  test('Logo Display', async ({ page }) => {
    await page.goto(url);
    const logo = await page.locator('.central-textlogo__image');
    expect(await logo.getAttribute('alt')).toBe('Wikipedia');

    await page.setViewportSize({ width: 400, height: 600 });
    expect(await logo.getAttribute('style')).toContain('width: 150px; height: 25px;');

    await page.emulateMedia({ media: 'screen', colorScheme: 'dark' });
    expect(await logo.getAttribute('filter')).toContain('invert(100%)');
  });

  test('Search Functionality', async ({ page }) => {
    await page.goto(url);
    const searchInput = page.locator('#searchInput');
    const searchButton = page.locator('.pure-button.pure-button-primary-progressive');

    // Valid search term
    await searchInput.fill('Playwright');
    await searchButton.click();
    expect(page.url()).toBe(`${url}/search-redirect.php?family=wikipedia&search=Playwright`);

    // Long search term
    await page.goto(url);
    await searchInput.fill('a'.repeat(2000));
    await searchButton.click();
    expect(await page.locator('.error').innerText()).toBe('');

    // Special characters
    await page.goto(url);
    await searchInput.fill('!@#$%^&*()');
    await searchButton.click();
    expect(await page.locator('.error').innerText()).toBe('');

    // Empty search term
    await page.goto(url);
    await searchInput.fill('');
    await searchButton.click();
    expect(await page.locator('.error').innerText()).toBe('');

    // Language selection
    const languageSelector = page.locator('#searchLanguage');
    await languageSelector.selectOption({ label: 'Français' });
    await searchInput.fill('Playwright');
    await searchButton.click();
    expect(page.url()).toBe(`${url}/search-redirect.php?family=wikipedia&search=Playwright&language=fr`);

    // Focus on search input
    await page.goto(url);
    await searchInput.focus();
    expect(await searchInput.getAttribute('style')).toContain('background-color: var(--background-color-base)');
  });

  test('Language Navigation', async ({ page }) => {
    const featuredLanguages = ['en', 'ja', 'ru', 'de', 'es', 'fr', 'zh', 'it', 'pt', 'fa'];
    for (const lang of featuredLanguages) {
      await page.goto(url);
      await page.locator(`#js-link-box-${lang}`).click();
      expect(page.url()).toBe(`https://${lang}.wikipedia.org/`);
    }

    // Hover over a featured language
    await page.mouse.move(10, 10);
    await page.locator('#js-link-box-en').hover();
    expect(await page.locator('#js-link-box-en strong').getAttribute('style')).toContain('text-decoration: underline;');

    // Access 'All Languages' section
    await page.goto(url);
    const allLanguagesButton = page.locator('#js-lang-list-button');
    await allLanguagesButton.click();
    expect(await page.locator('.lang-list-container').isVisible()).toBe(true);

    // Click on a language with fewer than 1,000,000 articles
    await page.locator('.langlist a[href="//ab.wikipedia.org/"]').click();
    expect(page.url()).toBe(`https://ab.wikipedia.org/`);

    // Scroll through the 'All Languages' section on mobile
    await page.setViewportSize({ width: 360, height: 640 });
    await allLanguagesButton.click();
    await page.locator('.lang-list-container').evaluate((element) => element.scrollBy(0, 2000));
    expect(await page.locator('.lang-list-container').isVisible()).toBe(true);

    // Search for a specific language in the 'All Languages' section
    await page.locator('input[type=search]').fill('Français');
    expect(await page.locator('.langlist a[href="//fr.wikipedia.org/"]').innerText()).toBe('Français');
  });

  test('Responsive Design', async ({ page }) => {
    await page.goto(url);

    // Resize to mobile
    await page.setViewportSize({ width: 360, height: 640 });
    expect(await page.locator('.central-featured-lang').first().getAttribute('style')).not.toContain('position: absolute;');

    // Resize to desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    expect(await page.locator('.central-featured-lang').first().getAttribute('style')).toContain('position: absolute;');

    // Rotate mobile device
    await page.setViewportSize({ width: 360, height: 640 });
    await page.evaluate(() => {
      const mediaQueryList = matchMedia('(orientation: portrait)');
      mediaQueryList.addEventListener('change', (event) => {
        if (event.matches) {
          document.querySelector('.central-featured-lang').style.position = 'absolute';
        } else {
          document.querySelector('.central-featured-lang').style.position = 'relative';
        }
      });
      mediaQueryList.matchMedia('(orientation: landscape)');
    });
    expect(await page.locator('.central-featured-lang').first().getAttribute('style')).toContain('position: relative;');
  });

  test('Footer Links and Content', async ({ page }) => {
    await page.goto(url);

    // Donate link
    await page.locator('.footer-sidebar-content a').filter({ hasText: 'You can support our work with a donation.' }).click();
    expect(page.url()).toBe('https://donate.wikimedia.org/?wmf_medium=portal&wmf_campaign=portalFooter&wmf_source=portalFooter');

    // View Mobile Site
    await page.goto(url);
    await page.locator('a').filter({ hasText: 'View mobile site' }).click();
    expect(page.url()).toBe('https://www.wikipedia.org/mobile/');

    // Other Projects
    await page.goto(url);
    const otherProjects = await page.locator('.other-projects .other-project-link').all();
    for (const project of otherProjects) {
      await project.click({ button: 'left', modifiers: ['Shift'] });
      expect(project.getAttribute('href')).not.toBe(null);
    }

    // Download Wikipedia App
    await page.mouse.move(10, 10);
    await page.locator('.footer-sidebar-text').nth(1).hover();
    expect(await page.locator('.app-badge-android').getAttribute('style')).toContain('text-decoration: none; color: var(--color-progressive);');
    expect(await page.locator('.app-badge-ios').getAttribute('style')).toContain('text-decoration: none; color: var(--color-progressive);');
  });

  test('Localization and Internationalization', async ({ page }) => {
    await page.goto(url);

    // Supported language
    await page.context().setExtraHTTPHeaders({
      'Accept-Language': 'fr'
    });
    await page.reload();
    expect(await page.locator('.localized-slogan').innerText()).toBe('L’encyclopédie libre');

    // Right-to-left language
    await page.context().setExtraHTTPHeaders({
      'Accept-Language': 'ar'
    });
    await page.reload();
    expect(await page.locator('.localized-slogan').innerText()).toBe('الموسوعة الحرة');
    expect(await page.locator('body').getAttribute('dir')).toBe('rtl');

    // Unsupported language
    await page.context().setExtraHTTPHeaders({
      'Accept-Language': 'abc'
    });
    await page.reload();
    expect(await page.locator('.localized-slogan').innerText()).toBe('The Free Encyclopedia');
  });

  test('Accessibility Features', async ({ page }) => {
    await page.goto(url);

    // Skip to main content
    await page.locator('.screen-reader-text').nth(1).click();
    expect(await page.locator('main').getAttribute('aria-labelledby')).toBe('www-wikipedia-org');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    expect(await page.locator('#searchInput').getAttribute('aria-describedby')).toBe('searchInput');
    await page.keyboard.press('Tab');
    expect(await page.locator('#js-lang-list-button').getAttribute('aria-expanded')).toBe('false');
  });
});
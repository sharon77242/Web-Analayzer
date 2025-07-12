import { test, expect, Page } from "@playwright/test";

test.describe("Wikipedia Test Suite", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto("https://www.wikipedia.org");
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("Main Logo and Title", async () => {
    const logo = page.locator(".central-featured-logo");
    const slogan = page.locator(".localized-slogan");

    await expect(logo).toBeVisible();
    await expect(slogan).toHaveText("The Free Encyclopedia");

    // Dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await expect(logo).toHaveAttribute(
      "src",
      "portal/wikipedia.org/assets/img/Wikipedia-logo-v2@2x.png"
    );
    await expect(slogan).toHaveCSS("color", "rgb(234, 236, 240)");
  });

  test("Primary Language Links", async () => {
    const englishLink = page.locator("#js-link-box-en");
    const japaneseLink = page.locator("#js-link-box-ja");
    const russianLink = page.locator("#js-link-box-ru");
    const germanLink = page.locator("#js-link-box-de");
    const spanishLink = page.locator("#js-link-box-es");
    const chineseLink = page.locator("#js-link-box-zh");

    await englishLink.click();
    expect(page.url()).toBe("https://en.wikipedia.org/");

    await page.goto("https://www.wikipedia.org");
    await japaneseLink.hover();
    await expect(japaneseLink).toHaveCSS(
      "text-decoration",
      "underline solid rgb(234, 236, 240)"
    );

    await page.goto("https://www.wikipedia.org");
    await russianLink.click();
    expect(page.url()).toBe("https://ru.wikipedia.org/");

    await page.goto("https://www.wikipedia.org");
    await germanLink.click();
    expect(page.url()).toBe("https://de.wikipedia.org/");

    await page.goto("https://www.wikipedia.org");
    await spanishLink.click();
    expect(page.url()).toBe("https://es.wikipedia.org/");

    await page.goto("https://www.wikipedia.org");
    await chineseLink.click();
    expect(page.url()).toBe("https://zh.wikipedia.org/");
  });

  test("Search Functionality", async () => {
    const searchInput = page.locator("#searchInput");
    const searchButton = page.locator("button.pure-button-primary-progressive");

    await searchInput.fill("Playwright");
    await expect(page.locator("#typeahead-suggestions")).toBeVisible();

    await searchInput.press("Enter");
    expect(page.url()).toContain("/search-redirect.php?");

    await page.goto("https://www.wikipedia.org");
    await searchButton.click();
    expect(page.url()).toContain("/search-redirect.php?");

    await page.goto("https://www.wikipedia.org");
    await searchInput.fill("");
    await expect(page.locator("#typeahead-suggestions")).not.toBeVisible();

    await searchInput.focus();
    await expect(searchInput).toHaveCSS("border-color", "rgb(54, 101, 223)");

    await searchInput.selectOption({ label: "French" });
    await expect(searchInput).toHaveAttribute("dir", "ltr");

    await searchInput.selectOption({ label: "Hebrew" });
    await expect(searchInput).toHaveAttribute("dir", "rtl");

    await searchInput.selectOption({ label: "Bodo" });
    await expect(searchInput).toHaveAttribute("dir", "ltr");
  });

  test("Language Picker in Search Form", async () => {
    const searchInput = page.locator("#searchInput");

    const languageDropdown = page.locator(".styled-select");
    const languageOptions = page.locator(".styled-select > select > option");
    const activeHelper = page.locator(".styled-select-active-helper");

    await languageDropdown.click();
    await expect(languageOptions).toBeVisible();

    await languageDropdown.hover();
    await expect(languageDropdown).toHaveCSS(
      "background-color",
      "rgb(248, 249, 250)"
    );

    await languageDropdown.selectOption({ label: "French" });
    await expect(searchInput).toHaveValue("fr");

    await page.click("body");
    await expect(languageOptions).not.toBeVisible();

    await languageDropdown.press("ArrowDown");
    await languageDropdown.press("Enter");
    await expect(searchInput).toHaveValue("fr");

    await searchInput.focus();
    await languageDropdown.click();
    await expect(activeHelper).toBeVisible();
  });

  test("Secondary Language Links Dropdown", async () => {
    const dropdownButton = page.locator("#js-lang-list-button");
    const dropdownContent = page.locator(".lang-list-container");
    const languageLinks = page.locator(
      ".lang-list-container > .lang-list > ul > li > a"
    );

    await dropdownButton.click();
    await expect(dropdownContent).toBeVisible();

    await languageLinks.first().hover();
    await expect(languageLinks.first()).toHaveCSS(
      "background-color",
      "rgb(76, 78, 81)"
    );

    await languageLinks.first().click();
    expect(page.url()).toBe("https://ar.wikipedia.org/");

    await page.goto("https://www.wikipedia.org");
    await dropdownButton.click();
    await dropdownButton.click();
    await expect(dropdownContent).not.toBeVisible();

    await page.setViewportSize({ width: 480, height: 800 });
    await expect(dropdownContent).toHaveCSS("width", "100%");

    await page.goto("https://www.wikipedia.org");
    await page.evaluate(() => {
      document.documentElement.setAttribute("dir", "rtl");
    });
    await dropdownButton.click();
    await expect(dropdownContent).toHaveCSS("direction", "rtl");
  });

  test("Other Projects Navigation", async () => {
    const commonsLink = page.locator('a:has-text("Commons")');
    const wikivoyageLink = page.locator('a:has-text("Wikivoyage")');
    const wiktionaryLink = page.locator('a:has-text("Wiktionary")');
    const wikibooksLink = page.locator('a:has-text("Wikibooks")');
    const wikinewsLink = page.locator('a:has-text("Wikinews")');
    const wikidataLink = page.locator('a:has-text("Wikidata")');
    const wikiversityLink = page.locator('a:has-text("Wikiversity")');
    const wikiquoteLink = page.locator('a:has-text("Wikiquote")');
    const mediawikiLink = page.locator('a:has-text("MediaWiki")');
    const wikisourceLink = page.locator('a:has-text("Wikisource")');
    const wikispeciesLink = page.locator('a:has-text("Wikispecies")');
    const wikifunctionsLink = page.locator('a:has-text("Wikifunctions")');
    const metaWikiLink = page.locator('a:has-text("Meta-Wiki")');

    await commonsLink.click();
    expect(page.url()).toBe("https://commons.wikimedia.org/");

    await page.goto("https://www.wikipedia.org");
    await wikivoyageLink.hover();
    await expect(wikivoyageLink).toHaveCSS("cursor", "pointer");

    await page.goto("https://www.wikipedia.org");
    await wiktionaryLink.click();
    expect(page.url()).toBe("https://www.wiktionary.org/");

    await page.goto("https://www.wikipedia.org");
    await wikibooksLink.click();
    expect(page.url()).toBe("https://www.wikibooks.org/");

    await page.goto("https://www.wikipedia.org");
    await wikinewsLink.click();
    expect(page.url()).toBe("https://www.wikinews.org/");

    await page.goto("https://www.wikipedia.org");
    await wikidataLink.click();
    expect(page.url()).toBe("https://www.wikidata.org/");

    await page.goto("https://www.wikipedia.org");
    await wikiversityLink.click();
    expect(page.url()).toBe("https://www.wikiversity.org/");

    await page.goto("https://www.wikipedia.org");
    await wikiquoteLink.click();
    expect(page.url()).toBe("https://www.wikiquote.org/");

    await page.goto("https://www.wikipedia.org");
    await mediawikiLink.click();
    expect(page.url()).toBe("https://www.mediawiki.org/");

    await page.goto("https://www.wikipedia.org");
    await wikisourceLink.click();
    expect(page.url()).toBe("https://www.wikisource.org/");

    await page.goto("https://www.wikipedia.org");
    await wikispeciesLink.click();
    expect(page.url()).toBe("https://species.wikimedia.org/");

    await page.goto("https://www.wikipedia.org");
    await wikifunctionsLink.click();
    expect(page.url()).toBe("https://www.wikifunctions.org/");

    await page.goto("https://www.wikipedia.org");
    await metaWikiLink.click();
    expect(page.url()).toBe("https://meta.wikimedia.org/");
  });

  test("Footer Content", async () => {
    const donateLink = page.locator(
      'a:has-text("You can support our work with a donation.")'
    );
    const downloadLink = page.locator(
      'a:has-text("Download Wikipedia for Android or iOS")'
    );
    const googlePlayStoreBadge = page.locator(
      "a:has(.sprite.svg-badge_google_play_store)"
    );
    const appleAppStoreBadge = page.locator(
      "a:has(.sprite.svg-badge_ios_app_store)"
    );
    const foundationDescription = page.locator(
      '.footer-sidebar-text[data-jsl10n="portal.footer-description"]'
    );
    const ccLicenseLink = page.locator(
      'a:has-text("Creative Commons Attribution-ShareAlike License")'
    );
    const termsOfUseLink = page.locator('a:has-text("Terms of Use")');
    const privacyPolicyLink = page.locator('a:has-text("Privacy Policy")');

    await expect(donateLink).toHaveAttribute("target", "_blank");
    await donateLink.click();
    await expect(page).toHaveURL(/donate\.wikimedia\.org/);

    await page.goto("https://www.wikipedia.org");
    await expect(downloadLink).toHaveAttribute(
      "href",
      "/wiki/List_of_Wikipedia_mobile_applications"
    );

    await expect(googlePlayStoreBadge).toHaveAttribute("target", "_blank");
    await googlePlayStoreBadge.click();
    await expect(page).toHaveURL(/play\.google\.com/);

    await page.goto("https://www.wikipedia.org");
    await expect(appleAppStoreBadge).toHaveAttribute("target", "_blank");
    await appleAppStoreBadge.click();
    await expect(page).toHaveURL(/itunes\.apple\.com/);

    await page.goto("https://www.wikipedia.org");
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await expect(foundationDescription).toBeVisible();
    await expect(foundationDescription).toHaveText(
      "Wikipedia is hosted by the Wikimedia Foundation, a non-profit organization that also hosts a range of other projects."
    );

    await ccLicenseLink.click();
    await expect(page).toHaveURL(
      /creativecommons\.org\/licenses\/by-sa\/4\.0\//
    );

    await page.goto("https://www.wikipedia.org");
    await termsOfUseLink.click();
    await expect(page).toHaveURL(
      /foundation\.wikimedia\.org\/wiki\/Special:MyLanguage\/Policy:Terms_of_Use/
    );

    await page.goto("https://www.wikipedia.org");
    await privacyPolicyLink.click();
    await expect(page).toHaveURL(
      /foundation\.wikimedia\.org\/wiki\/Special:MyLanguage\/Policy:Privacy_policy/
    );
  });
});

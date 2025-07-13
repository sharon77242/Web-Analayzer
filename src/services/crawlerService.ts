import { chromium } from "playwright";
import { dbService, DESTINATION } from "./dbService";
import { logError, logInfo } from "../logger";
import { testGeneratorManager } from "../testGeneratorManager";
import { URL_STORE } from "../config";
import globalStore from "../globalStore";

const visited = new Set<string>();
const queue: string[] = [];

/**
 * Normalizes a URL for consistent tracking.
 * - Removes the hash fragment (#...).
 * - Removes trailing slashes.
 * @param url The URL to normalize.
 * @returns A normalized URL string.
 */
function normalizeUrl(url: string): string {
  try {
    const urlObject = new URL(url);
    urlObject.hash = ""; // Remove the #fragment
    let normalized = urlObject.href;
    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    // Return the original string if it's not a valid URL (e.g., mailto:)
    return url;
  }
}


async function learnWebsite(startUrl: string) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const normalizedStartUrl = normalizeUrl(startUrl);
  queue.push(normalizedStartUrl);
  visited.add(normalizedStartUrl);

  while (queue.length > 0) {
    const currentUrl = queue.shift()!;
    globalStore[URL_STORE] = currentUrl;

    await logInfo("Processing page", currentUrl);

    try {
      await page.goto(currentUrl, { waitUntil: "networkidle" });
      const html = await page.content();
      await dbService.write(DESTINATION.HTML, html);
      await testGeneratorManager.learnPage(html);

      const links = await page.$$eval("a", (anchors) =>
        anchors.map((anchor) => anchor.href)
      );

      const domain = new URL(startUrl).hostname;

      for (const link of links) {
        // Normalize every link before checking it.
        const normalizedLink = normalizeUrl(link);
        
        // Use a try-catch to handle potentially invalid URLs from href attributes
        try {
          if (
            normalizedLink &&
            new URL(normalizedLink).hostname.endsWith(domain) && // Use endsWith for subdomains
            !visited.has(normalizedLink)
          ) {
            visited.add(normalizedLink);
            queue.push(normalizedLink);
            await logInfo("Found new link, adding to queue", normalizedLink);
          }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          // Ignore invalid links like 'mailto:' or 'javascript:...'
        }
      }
    } catch (error) {
      await logError("Failed to process", { currentUrl, error });
    }
  }

  await browser.close();
}

export const crawlAndGenerateTestsService = {
  learnWebsite,
};

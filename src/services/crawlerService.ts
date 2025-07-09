import { chromium } from "playwright";
// import { generateTestsForPage } from "./aiService.js";
// import { config } from "../config.js";
// import {existsSync, mkdirSync} from "fs";

const visited = new Set();
const queue: string[] = [];

export async function crawlAndGenerateTests(startUrl: string) {
  //   if (!existsSync(config.testDirectory)) {
  //     mkdirSync(config.testDirectory);
  //   }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  queue.push(startUrl);
  visited.add(startUrl);

  while (queue.length > 0) {
    const currentUrl = queue.shift()!;
    console.log(`\nProcessing page: ${currentUrl}`);

    try {
      await page.goto(currentUrl, { waitUntil: "networkidle" });
      const html = await page.content();

      // 1. Generate tests for the current page
      // await generateTestsForPage(currentUrl, html);

      // 2. Find all new links on the page
      const links = await page.$$eval("a", (anchors) =>
        anchors.map((anchor) => anchor.href)
      );

      const domain = new URL(startUrl).hostname;

      for (const link of links) {
        if (link && new URL(link).hostname === domain && !visited.has(link)) {
          visited.add(link);
          queue.push(link);
          console.log(`  Found new link, adding to queue: ${link}`);
        }
      }
    } catch (error) {
      console.error(`  Failed to process ${currentUrl}: ${error}`);
    }
  }

  await browser.close();
}

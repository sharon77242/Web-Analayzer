import { chromium } from "playwright";
import { dbService, DESTINATION } from "./dbService";
import { scenariosService } from "./scenariosService";
import { testGeneratorService } from "./testsGeneratorService";

const visited = new Set();
const queue: string[] = [];

async function crawlAndGenerateTests(startUrl: string) {
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
      await dbService.write(DESTINATION.HTML, currentUrl, html);

      const scenarios: string = await scenariosService.learnScenarios(
        currentUrl,
        html
      );
      await testGeneratorService.learnTests(currentUrl, html, scenarios);

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

export const crawlAndGenerateTestsService = {
  crawlAndGenerateTests,
};

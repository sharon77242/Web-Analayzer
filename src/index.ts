import { crawlAndGenerateTestsService } from "./services/crawlerService";
import * as dotenv from "dotenv";
dotenv.config();

void (async () => {
  // const analyzer = new WebsiteAnalyzer();
  // // Try with a real website URL
  // await analyzer.analyze('https://wikipedia.org');

  await crawlAndGenerateTestsService.crawlAndGenerateTests(
    "https://wikipedia.org"
  );
})();

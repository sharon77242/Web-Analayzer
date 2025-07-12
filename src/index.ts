import * as dotenv from "dotenv";
import { crawlAndGenerateTestsService } from "./services/crawlerService";
import { rootPage } from "./config";
dotenv.config();

void (async () => {
  await crawlAndGenerateTestsService.learnWebsite(rootPage);
})();

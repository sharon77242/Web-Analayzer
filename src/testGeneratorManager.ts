import { loadHistory } from "./config";
import { logInfo } from "./logger";
import { promptHistoryService } from "./services/promptHistoryService";
import { scenariosService } from "./services/scenariosService";
import { testRunnerService } from "./services/testRunnerService";
import { testGeneratorService } from "./services/testsGeneratorService";

async function learnPage(html: string) {
  if (loadHistory) {
    await promptHistoryService.loadMessages();
  } else {
    await scenariosService.learnScenarios(html);
    await testGeneratorService.learnTests();
  }
  let testResults = await testRunnerService.runTests();
  let times = 1;
  while (!testResults.success) {
    await logInfo("retry tests generation times:", times++);
    await testGeneratorService.retryLearningTests(testResults.output);
    testResults = await testRunnerService.runTests();
  }
}
export const testGeneratorManager = { learnPage };

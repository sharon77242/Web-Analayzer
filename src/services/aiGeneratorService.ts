import {
  generateTestsPrompt,
  URL_STORE,
  retryGenerateTestsPrompt,
  scenariosPrompt,
  loadHistory,
} from "../config";
import globalStore from "../globalStore";
import { logInfo } from "../logger";
import { ThrowingError } from "../types";
import { getPackageVersion } from "../utils";
import { aIProxy } from "./aIProxy";
import { dbService, DESTINATION } from "./dbService";
import { promptHistoryService } from "./promptHistoryService";
import { testRunnerService } from "./testRunnerService";

async function generateScenarios(html: string): Promise<string> {
  const url = globalStore[URL_STORE];
  await logInfo("sending model to learn scenarios for url: ", url);
  const scenarios: string = await aIProxy.prompt(scenariosPrompt(html));
  await logInfo("model learned from scenarios", { url, scenarios });
  await dbService.write(DESTINATION.SCENARIOS, scenarios);
  return scenarios;
}

async function baseLearnTests(promptContent: string) {
  const response = await aIProxy.prompt(promptContent);
  const cleanedContent = response
    // Use a regular expression to find and remove the opening fence (e.g., ```typescript)
    .replace(/^```(typescript|javascript)?\n/, "")
    // Find and remove the closing fence at the end of the string
    .replace(/\n```$/, "")
    .trim();
  const url = globalStore[URL_STORE];

  await dbService.write(DESTINATION.TESTS, cleanedContent);
  await logInfo("model learned tests for url: ", url);

  return cleanedContent;
}

async function generateTests() {
  const url = globalStore[URL_STORE];

  await logInfo("sending model to learn tests for url: ", url);
  const playwrightVersion = await getPackageVersion("playwright");

  const html = await dbService.read(DESTINATION.HTML);
  if (!html) throw new ThrowingError("html File does not exists");

  const scenarios = await dbService.read(DESTINATION.SCENARIOS);
  if (!scenarios) throw new ThrowingError("scenarios File does not exists");

  return baseLearnTests(
    generateTestsPrompt(scenarios, html, playwrightVersion)
  );
}

async function retryGenerateTests(testsOutput: string) {
  const url = globalStore[URL_STORE];
  const testsCode = await dbService.read(DESTINATION.TESTS);
  if (!testsCode) throw new ThrowingError("Tests code File does not exists");

  const html = await dbService.read(DESTINATION.HTML);
  if (!html) throw new ThrowingError("html File does not exists");
  await logInfo("retry model to learn tests for url: ", url);

  return baseLearnTests(retryGenerateTestsPrompt(testsOutput, testsCode, html));
}

async function generateTestsForPage(html: string) {
  if (loadHistory) {
    await promptHistoryService.loadMessages();
  } else {
    await generateScenarios(html);
    await generateTests();
  }
  let testResults = await testRunnerService.runTests();
  let times = 1;
  while (!testResults.success && times <= 10) {
    await promptHistoryService.clearAll();
    await logInfo("retry tests generation times:", times++);
    await retryGenerateTests(testResults.output);
    testResults = await testRunnerService.runTests();
  }
}

export const aiGeneratorService = {
  generateTestsForPage,
};

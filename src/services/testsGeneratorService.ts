import {
  generateTestsPrompt,
  URL_STORE,
  retryGenerateTestsPrompt,
} from "../config";
import globalStore from "../globalStore";
import { logInfo } from "../logger";
import { getPackageVersion } from "../utils";
import { aIService } from "./aIService";
import { dbService, DESTINATION } from "./dbService";

async function baseLearnTests(promptContent: string) {
  const response = await aIService.learn(promptContent);
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

async function learnTests() {
  const url = globalStore[URL_STORE];

  await logInfo("sending model to learn tests for url: ", url);
  const playwrightVersion = await getPackageVersion("playwright");

  return baseLearnTests(generateTestsPrompt(playwrightVersion));
}

async function retryLearningTests(testsOutput: string) {
  const url = globalStore[URL_STORE];

  await logInfo("retry model to learn tests for url: ", url);

  return baseLearnTests(retryGenerateTestsPrompt(testsOutput));
}

export const testGeneratorService = { learnTests, retryLearningTests };

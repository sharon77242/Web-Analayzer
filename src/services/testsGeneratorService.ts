import { generateTestsPrompt } from "../config";
import { logInfo } from "../logger";
import { aIService } from "./aIService";
import { dbService, DESTINATION } from "./dbService";

async function learnTests(url: string, html: string, scenarios: string) {
  await logInfo("sending model to learn tests for url: ", url);

  const response = await aIService.learn(generateTestsPrompt(scenarios, html));
  const cleanedContent = response
    // Use a regular expression to find and remove the opening fence (e.g., ```typescript)
    .replace(/^```(typescript|javascript)?\n/, "")
    // Find and remove the closing fence at the end of the string
    .replace(/\n```$/, "")
    .trim();
  await dbService.write(DESTINATION.TESTS, url, cleanedContent);
  await logInfo("model learned tests for url: ", url);

  return cleanedContent;
}

export const testGeneratorService = { learnTests };

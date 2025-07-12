import { scenariosPrompt } from "../config";
import { logInfo } from "../logger";
import { aIService } from "./aIService";
import { dbService, DESTINATION } from "./dbService";

async function learnScenarios(url: string, html: string): Promise<string> {
  await logInfo("sending model to learn scenarios for url: ", url);
  const scenarios: string = await aIService.learn(scenariosPrompt(html));
  await logInfo("model learned from scenarios", { url, scenarios });
  await dbService.write(DESTINATION.SCENARIOS, url, scenarios);
  return scenarios;
}

export const scenariosService = { learnScenarios };

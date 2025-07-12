import { scenariosPrompt, URL_STORE } from "../config";
import globalStore from "../globalStore";
import { logInfo } from "../logger";
import { aIService } from "./aIService";
import { dbService, DESTINATION } from "./dbService";

async function learnScenarios(html: string): Promise<string> {
  const url = globalStore[URL_STORE];
  await logInfo("sending model to learn scenarios for url: ", url);
  const scenarios: string = await aIService.learn(scenariosPrompt(html));
  await logInfo("model learned from scenarios", { url, scenarios });
  await dbService.write(DESTINATION.SCENARIOS, scenarios);
  return scenarios;
}

export const scenariosService = { learnScenarios };

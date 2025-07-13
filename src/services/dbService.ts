import fs from "fs/promises";
import path from "path";
import { currentDir, URL_STORE } from "../config";
import { type DestinationToPathType } from "../types";
import globalStore from "../globalStore";

export enum DESTINATION {
  HTML,
  SCENARIOS,
  TESTS,
  PROMPT_HISTORY,
}
const DestinationToPath: DestinationToPathType = {
  [DESTINATION.HTML]: (url: string): string =>
    path.join(currentDir, "outputs/", `html_${url}.txt`),
  [DESTINATION.SCENARIOS]: (url: string): string =>
    path.join(currentDir, "outputs/", `scenarios_${url}.txt`),
  [DESTINATION.TESTS]: (url: string): string =>
    path.join(currentDir, "tests/", `tests_${url}.spec.ts`),
  [DESTINATION.PROMPT_HISTORY]: (url: string): string =>
    path.join(currentDir, "outputs/", `promptHistory_${url}.txt`),
};

async function write(destination: DESTINATION, data: string) {
  const url = globalStore[URL_STORE];

  const safeUrl = url.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const fullPath: string = DestinationToPath[destination](safeUrl);

  try {
    await fs.writeFile(fullPath, data, "utf-8");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    const dirOnly = path.dirname(fullPath);
    await fs.mkdir(dirOnly, { recursive: true });
    await fs.writeFile(fullPath, data, "utf-8");
  }
}

async function read(destination: DESTINATION): Promise<string | null> {
  const url = globalStore[URL_STORE];

  const safeUrl = url.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const path: string = DestinationToPath[destination](safeUrl);

  try {
    return await fs.readFile(path, "utf-8");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return null;
  }
}

export const dbService = {
  write,
  read,
};

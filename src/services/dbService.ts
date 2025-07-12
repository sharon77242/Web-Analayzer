import fs from "fs/promises";
import path from "path";
import { currentDir, nowTime } from "../config";
import { type DestinationToPathType } from "../types";

export enum DESTINATION {
  HTML,
  SCENARIOS,
  TESTS,
}
const DestinationToPath: DestinationToPathType = {
  [DESTINATION.HTML]: (url: string): string =>
    path.join(currentDir, "outputs/", `${nowTime}`, `html_${url}.txt`),
  [DESTINATION.SCENARIOS]: (url: string): string =>
    path.join(currentDir, "outputs/", `${nowTime}`, `scenarios_${url}.txt`),
  [DESTINATION.TESTS]: (url: string): string =>
    path.join(currentDir, "src/tests/", `tests_${url}.spec.ts`),
};

async function write(destination: DESTINATION, url: string, data: string) {
  const safeUrl = url.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const fullPath: string = DestinationToPath[destination](safeUrl);

  try {
    await fs.writeFile(fullPath, data, "utf-8");
  } catch (e) {
    const dirOnly = path.dirname(fullPath);
    await fs.mkdir(dirOnly, { recursive: true });
    await fs.writeFile(fullPath, data, "utf-8");
  }
}

async function read(
  destination: DESTINATION,
  url: string
): Promise<string | null> {
  const safeUrl = url.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const path: string = DestinationToPath[destination](safeUrl);

  try {
    const result = await fs.readFile(path, "utf-8");
    return JSON.parse(result) as string;
  } catch (e) {
    return null;
  }
}

export const dbService = {
  write,
  read,
};

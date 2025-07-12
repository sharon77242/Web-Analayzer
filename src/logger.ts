import { promises as fs } from "fs";
import * as path from "path";
import { nowTime } from "./config";

export type LogLevel = "info" | "warn" | "error" | "debug";

const logDir = () => path.join(process.cwd(), "outputs", `${nowTime}`, "logs");

async function ensureLogDir() {
  await fs.mkdir(logDir(), { recursive: true });
}

async function log(level: LogLevel, message: string, meta?: any) {
  await ensureLogDir();
  const file = path.join(logDir(), `${level}.log`);
  const timestamp = new Date().toISOString();
  let line = `[${timestamp}] ${message}`;
  if (meta !== undefined) {
    line += ` | ${JSON.stringify(meta)}`;
  }
  line += "\n";
  await fs.appendFile(file, line, "utf-8");
}

export async function logInfo(message: string, meta?: any) {
  await log("info", message, meta);
}

export async function logWarn(message: string, meta?: any) {
  await log("warn", message, meta);
}
export async function logError(message: string, meta?: any) {
  await log("error", message, meta);
}
export async function logDebug(message: string, meta?: any) {
  await log("debug", message, meta);
}

import { promises as fs } from "fs";
import * as path from "path";

export type LogLevel = "info" | "warn" | "error" | "debug";

const logDir = (time: number) =>
  path.join(process.cwd(), "outputs", `${time}`, "logs");

async function ensureLogDir(time: number) {
  await fs.mkdir(logDir(time), { recursive: true });
}

export async function log(
  time: number,
  level: LogLevel,
  message: string,
  meta?: any
) {
  await ensureLogDir(time);
  const file = path.join(logDir(time), `${level}.log`);
  const timestamp = new Date().toISOString();
  let line = `[${timestamp}] ${message}`;
  if (meta !== undefined) {
    line += ` | ${JSON.stringify(meta)}`;
  }
  line += "\n";
  await fs.appendFile(file, line, "utf-8");
}

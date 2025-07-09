import { promises as fs } from "fs";
import * as path from "path";

export type LogLevel = "info" | "warn" | "error" | "debug";

const logDir = path.join(process.cwd(), "outputs", "logs");

async function ensureLogDir() {
  await fs.mkdir(logDir, { recursive: true });
}

export async function log(level: LogLevel, message: string, meta?: any) {
  await ensureLogDir();
  const file = path.join(logDir, `${level}.log`);
  const timestamp = new Date().toISOString();
  let line = `[${timestamp}] ${message}`;
  if (meta !== undefined) {
    line += ` | ${JSON.stringify(meta)}`;
  }
  line += "\n";
  await fs.appendFile(file, line, "utf-8");
}

import { logError } from "./logger";
import type { DESTINATION } from "./services/dbService";

export class ThrowingError extends Error {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(errorMessage: string, meta?: any) {
    const message =
      errorMessage + meta !== undefined ? JSON.stringify(meta) : "";
    super(message);
    logError(errorMessage, meta).catch((err) => {
      console.error("Failed to log error:", err);
    });
  }
}

type UrlToPathFn = (url: string) => string;

export type DestinationToPathType = Record<DESTINATION, UrlToPathFn>;

interface modelChoice {
  message: { content: string };
}
export interface ModelResponse {
  choices: modelChoice[];
}

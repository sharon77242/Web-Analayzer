import { logError } from "./logger";
import type { DESTINATION } from "./services/dbService";

export class ThrowingError extends Error {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(errorMessage: string, meta?: any) {
    const message =
      errorMessage + (meta !== undefined ? JSON.stringify(meta) : "");
    super(message);
    try {
      // Fire-and-forget safely
      void logError(errorMessage, meta).catch((err) => {
        console.error("Async logging failed:", err);
      });
    } catch (err) {
      console.error("Synchronous logging failed:", err);
    }
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

export interface TestRunResult {
  success: boolean;
  output: string; // This will contain stdout on success, or the error log on failure
}

export interface PromptType {
  role: string;
  content: string;
}

export interface RequestHeaders {
  "Content-Type": "application/json";
  Authorization: string;
  [key: string]: string; // Allows for extra headers like those from OpenRouter
}

export interface ProviderConfig {
  apiProvider: string;
  apiUrl: string;
  modelId: string;
  apiToken: string | undefined; // process.env can be undefined
  extraHeaders?: Record<string, string>;
}

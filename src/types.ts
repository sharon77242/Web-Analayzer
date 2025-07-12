import { logError } from "./logger";
import type { DESTINATION } from "./services/dbService";

export class ThrowingError extends Error {
  constructor(errorMessage: string, meta?: any) {
    const message =
      errorMessage + meta !== undefined ? JSON.stringify(meta) : "";
    super(message);
    logError(errorMessage, meta);
  }
}

type UrlToPathFn = (url: string) => string;

export type DestinationToPathType = Record<DESTINATION, UrlToPathFn>;

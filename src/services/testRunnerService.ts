import util from "util"; // Import the 'util' module to promisify exec
import { exec } from "child_process"; // Import the 'exec' function from Node.js
import { logInfo, logWarn } from "../logger";
import type { TestRunResult } from "../types";

const execPromise = util.promisify(exec);

async function runTests(): Promise<TestRunResult> {
  await logInfo("Starting Playwright tests...");
  try {
    // Await the result of the 'npm run test' command
    const { stdout, stderr } = await execPromise("npm run test");

    // If there were any non-fatal warnings, log them
    if (stderr) {
      await logWarn("Test Run Warnings (tests passed):", stderr);
    }

    await logInfo("Test run completed successfully.");
    // On success, return the standard output
    return { success: true, output: stdout };
  } catch (error: unknown) {
    // This block now executes when tests fail (the desired behavior)
    await logWarn("Test run failed. Capturing error log for AI review.");

    // The detailed Playwright error report is in the `stdout` property of the error object.
    if (error && typeof error === "object" && "stdout" in error) {
      const errorLog = error.stdout as string;
      return { success: false, output: errorLog };
    }

    // Fallback for other types of errors
    if (error instanceof Error) {
      return { success: false, output: error.message };
    }

    // Final fallback for unknown error types
    return {
      success: false,
      output: "An unknown error occurred while running tests.",
    };
  }
}

export const testRunnerService = {
  runTests,
};

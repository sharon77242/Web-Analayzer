import fs from "fs/promises";
import { ThrowingError } from "./types";

// --- NEW: Define a type for the package.json structure ---
// This helps TypeScript understand the shape of the parsed JSON object.
interface PackageJson {
  version: string;
}

/**
 * Asynchronously gets the installed version of a specified npm package.
 * @param packageName The name of the package (e.g., 'playwright').
 * @returns The version string from the package's package.json, or null if not found.
 */
export async function getPackageVersion(packageName: string): Promise<string> {
  try {
    // `require.resolve` finds the full path to a package's entry point.
    // By appending '/package.json', we can get the path to its manifest file.
    const packageJsonPath = require.resolve(`${packageName}/package.json`);

    // Asynchronously read the content of the package.json file.
    const packageJsonContent = await fs.readFile(packageJsonPath, "utf-8");

    // Parse the JSON content and assert its type to our interface.
    // This tells TypeScript that we expect `packageJson` to have a `version` property.
    const packageJson = JSON.parse(packageJsonContent) as PackageJson;

    // Add a runtime check to be extra safe before returning.
    if (typeof packageJson.version === "string") {
      return packageJson.version;
    }

    throw new ThrowingError(
      `Error: "version" field not found or not a string in ${packageName}'s package.json`
    );
  } catch (error: unknown) {
    throw new ThrowingError(
      `Error finding version for package "${packageName}":`,
      error
    );
  }
}

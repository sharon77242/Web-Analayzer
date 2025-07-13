import type { ProviderConfig } from "./types";
import * as dotenv from "dotenv";
dotenv.config();

export const loadHistory = process.env.LOAD_HISTORY === "true";
export const rootPage = "https://wikipedia.org";
export const nowTime = new Date().getTime();
export const currentDir = process.cwd();
export const URL_STORE = "url";

const USE_OPENROUTER = process.env.USE_OPENROUTER === "true";

// --- Provider Configurations ---
const huggingFaceConfig: ProviderConfig = {
  apiProvider: "Hugging Face",
  apiUrl: "https://router.huggingface.co/v1/chat/completions",
  modelId: "Qwen/Qwen2-72B-Instruct",
  apiToken: process.env.HUGGINGFACE_TOKEN,
};

const openRouterConfig: ProviderConfig = {
  apiProvider: "OpenRouter",
  apiUrl: "https://openrouter.ai/api/v1/chat/completions",
  modelId: "deepseek/deepseek-r1-0528:free",
  apiToken: process.env.OPENROUTER_API_KEY,
  // OpenRouter requires these headers for identification.
  extraHeaders: {
    "HTTP-Referer": "http://localhost:3000", // Replace with your app's URL
    "X-Title": "website-analyzer", // Replace with your app's name
  },
};

export const modelConfig: ProviderConfig = USE_OPENROUTER
  ? openRouterConfig
  : huggingFaceConfig;

export const scenariosPrompt = (html: string): string => `
You are an expert QA analyst. Your task is to analyze the following HTML and generate comprehensive test scenarios for all interactive features.

**Instructions:**
1.  Analyze the HTML to identify all key user-facing features that a user can interact with. Focus on forms, buttons, links, search bars, and navigation menus.
2.  For each feature, create a list of test scenarios covering its core functionality.
3.  Each scenario must clearly describe a user action and the expected, verifiable outcome.
4.  Include both positive "happy path" scenarios and negative "error case" scenarios.
5.  Return ONLY a single, valid JSON object. Do not add any explanatory text before or after the JSON.
6.  The keys of the JSON object must be the feature names (e.g., "LoginForm"), and the value for each key must be an array of the scenario strings.

**HTML to Analyze:**
${html}
`;

export const generateTestsPrompt = (
  scenarios: string, // Expects a JSON string of the scenarios from the previous step
  html: string,
  playwrightVersion: string
): string => `
You are an expert test automation engineer specializing in Playwright. Your task is to write a full test suite in a single file based on the provided list of test scenarios and the HTML context.

**Instructions:**
1.  **One Test Per Scenario:** You MUST iterate through every scenario in the provided JSON. For each individual scenario string, you must generate exactly one corresponding \`test()\` block that implements it. The test name should be descriptive and based on the scenario.
2.  **Group Tests:** Group related tests for a single feature inside a \`test.describe()\` block.
3.  **Follow Best Practices:** Write clean, readable, and resilient tests compatible with Playwright version: ${playwrightVersion}.
4.  **Use User-Facing Locators:** You MUST prioritize user-facing locators in this order: \`getByRole\`, \`getByText\`, \`getByLabel\`. Use CSS selectors only as a last resort.
5.  **Follow the Example:** The generated test file MUST follow the style and structure of the high-quality example provided below.
6.  **Return ONLY Code:** Your final output must be ONLY the TypeScript code for the test file without any explnations or comments.
7.  **Ensure all Scenario exists:** You MUST ensure all scenarios exists and its valid via syntax.
---

### High-Quality Example

\`\`\`typescript
import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test('should allow a user to search for a known model', async ({ page }) => {
    // Arrange
    await page.goto('https://huggingface.co');
    // Act
    await page.getByRole('searchbox', { name: 'Search models, datasets, and spaces' }).fill('Qwen2');
    await page.keyboard.press('Enter');
    // Assert
    await expect(page).toHaveURL(/.*models\\?search=Qwen2/);
    await expect(page.getByText('Qwen/Qwen2.5-72B-Instruct')).toBeVisible();
  });

  test('should show a "no results" message for a nonsense search', async ({ page }) => {
    // Arrange
    await page.goto('https://huggingface.co');
    // Act
    await page.getByRole('searchbox', { name: 'Search models, datasets, and spaces' }).fill('asdfghjklqwerty');
    await page.keyboard.press('Enter');
    // Assert
    await expect(page.getByText(/results for asdfghjklqwerty/)).toBeVisible();
  });
});
\`\`\`

---

### Your Task

**HTML Context:**
\`\`\`html
${html}
\`\`\`

**Test Scenarios to Implement (in JSON format):**
\`\`\`json
${scenarios}
\`\`\`
`;

export const retryGenerateTestsPrompt = (
  errorLog: string,
  failingCode: string,
  htmlContext: string
): string => `
You are an expert debugging and test automation engineer. The following Playwright test file, which you previously wrote, has failed during execution. Your task is to analyze the error, identify the bug in the code by cross-referencing with the original HTML, and provide a corrected, fully functional version of the entire test file.

**Instructions:**
1.  **Analyze the Error Log & HTML:** Carefully read the "Test Runner Error Log" and compare it against the "Original Test Code" and the "HTML Context".
2.  **Think Step-by-Step:** First, identify the specific locator or assertion that is causing the error. Second, find the correct element or state in the HTML. Finally, write the corrected code.
3.  **Correct the Code:** Rewrite the provided "Original Test Code" to fix all the bugs identified in the error log. Prioritize creating resilient, user-facing locators.
4.  **Preserve Passing Tests:** The final output MUST include the full, corrected TypeScript code for the entire test file. Tests not mentioned in the error log should be considered "passing" and must be returned unchanged.
5.  **Return ONLY Code:** Your final output must be ONLY the TypeScript codewithout any explnations or comments.

---

### Original Test Code

\`\`\`typescript
${failingCode}
\`\`\`

---

### Test Runner Error Log

\`\`\`
${errorLog}
\`\`\`

---

### HTML Context (Truncated)

\`\`\`html
${htmlContext}
\`\`\`
`;

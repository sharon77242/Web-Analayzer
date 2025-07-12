export const loadHistory = true;
export const rootPage = "https://wikipedia.org";
export const nowTime = new Date().getTime();
export const currentDir = process.cwd();
export const MODEL_ID = "Qwen/Qwen2.5-72B-Instruct";
export const API_URL = "https://router.huggingface.co/v1/chat/completions";
export const URL_STORE = "url";
export const scenariosPrompt = (
  html: string
): string => `You are an expert QA analyst. Your task is to analyze the following HTML and generate comprehensive test scenarios.

**Instructions:**
1.  Carefully examine the HTML to identify the most important user-facing features.
2.  For each identified feature, create a list of test scenarios.
3.  Each scenario should describe a user action and the expected outcome.
4.  Include scenarios for both valid (happy path) and invalid (error case) user actions.
5.  Return ONLY the output as a single, valid JSON object. The keys of the object should be the feature names, and the value for each key should be an array of strings, where each string is a test scenario.

**HTML to Analyze:**
${html}`;

export const generateTestsPrompt = (playwrightVersion: string): string => `
By the context (html and scenarios) you are given, now you are an expert test automation engineer specializing in Playwright. Your task is to write test for each scenario, executable Playwright tests based on the provided scenarios and HTML context.

**Instructions:**
1.  **Follow Best Practices:** Write a clean, readable, and resilient tests compatible with Playwright version: ${playwrightVersion}.
2.  **Use User-Facing Locators:** You MUST prioritize user-facing locators in this order: \`getByRole\`, \`getByText\`, \`getByLabel\`, \`getByPlaceholder\`. Only use CSS selectors or \`test-id\` as a last resort.
3.  **Follow the Example:** The generated test MUST follow the style, structure, and patterns of the high-quality example provided below.
4.  **Implement the Scenario:** The test must accurately implement the user action and expected outcome described in the "Test Scenario to Implement".
5.  **Return ONLY Code:** Your final output must be ONLY the TypeScript code for the test. Do not include any explanations, comments, or markdown formatting.

---

### High-Quality Example

Here is an example of a perfect Playwright test. Use this as your guide for structure and style.

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('should allow a user to search for a model', async ({ page }) => {
  // Arrange: Go to the page
  await page.goto('https://huggingface.co');

  // Act: Fill the search bar and press Enter
  await page.getByRole('searchbox', { name: 'Search models, datasets, and spaces' }).fill('Qwen2');
  await page.keyboard.press('Enter');

  // Assert: Verify the user is on the results page and the model is visible
  await expect(page).toHaveURL(/.*models\\?search=Qwen2/);
  await expect(page.getByText('Qwen/Qwen2-72B-Instruct')).toBeVisible();
});
\`\`\`
`;

export const retryGenerateTestsPrompt = (testsOutput: string): string => `
You are an expert debugging and test automation engineer. The Playwright tests, which you previously wrote, has failed during execution. Your task is to analyze the error, identify the bug in the code, and provide a corrected, fully functional version of the tests.

**Instructions:**
1.  **Analyze the Error:** Carefully read the "Test Runner Error Log" to understand why the test failed. The error is often related to an incorrect locator, a timing issue, or a flawed assertion.
2.  **Correct the Code:** Rewrite the provided "Failing Test Code" to fix the bug. Pay close attention to using resilient, user-facing locators and adding waits where necessary.
3.  **Return ONLY Code:** Your final output must be ONLY the full, corrected TypeScript code for the tests file (both those you fixed and also those that was there before). Do not include any explanations, comments, or markdown formatting.


---

### Test Runner Error Log

\`\`\`
${testsOutput}
\`\`\`

`;

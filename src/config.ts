export const nowTime = new Date().getTime();
export const currentDir = process.cwd();
export const MODEL_ID = "Qwen/Qwen2.5-72B-Instruct";
export const API_URL = "https://router.huggingface.co/v1/chat/completions";
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

export const generateTestsPrompt = (
  scenarios: string,
  html: string,
  playwrightVersion: string
): string => `
You are an expert test automation engineer. Your task is to write an executable test script using Playwright version: ${playwrightVersion} based on the provided test scenario and HTML context.

**Instructions:**
1.  Write a complete Playwright test that implements the given scenario.
2.  Use CSS selectors to locate the necessary elements from the provided HTML.
3.  Include a clear assertion to verify the expected outcome.
4.  Ensure code is running and does not have syntax issues.
5.  Return ONLY the TypeScript code for the test file. Do not include any explanations or markdown formatting.

---

**Test Scenario to Implement:**
${scenarios}

**HTML Context:**
${html}
`;

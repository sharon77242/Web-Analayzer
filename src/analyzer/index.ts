import * as dotenv from "dotenv";
dotenv.config();
import { log } from "../logger";
import fs from "fs/promises";

//const MODEL_ID = "openai-community/gpt2";
const MODEL_ID = "Qwen/Qwen2-72B-Instruct";

// This is the new, more robust OpenAI-compatible endpoint URL.
const API_URL = "https://router.huggingface.co/v1/chat/completions";
const nowTime = new Date().getTime();

export class WebsiteAnalyzer {
  async analyze(url: string): Promise<void> {
    const path = await import("path");
    await log(nowTime, "info", `Analyzing website: ${url}`);
    const data = await this.fetchData(url);

    const outputsDir = path.join(process.cwd(), "outputs/" + nowTime);
    const safeUrl = url.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    await fs.mkdir(outputsDir, { recursive: true });

    // Write outputs to files in outputs folder
    await fs.writeFile(
      path.join(outputsDir, `fetchUrl_${safeUrl}.txt`),
      data,
      "utf-8"
    );

    const testsDir = path.join(process.cwd(), "src/tests/");
    await fs.mkdir(testsDir, { recursive: true });

    const lernedFilePath = path.join(testsDir, `tests_${safeUrl}.spec.ts`);
    let scenarios: string;

    try {
      const file = await fs.readFile(lernedFilePath, "utf8");
      scenarios = JSON.parse(file);
    } catch (e) {
      scenarios = await this.learnWebsite(data);
      await fs.writeFile(lernedFilePath, scenarios, "utf-8");
    }

    await log(
      nowTime,
      "info",
      `Outputs written to outputs/${nowTime} for ${url}`
    );
    // Further analysis logic can be added here
  }

  async fetchData(url: string): Promise<string> {
    await log(nowTime, "debug", `Fetching data from: ${url}`);
    // Use dynamic import for node-fetch to avoid ESM/CJS issues
    const fetch = (await import("node-fetch")).default;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      return await response.text();
    } catch (err) {
      await log(nowTime, "error", "Fetch error", { error: err });
      return `<html>Failed to fetch real data from ${url}</html>`;
    }
  }

  /**
   * Use Hugging Face Inference API (free tier) to extract website features from HTML.
   * This is an async function and returns a Promise.
   */
  async learnWebsite(html: any): Promise<string> {
    await log(
      nowTime,
      "info",
      "Learning website from parsed data using Hugging Face AI..."
    );

    const API_TOKEN = process.env.HUGGINGFACE_TOKEN;

    if (!API_TOKEN) {
      await log(
        nowTime,
        "error",
        "Error: HUGGINGFACE_TOKEN environment variable is not set."
      );
      throw Error();
    }

    // const promptContent = `
    // You are an expert test automation engineer. Your task is to analyze the following HTML and generate an executable test script using Playwright.

    // **Instructions:**
    // 1.  Carefully examine the HTML to identify all key user-facing features, components, and interactions (e.g., forms, buttons, navigation links, display sections).
    // 2.  For each feature, write one end-to-end test case.
    // 3.  Each test should be written in TypeScript using the Playwright testing library.
    // 4.  Use descriptive test names and clear assertions (e.g., expect(page).toHaveURL(...)).
    // 5.  Return ONLY the TypeScript code for the test file. Do not include any explanations or markdown formatting.

    // **HTML to Analyze:**
    // ${html}
    // `;

    const promptContent = `generate a short example playright typescript example, Return ONLY the TypeScript code for the test file. Do not include any explanations or markdown formatting`;

    const messages = [
      {
        role: "user",
        content: promptContent,
      },
    ];

    const requestBody = {
      model: MODEL_ID,
      messages: messages,
    };

    // Use dynamic import for node-fetch to avoid ESM/CJS issues
    const fetch = (await import("node-fetch")).default;
    try {
      const controller = new AbortController();
      // --- NEW: Set a 3-minute timeout for the request ---
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 300,000 ms = 5 minutes

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        await log(
          nowTime,
          "error",
          `Status: ${response.status} ${response.statusText}, Server Response: ${errorText}`
        );
        throw Error();
      }
      const result: any = await response.json();

      await log(nowTime, "info", "\n--- SUCCESS! ---");
      if (result.choices && result.choices.length > 0) {
        const content = result.choices[0].message.content;
        await log(nowTime, "info", "Raw model output received.");
        await log(nowTime, "debug", `response from model: ${content}`);

        try {
          const cleanedContent = content
            // Use a regular expression to find and remove the opening fence (e.g., ```typescript)
            .replace(/^```(typescript|javascript)?\n/, "")
            // Find and remove the closing fence at the end of the string
            .replace(/\n```$/, "")
            .trim();
          return cleanedContent;
        } catch (parseError) {
          await log(
            nowTime,
            "error",
            "\nCould not parse the output as JSON. The model may have returned plain text." +
              parseError
          );
          await log(nowTime, "info", "Raw output was:", content);
          throw Error();
        }
      } else {
        await log(
          nowTime,
          "error",
          "Received an unexpected response format:",
          result
        );
        throw Error();
      }
    } catch (error) {
      await log(nowTime, "error", "\n--- A GENERAL ERROR OCCURRED ---");
      await log(nowTime, "error", `${error}`);
      throw Error();
    }
  }
}

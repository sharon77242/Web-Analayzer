import * as dotenv from "dotenv";
dotenv.config();
import { log } from "../logger";

//const MODEL_ID = "openai-community/gpt2";
const MODEL_ID = "Qwen/Qwen2-72B-Instruct";

// This is the new, more robust OpenAI-compatible endpoint URL.
const API_URL = "https://router.huggingface.co/v1/chat/completions";

export class WebsiteAnalyzer {
  async analyze(url: string): Promise<void> {
    const fs = await import("fs/promises");
    const path = await import("path");
    await log("info", `Analyzing website: ${url}`);
    const data = await this.fetchData(url);
    const parsedData = this.parseData(data);

    const outputsDir = path.join(process.cwd(), "outputs");
    const safeUrl = url.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    await fs.mkdir(outputsDir, { recursive: true });

    const lernedFilePath = path.join(outputsDir, `scenarios_${safeUrl}.json`);
    const file = await fs.readFile(lernedFilePath, "utf8");
    let scenarios;
    if (file) {
      scenarios = JSON.parse(file);
    } else {
      scenarios = await this.learnWebsite(parsedData);
      await fs.writeFile(
        lernedFilePath,
        JSON.stringify(scenarios, null, 2),
        "utf-8"
      );
    }

    // Write outputs to files in outputs folder
    await fs.writeFile(
      path.join(outputsDir, `fetchData_${safeUrl}.txt`),
      data,
      "utf-8"
    );
    await fs.writeFile(
      path.join(outputsDir, `parsedData_${safeUrl}.json`),
      JSON.stringify(parsedData, null, 2),
      "utf-8"
    );

    await log("info", `Outputs written to outputs/ for ${url}`);
    // Further analysis logic can be added here
  }

  async fetchData(url: string): Promise<string> {
    await log("debug", `Fetching data from: ${url}`);
    // Use dynamic import for node-fetch to avoid ESM/CJS issues
    const fetch = (await import("node-fetch")).default;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      return await response.text();
    } catch (err) {
      await log("error", "Fetch error", { error: err });
      return `<html>Failed to fetch real data from ${url}</html>`;
    }
  }

  parseData(data: string): object {
    log("debug", `Parsing data: ${data}`);
    // Simulate parsing the HTML data
    return { content: data };
  }

  /**
   * Use Hugging Face Inference API (free tier) to extract website features from HTML.
   * This is an async function and returns a Promise.
   */
  async learnWebsite(parsedData: any): Promise<void> {
    await log(
      "info",
      "Learning website from parsed data using Hugging Face AI..."
    );
    const html = parsedData.content;
    const prompt = `Extract the main features, sections, and forms from the following HTML. Return a JSON array of feature names.\nHTML:\n${html}`;
    // const messages = [
    //   { role: "user", content: "The most interesting thing about space is" },
    // ];

    const API_TOKEN = process.env.HUGGINGFACE_TOKEN;

    if (!API_TOKEN) {
      console.error(
        "Error: HUGGINGFACE_TOKEN environment variable is not set."
      );
      return;
    }

    const promptContent = `
    You are an expert QA engineer. Your task is to analyze the following HTML and generate comprehensive test scenarios.

    **Instructions:**
    1.  Carefully examine the HTML to identify all key user-facing features, components, and interactions (e.g., forms, buttons, navigation links, display sections).
    2.  For each identified feature, create a list of test scenarios.
    3.  Each test scenario should be a clear, actionable instruction for a human tester.
    4.  Include positive tests (happy path), negative tests (invalid inputs, error conditions), and edge cases where applicable.
    5.  Return the output as a single, valid JSON object. The keys of the object should be the feature names, and the value for each key should be an array of strings, where each string is a detailed test scenario.

    **HTML to Analyze:**
    ${html}
    `;

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
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`--- API ERROR ---`);
        console.error(`Status: ${response.status} ${response.statusText}`);
        console.error(`Server Response: ${errorText}`);
        return;
      }
      const result: any = await response.json();

      console.log("\n--- SUCCESS! ---");
      if (result.choices && result.choices.length > 0) {
        const content = result.choices[0].message.content;
        console.log("Raw model output received.");

        try {
          const cleanedContent = content.replace(/```json\n|```/g, "").trim();
          return JSON.parse(cleanedContent);
        } catch (parseError) {
          console.log(
            "\nCould not parse the output as JSON. The model may have returned plain text."
          );
          console.log("Raw output was:", content);
        }
      } else {
        console.log("Received an unexpected response format:", result);
      }
    } catch (error) {
      console.error("\n--- A GENERAL ERROR OCCURRED ---");
      console.error(error);
    }
  }
}

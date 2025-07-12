
import { API_URL, MODEL_ID } from "../config";
import { logInfo } from "../logger";
import { ThrowingError } from "../types";

async function learn(promptContent: string): Promise<string> {
  if (!process.env.HUGGINGFACE_TOKEN)
    throw new ThrowingError(
      "Error: HUGGINGFACE_TOKEN environment variable is not set."
    );
  const API_TOKEN: string = process.env.HUGGINGFACE_TOKEN;
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

  try {
    const controller = new AbortController();
    // --- NEW: Set a 3-minute timeout for the request ---
    setTimeout(() => controller.abort(), 300000); // 300,000 ms = 5 minutes

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
      throw new ThrowingError(
        `Status: ${response.status} ${response.statusText}, Server Response: ${errorText}`
      );
    }
    const result: any = await response.json();

    await logInfo("\n--- SUCCESS! ---");
    if (result.choices && result.choices.length > 0) {
      return result.choices[0].message.content;
    } else {
      throw new ThrowingError(
        "Received an unexpected response format:",
        result
      );
    }
  } catch (error) {
    throw new ThrowingError("\n--- A GENERAL ERROR OCCURRED ---", error);
  }
}
export const aIService = { learn };

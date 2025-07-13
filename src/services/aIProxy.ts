import { modelConfig } from "../config"; // Import the new dynamic config
import { logInfo } from "../logger";
import type { ModelResponse, RequestHeaders } from "../types";
import { ThrowingError } from "../types";
import { promptHistoryService } from "./promptHistoryService";

async function prompt(promptContent: string): Promise<string> {
  // Check for the API token from the active configuration
  if (!modelConfig.apiToken) {
    throw new ThrowingError(
      `Error: API token for ${modelConfig.apiProvider} is not set.`
    );
  }
  const API_TOKEN: string = modelConfig.apiToken;
  await promptHistoryService.addUserPrompt(promptContent);

  const requestBody = {
    model: modelConfig.modelId, // Use the model from the active config
    messages: promptHistoryService.getMessages(),
  };

  // Combine standard headers with any extra headers from the config (for OpenRouter)
  const headers: RequestHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_TOKEN}`,
    ...modelConfig.extraHeaders,
  };

  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 3000000); // 5-minute timeout

    await logInfo(
      `Sending request to ${modelConfig.apiProvider} using model: ${modelConfig.modelId}`
    );

    const response = await fetch(modelConfig.apiUrl, {
      // Use the API URL from the active config
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ThrowingError(
        `Status: ${response.status} ${response.statusText}, Server Response: ${errorText}`
      );
    }
    const result: ModelResponse = (await response.json()) as ModelResponse;
    const { choices } = result;
    await logInfo("\n--- SUCCESS! ---");
    if (choices && choices.length > 0) {
      const content = choices[0].message.content;
      await promptHistoryService.addAssistantPrompt(content);
      return content;
    } else {
      throw new ThrowingError(
        "Received an unexpected response format:",
        result
      );
    }
  } catch (error) {
    throw new ThrowingError(
      `\n--- A GENERAL ERROR OCCURRED with ${modelConfig.apiProvider} ---`,
      error
    );
  }
}
export const aIProxy = { prompt };

import { logInfo } from "../logger";
import { ThrowingError, type PromptType } from "../types";
import { dbService, DESTINATION } from "./dbService";

// db.ts (singleton module)
class PromptHistoryService {
  private static instance: PromptHistoryService;
  private historyQueue: PromptType[] = [];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  static getInstance(): PromptHistoryService {
    if (!PromptHistoryService.instance) {
      PromptHistoryService.instance = new PromptHistoryService();
    }
    return PromptHistoryService.instance;
  }

  async addAssistantPrompt(content: string) {
    this.historyQueue.push({ role: "assistant", content });
    await dbService.write(
      DESTINATION.PROMPT_HISTORY,
      JSON.stringify([...this.historyQueue])
    );
  }

  async addUserPrompt(content: string) {
    this.historyQueue.push({ role: "user", content });
    await dbService.write(
      DESTINATION.PROMPT_HISTORY,
      JSON.stringify([...this.historyQueue])
    );
  }

  getMessages(): PromptType[] {
    return [...this.historyQueue];
  }

  async dequeuMessages(count: number) {
    for (let i = 0; i < count; i++) this.historyQueue.shift();
    await dbService.write(
      DESTINATION.PROMPT_HISTORY,
      JSON.stringify([...this.historyQueue])
    );
  }

  async clearAll() {
    this.historyQueue = [];
    await dbService.write(
      DESTINATION.PROMPT_HISTORY,
      JSON.stringify([...this.historyQueue])
    );
  }

  async loadMessages() {
    const result = await dbService.read(DESTINATION.PROMPT_HISTORY);
    if (!result) throw new ThrowingError("Prompt History File does not exists");
    const parsedResult = JSON.parse(result) as PromptType[];
    if (!parsedResult) throw new ThrowingError("Prompt History parsing failed");

    this.historyQueue.push(...parsedResult);
    await logInfo("loaded prompt from history");
  }
}

export const promptHistoryService = PromptHistoryService.getInstance();

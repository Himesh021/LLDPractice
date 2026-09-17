import type { AppConfig } from "../config/env";
import type { FeedbackProvider } from "./FeedbackProvider";
import { MockFeedbackProvider } from "./MockFeedbackProvider";
import { GroqFeedbackProvider, OpenAIFeedbackProvider } from "./OpenAIFeedbackProvider";

export function createFeedbackProvider(config: AppConfig): FeedbackProvider {
  switch (config.feedbackProvider) {
    case "openai":
      return new OpenAIFeedbackProvider({
        apiKey: config.openaiApiKey,
        model: config.openaiModel,
        baseURL: config.openaiBaseUrl,
      });
    case "groq":
      return new GroqFeedbackProvider({
        apiKey: config.groqApiKey,
        model: config.groqModel,
        baseURL: config.groqBaseUrl,
      });
    default:
      return new MockFeedbackProvider();
  }
}

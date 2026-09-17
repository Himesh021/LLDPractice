import OpenAI from "openai";
import type { EvaluationResult, Problem, Solution } from "../types/domain";
import {
  buildEvaluationUserPrompt,
  EVALUATION_SYSTEM_PROMPT,
} from "../prompts/evaluation.prompt";
import { ExternalServiceError } from "../utils/errors";
import { parseEvaluationResult } from "../utils/evaluationParser";
import type { FeedbackProvider } from "./FeedbackProvider";

interface OpenAiCompatibleConfig {
  apiKey: string;
  model: string;
  baseURL: string;
}

export class OpenAICompatibleFeedbackProvider implements FeedbackProvider {
  private readonly client: OpenAI;

  constructor(private readonly config: OpenAiCompatibleConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
  }

  async evaluate(problem: Problem, solution: Solution): Promise<EvaluationResult> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.config.model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: EVALUATION_SYSTEM_PROMPT },
          {
            role: "user",
            content: buildEvaluationUserPrompt({
              title: problem.title,
              description: problem.description,
              requirements: problem.requirements,
              constraints: problem.constraints,
              expectedConcepts: problem.expectedConcepts,
              solution,
            }),
          },
        ],
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new ExternalServiceError("The evaluator returned an empty response.", "INVALID_AI_RESPONSE");
      }
      return parseEvaluationResult(content);
    } catch (error) {
      if (error instanceof ExternalServiceError) {
        throw error;
      }
      throw new ExternalServiceError(
        "The design evaluator is temporarily unavailable. Your submission was saved and you can retry evaluation.",
        "AI_PROVIDER_FAILURE",
      );
    }
  }
}

export class OpenAIFeedbackProvider extends OpenAICompatibleFeedbackProvider {
  constructor(config: { apiKey: string; model: string; baseURL?: string }) {
    super({
      apiKey: config.apiKey,
      model: config.model,
      baseURL: config.baseURL ?? "https://api.openai.com/v1",
    });
  }
}

export class GroqFeedbackProvider extends OpenAICompatibleFeedbackProvider {
  constructor(config: { apiKey: string; model: string; baseURL?: string }) {
    super({
      apiKey: config.apiKey,
      model: config.model,
      baseURL: config.baseURL ?? "https://api.groq.com/openai/v1",
    });
  }
}

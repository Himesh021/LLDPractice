import { z } from "zod";
import { CATEGORY_MAX, type EvaluationResult, type FeedbackCategories } from "../types/domain";
import { ExternalServiceError } from "../utils/errors";

const evaluationSchema = z.object({
  score: z.number().optional(),
  categories: z.object({
    classDesign: z.number(),
    abstraction: z.number(),
    encapsulation: z.number(),
    relationships: z.number(),
    extensibility: z.number(),
    designPatterns: z.number(),
  }),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
  improvedDesign: z.string(),
});

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, max: number): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return 0;
  }
  return Math.min(max, Math.max(0, round1(value)));
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : trimmed;
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
    throw new ExternalServiceError("The evaluator returned a response that was not valid JSON.", "INVALID_AI_RESPONSE");
  }
}

export function parseEvaluationResult(raw: string): EvaluationResult {
  let parsed: unknown;
  try {
    parsed = extractJson(raw);
  } catch (error) {
    if (error instanceof ExternalServiceError) {
      throw error;
    }
    throw new ExternalServiceError("The evaluator returned a response that was not valid JSON.", "INVALID_AI_RESPONSE");
  }

  const result = evaluationSchema.safeParse(parsed);
  if (!result.success) {
    throw new ExternalServiceError(
      "The evaluator returned JSON that did not match the expected feedback schema.",
      "INVALID_AI_RESPONSE",
    );
  }

  const categories: FeedbackCategories = {
    classDesign: clamp(result.data.categories.classDesign, CATEGORY_MAX.classDesign),
    abstraction: clamp(result.data.categories.abstraction, CATEGORY_MAX.abstraction),
    encapsulation: clamp(result.data.categories.encapsulation, CATEGORY_MAX.encapsulation),
    relationships: clamp(result.data.categories.relationships, CATEGORY_MAX.relationships),
    extensibility: clamp(result.data.categories.extensibility, CATEGORY_MAX.extensibility),
    designPatterns: clamp(result.data.categories.designPatterns, CATEGORY_MAX.designPatterns),
  };

  const computedScore = round1(
    categories.classDesign +
      categories.abstraction +
      categories.encapsulation +
      categories.relationships +
      categories.extensibility +
      categories.designPatterns,
  );

  return {
    score: computedScore,
    categories,
    strengths: result.data.strengths.filter((item) => item.trim().length > 0),
    weaknesses: result.data.weaknesses.filter((item) => item.trim().length > 0),
    suggestions: result.data.suggestions.filter((item) => item.trim().length > 0),
    improvedDesign: result.data.improvedDesign.trim(),
  };
}

export function assertScoreMatchesCategories(result: EvaluationResult): boolean {
  const sum = round1(
    result.categories.classDesign +
      result.categories.abstraction +
      result.categories.encapsulation +
      result.categories.relationships +
      result.categories.extensibility +
      result.categories.designPatterns,
  );
  return Math.abs(sum - result.score) < 0.05;
}

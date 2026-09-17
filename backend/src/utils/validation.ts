import { z } from "zod";
import { ValidationError } from "../utils/errors";

export const solutionSchema = z.object({
  classes: z.string(),
  interfaces: z.string(),
  relationships: z.string(),
  responsibilities: z.string(),
  explanation: z.string(),
});

export type SolutionInput = z.infer<typeof solutionSchema>;

const MIN_MEANINGFUL_LENGTH = 12;

function filled(value: string): boolean {
  return value.trim().length >= MIN_MEANINGFUL_LENGTH;
}

export function validateSolution(input: unknown) {
  const parsed = solutionSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      "Solution must include classes, interfaces, relationships, responsibilities, and explanation.",
    );
  }

  const solution = parsed.data;
  const meaningfulSections = [
    solution.classes,
    solution.interfaces,
    solution.relationships,
    solution.responsibilities,
    solution.explanation,
  ].filter(filled);

  if (meaningfulSections.length < 3) {
    throw new ValidationError(
      "Please describe at least three sections with meaningful detail (12+ characters each). Empty or placeholder text is not enough.",
    );
  }

  if (!filled(solution.classes) || !filled(solution.explanation)) {
    throw new ValidationError(
      "Classes and Design Explanation are required for a valid LLD submission.",
    );
  }

  return solution;
}

export function isValidObjectId(id: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(id);
}

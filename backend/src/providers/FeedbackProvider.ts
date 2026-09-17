import type { EvaluationResult, Problem, Solution } from "../types/domain";

export interface FeedbackProvider {
  evaluate(problem: Problem, solution: Solution): Promise<EvaluationResult>;
}

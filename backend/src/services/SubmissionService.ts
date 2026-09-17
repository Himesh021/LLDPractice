import type { FeedbackProvider } from "../providers/FeedbackProvider";
import type { FeedbackRepository, SubmissionRepository } from "../repositories/SubmissionRepository";
import type { ProblemRepository } from "../repositories/ProblemRepository";
import type { Feedback, Submission } from "../types/domain";
import { AppError, ExternalServiceError, NotFoundError, ValidationError } from "../utils/errors";
import { isValidObjectId, validateSolution } from "../utils/validation";

export class SubmissionService {
  constructor(
    private readonly submissions: SubmissionRepository,
    private readonly feedbacks: FeedbackRepository,
    private readonly problems: ProblemRepository,
    private readonly evaluator: FeedbackProvider,
  ) {}

  async create(problemId: string, solutionInput: unknown): Promise<{ submission: Submission; feedback: Feedback | null }> {
    if (!isValidObjectId(problemId)) {
      throw new ValidationError("Invalid problem ID.");
    }
    const problem = await this.problems.findById(problemId);
    if (!problem) {
      throw new NotFoundError("Problem not found.");
    }

    const solution = validateSolution(solutionInput);
    const submission = await this.submissions.create({ problemId, solution });

    const feedback = await this.evaluateInternal(submission, problem);
    return { submission: (await this.submissions.findById(submission.id)) ?? submission, feedback };
  }

  async retryEvaluation(submissionId: string): Promise<{ submission: Submission; feedback: Feedback | null }> {
    const submission = await this.requireSubmission(submissionId);
    const problem = await this.problems.findById(submission.problemId);
    if (!problem) {
      throw new NotFoundError("Problem not found for this submission.");
    }
    const feedback = await this.evaluateInternal(submission, problem);
    return { submission: (await this.submissions.findById(submission.id)) ?? submission, feedback };
  }

  async getById(id: string) {
    const submission = await this.requireSubmission(id);
    const [problem, feedback, siblings] = await Promise.all([
      this.problems.findById(submission.problemId),
      this.feedbacks.findBySubmissionId(submission.id),
      this.submissions.findByProblemId(submission.problemId),
    ]);

    if (!problem) {
      throw new NotFoundError("Problem not found for this submission.");
    }

    const attemptNumber = siblings.findIndex((item) => item.id === submission.id) + 1;
    const previousWithScore = await this.previousScoredAttempt(siblings, submission.id);

    return {
      submission,
      problem,
      feedback,
      attemptNumber,
      previousScore: previousWithScore?.score ?? null,
      improvement:
        feedback && previousWithScore ? round1(feedback.score - previousWithScore.score) : null,
    };
  }

  async history() {
    const submissions = await this.submissions.findAllNewestFirst();
    const [problems, feedbacks] = await Promise.all([
      this.problems.findAll(),
      this.feedbacks.findBySubmissionIds(submissions.map((item) => item.id)),
    ]);
    const problemById = new Map(problems.map((item) => [item.id, item]));
    const feedbackBySubmission = new Map(feedbacks.map((item) => [item.submissionId, item]));

    const attemptsByProblem = new Map<string, string[]>();
    const chronological = [...submissions].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
    for (const item of chronological) {
      const list = attemptsByProblem.get(item.problemId) ?? [];
      list.push(item.id);
      attemptsByProblem.set(item.problemId, list);
    }

    return submissions.map((submission) => {
      const problem = problemById.get(submission.problemId);
      const feedback = feedbackBySubmission.get(submission.id);
      const attemptNumber = (attemptsByProblem.get(submission.problemId) ?? []).indexOf(submission.id) + 1;
      return {
        id: submission.id,
        problemId: submission.problemId,
        problemTitle: problem?.title ?? "Unknown problem",
        difficulty: problem?.difficulty ?? "Medium",
        status: submission.status,
        score: feedback?.score ?? null,
        attemptNumber,
        createdAt: submission.createdAt,
      };
    });
  }

  private async previousScoredAttempt(siblings: Submission[], currentId: string) {
    const currentIndex = siblings.findIndex((item) => item.id === currentId);
    const earlier = siblings.slice(0, currentIndex).reverse();
    for (const item of earlier) {
      const feedback = await this.feedbacks.findBySubmissionId(item.id);
      if (feedback) {
        return feedback;
      }
    }
    return null;
  }

  private async requireSubmission(id: string): Promise<Submission> {
    if (!isValidObjectId(id)) {
      throw new ValidationError("Invalid submission ID.");
    }
    const submission = await this.submissions.findById(id);
    if (!submission) {
      throw new NotFoundError("Submission not found.");
    }
    return submission;
  }

  private async evaluateInternal(submission: Submission, problem: Awaited<ReturnType<ProblemRepository["findById"]>>) {
    if (!problem) {
      return null;
    }

    await this.submissions.updateStatus(submission.id, "evaluating");
    try {
      const result = await this.evaluator.evaluate(problem, submission.solution);
      const feedback = await this.feedbacks.replaceForSubmission({
        submissionId: submission.id,
        ...result,
      });
      await this.submissions.updateStatus(submission.id, "evaluated");
      return feedback;
    } catch (error) {
      const message = userFacingEvaluationError(error);
      await this.submissions.updateStatus(submission.id, "failed", message);
      return null;
    }
  }
}

function userFacingEvaluationError(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof ExternalServiceError) {
    return error.message;
  }
  return "Evaluation failed. Your submission was saved. You can retry evaluation.";
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

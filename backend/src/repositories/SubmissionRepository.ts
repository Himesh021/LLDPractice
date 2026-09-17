import type { Feedback, Submission, SubmissionStatus } from "../types/domain";

export interface SubmissionRepository {
  create(input: { problemId: string; solution: Submission["solution"] }): Promise<Submission>;
  findById(id: string): Promise<Submission | null>;
  findByProblemId(problemId: string): Promise<Submission[]>;
  findAllNewestFirst(): Promise<Submission[]>;
  updateStatus(id: string, status: SubmissionStatus, evaluationError?: string): Promise<void>;
}

export interface FeedbackRepository {
  create(input: Omit<Feedback, "id" | "createdAt">): Promise<Feedback>;
  findBySubmissionId(submissionId: string): Promise<Feedback | null>;
  findBySubmissionIds(submissionIds: string[]): Promise<Feedback[]>;
  replaceForSubmission(input: Omit<Feedback, "id" | "createdAt">): Promise<Feedback>;
}

import type { ProblemRepository } from "../repositories/ProblemRepository";
import type { FeedbackRepository, SubmissionRepository } from "../repositories/SubmissionRepository";
import { SOLVED_SCORE_THRESHOLD, type DashboardStats } from "../types/domain";

export class StatsService {
  constructor(
    private readonly problems: ProblemRepository,
    private readonly submissions: SubmissionRepository,
    private readonly feedbacks: FeedbackRepository,
  ) {}

  async getDashboard(): Promise<DashboardStats> {
    const [problemCount, allSubmissions] = await Promise.all([
      this.problems.count(),
      this.submissions.findAllNewestFirst(),
    ]);

    const attemptedIds = new Set(allSubmissions.map((item) => item.problemId));
    const feedbacks = await this.feedbacks.findBySubmissionIds(allSubmissions.map((item) => item.id));
    const feedbackBySubmission = new Map(feedbacks.map((item) => [item.submissionId, item]));

    const latestScoreByProblem = new Map<string, number>();
    const chronological = [...allSubmissions].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
    for (const submission of chronological) {
      const feedback = feedbackBySubmission.get(submission.id);
      if (feedback) {
        latestScoreByProblem.set(submission.problemId, feedback.score);
      }
    }

    const scores = [...latestScoreByProblem.values()];
    const problemsSolved = scores.filter((score) => score >= SOLVED_SCORE_THRESHOLD).length;
    const averageScore =
      scores.length === 0 ? null : Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10;

    return {
      problemCount,
      problemsAttempted: attemptedIds.size,
      problemsSolved,
      averageScore,
    };
  }
}

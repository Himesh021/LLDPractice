import axios from "axios";
import type {
  ApiErrorBody,
  DashboardStats,
  Feedback,
  HistoryItem,
  Problem,
  Solution,
  Submission,
  SubmissionDetails,
} from "../types/domain";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
  timeout: 60000,
});

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.error?.message) {
      return body.error.message;
    }
    if (error.code === "ERR_NETWORK") {
      return "Unable to reach the API. Check that the backend is running.";
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

export const apiClient = {
  async getStats(): Promise<DashboardStats> {
    const { data } = await api.get<{ stats: DashboardStats }>("/stats");
    return data.stats;
  },

  async getProblems(): Promise<Problem[]> {
    const { data } = await api.get<{ problems: Problem[] }>("/problems");
    return data.problems;
  },

  async getProblem(id: string): Promise<Problem> {
    const { data } = await api.get<{ problem: Problem }>(`/problems/${id}`);
    return data.problem;
  },

  async createSubmission(problemId: string, solution: Solution) {
    const { data } = await api.post<{ submission: Submission; feedback: Feedback | null }>(
      "/submissions",
      { problemId, solution },
    );
    return data;
  },

  async getSubmission(id: string): Promise<SubmissionDetails> {
    const { data } = await api.get<SubmissionDetails>(`/submissions/${id}`);
    return data;
  },

  async getHistory(): Promise<HistoryItem[]> {
    const { data } = await api.get<{ submissions: HistoryItem[] }>("/submissions/history");
    return data.submissions;
  },

  async retryEvaluation(id: string) {
    const { data } = await api.post<{ submission: Submission; feedback: Feedback | null }>(
      `/submissions/${id}/evaluate`,
    );
    return data;
  },
};

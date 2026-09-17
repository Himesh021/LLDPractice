export type Difficulty = "Easy" | "Medium" | "Hard";

export type SubmissionStatus = "pending" | "evaluating" | "evaluated" | "failed";

export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  description: string;
  requirements: string[];
  constraints: string[];
  expectedConcepts: string[];
  createdAt: string;
}

export interface Solution {
  classes: string;
  interfaces: string;
  relationships: string;
  responsibilities: string;
  explanation: string;
}

export const emptySolution = (): Solution => ({
  classes: "",
  interfaces: "",
  relationships: "",
  responsibilities: "",
  explanation: "",
});

export interface Submission {
  id: string;
  problemId: string;
  solution: Solution;
  status: SubmissionStatus;
  evaluationError?: string;
  createdAt: string;
}

export interface FeedbackCategories {
  classDesign: number;
  abstraction: number;
  encapsulation: number;
  relationships: number;
  extensibility: number;
  designPatterns: number;
}

export interface Feedback {
  id: string;
  submissionId: string;
  score: number;
  categories: FeedbackCategories;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  improvedDesign: string;
  createdAt: string;
}

export interface DashboardStats {
  problemCount: number;
  problemsAttempted: number;
  problemsSolved: number;
  averageScore: number | null;
}

export interface HistoryItem {
  id: string;
  problemId: string;
  problemTitle: string;
  difficulty: Difficulty;
  status: SubmissionStatus;
  score: number | null;
  attemptNumber: number;
  createdAt: string;
}

export interface SubmissionDetails {
  submission: Submission;
  problem: Problem;
  feedback: Feedback | null;
  attemptNumber: number;
  previousScore: number | null;
  improvement: number | null;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}

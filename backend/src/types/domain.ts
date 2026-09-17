export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  description: string;
  requirements: string[];
  constraints: string[];
  expectedConcepts: string[];
  createdAt: Date;
}

export interface Solution {
  classes: string;
  interfaces: string;
  relationships: string;
  responsibilities: string;
  explanation: string;
}

export type SubmissionStatus = "pending" | "evaluating" | "evaluated" | "failed";

export interface Submission {
  id: string;
  problemId: string;
  solution: Solution;
  status: SubmissionStatus;
  evaluationError?: string;
  createdAt: Date;
}

export interface FeedbackCategories {
  classDesign: number;
  abstraction: number;
  encapsulation: number;
  relationships: number;
  extensibility: number;
  designPatterns: number;
}

export const CATEGORY_MAX: FeedbackCategories = {
  classDesign: 2,
  abstraction: 2,
  encapsulation: 1,
  relationships: 2,
  extensibility: 2,
  designPatterns: 1,
};

export const SCORE_TOTAL = 10;

export interface EvaluationResult {
  score: number;
  categories: FeedbackCategories;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  improvedDesign: string;
}

export interface Feedback extends EvaluationResult {
  id: string;
  submissionId: string;
  createdAt: Date;
}

export interface DashboardStats {
  problemCount: number;
  problemsAttempted: number;
  problemsSolved: number;
  averageScore: number | null;
}

export const SOLVED_SCORE_THRESHOLD = 7;

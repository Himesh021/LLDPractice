import type { Problem } from "../types/domain";

export interface ProblemRepository {
  findAll(): Promise<Problem[]>;
  findById(id: string): Promise<Problem | null>;
  count(): Promise<number>;
  upsertBySlug(problem: Omit<Problem, "id" | "createdAt">): Promise<Problem>;
}

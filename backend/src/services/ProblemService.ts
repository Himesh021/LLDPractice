import type { ProblemRepository } from "../repositories/ProblemRepository";
import type { Problem } from "../types/domain";
import { NotFoundError, ValidationError } from "../utils/errors";
import { isValidObjectId } from "../utils/validation";

export class ProblemService {
  constructor(private readonly problems: ProblemRepository) {}

  list(): Promise<Problem[]> {
    return this.problems.findAll();
  }

  async getById(id: string): Promise<Problem> {
    if (!isValidObjectId(id)) {
      throw new ValidationError("Invalid problem ID.");
    }
    const problem = await this.problems.findById(id);
    if (!problem) {
      throw new NotFoundError("Problem not found.");
    }
    return problem;
  }
}

import type { Request, Response } from "express";
import { ProblemService } from "../services/ProblemService";
import { asyncHandler } from "../middleware/errorHandler";

export class ProblemController {
  constructor(private readonly problems: ProblemService) {}

  list = asyncHandler(async (_req: Request, res: Response) => {
    const items = await this.problems.list();
    res.json({ problems: items });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const problem = await this.problems.getById(req.params.id);
    res.json({ problem });
  });
}

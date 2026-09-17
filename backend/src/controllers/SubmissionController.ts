import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { SubmissionService } from "../services/SubmissionService";

export class SubmissionController {
  constructor(private readonly submissions: SubmissionService) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const { problemId, solution } = req.body ?? {};
    const result = await this.submissions.create(problemId, solution);
    res.status(201).json(result);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.submissions.getById(req.params.id);
    res.json(result);
  });

  history = asyncHandler(async (_req: Request, res: Response) => {
    const items = await this.submissions.history();
    res.json({ submissions: items });
  });

  evaluate = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.submissions.retryEvaluation(req.params.id);
    res.json(result);
  });
}

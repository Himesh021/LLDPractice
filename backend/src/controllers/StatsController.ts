import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { StatsService } from "../services/StatsService";

export class StatsController {
  constructor(private readonly stats: StatsService) {}

  dashboard = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await this.stats.getDashboard();
    res.json({ stats });
  });
}

import cors from "cors";
import express from "express";
import type { AppConfig } from "./config/env";
import { ProblemController } from "./controllers/ProblemController";
import { StatsController } from "./controllers/StatsController";
import { SubmissionController } from "./controllers/SubmissionController";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import type { FeedbackProvider } from "./providers/FeedbackProvider";
import { createFeedbackProvider } from "./providers/createFeedbackProvider";
import { MongoFeedbackRepository } from "./repositories/mongo/MongoFeedbackRepository";
import { MongoProblemRepository } from "./repositories/mongo/MongoProblemRepository";
import { MongoSubmissionRepository } from "./repositories/mongo/MongoSubmissionRepository";
import { problemRoutes } from "./routes/problemRoutes";
import { statsRoutes } from "./routes/statsRoutes";
import { submissionRoutes } from "./routes/submissionRoutes";
import { ProblemService } from "./services/ProblemService";
import { StatsService } from "./services/StatsService";
import { SubmissionService } from "./services/SubmissionService";

export interface AppDependencies {
  config: AppConfig;
  feedbackProvider?: FeedbackProvider;
}

export function createApp(deps: AppDependencies) {
  const problems = new MongoProblemRepository();
  const submissions = new MongoSubmissionRepository();
  const feedbacks = new MongoFeedbackRepository();
  const evaluator = deps.feedbackProvider ?? createFeedbackProvider(deps.config);

  const problemService = new ProblemService(problems);
  const submissionService = new SubmissionService(submissions, feedbacks, problems, evaluator);
  const statsService = new StatsService(problems, submissions, feedbacks);

  const app = express();
  app.use(cors({ origin: deps.config.corsOrigin }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/problems", problemRoutes(new ProblemController(problemService)));
  app.use("/api/submissions", submissionRoutes(new SubmissionController(submissionService)));
  app.use("/api/stats", statsRoutes(new StatsController(statsService)));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

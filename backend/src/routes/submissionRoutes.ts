import { Router } from "express";
import { SubmissionController } from "../controllers/SubmissionController";

export function submissionRoutes(controller: SubmissionController): Router {
  const router = Router();
  router.get("/history", controller.history);
  router.post("/", controller.create);
  router.get("/:id", controller.getById);
  router.post("/:id/evaluate", controller.evaluate);
  return router;
}

import { Router } from "express";
import { StatsController } from "../controllers/StatsController";

export function statsRoutes(controller: StatsController): Router {
  const router = Router();
  router.get("/", controller.dashboard);
  return router;
}

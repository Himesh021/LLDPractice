import { Router } from "express";
import { ProblemController } from "../controllers/ProblemController";

export function problemRoutes(controller: ProblemController): Router {
  const router = Router();
  router.get("/", controller.list);
  router.get("/:id", controller.getById);
  return router;
}

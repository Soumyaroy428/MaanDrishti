import { Router } from "express";
import { runAeveAnalysis } from "../controllers/functionController";

const functionRouter = Router();
functionRouter.post("/runAeveAnalysis", runAeveAnalysis);

export { functionRouter };

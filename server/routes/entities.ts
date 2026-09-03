import { Router } from "express";
import * as entityController from "../controllers/entityController";

const entityRouter = Router();

entityRouter.get("/:entity", entityController.list);
entityRouter.get("/:entity/:id", entityController.get);
entityRouter.post("/:entity", entityController.create);
entityRouter.patch("/:entity/:id", entityController.update);
entityRouter.put("/:entity/:id", entityController.update);

export { entityRouter };

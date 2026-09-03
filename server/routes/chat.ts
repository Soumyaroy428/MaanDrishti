import { Router } from "express";
import * as chatController from "../controllers/chatController";

const chatRouter = Router();
chatRouter.post("/conversations", chatController.createConversation);
chatRouter.post("/messages", chatController.addMessage);

export { chatRouter };

import { Request, Response } from "express";
import { createEntity } from "../store/memoryStore";

export const createConversation = (request: Request, response: Response) => {
  response.status(201).json(
    createEntity("conversations", {
      ...request.body,
      created_at: new Date().toISOString(),
    }),
  );
};

export const addMessage = (request: Request, response: Response) => {
  response.status(201).json(
    createEntity("messages", {
      ...request.body,
      created_at: new Date().toISOString(),
    }),
  );
};

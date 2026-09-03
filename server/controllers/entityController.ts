import { Request, Response } from "express";
import {
  createEntity,
  filterEntities,
  getEntity,
  listEntities,
  updateEntity,
} from "../store/memoryStore";

const entityName = (request: Request) => {
  const { entity } = request.params;
  if (typeof entity !== "string") throw new Error("Invalid entity name");
  return entity;
};

export const list = (request: Request, response: Response) => {
  const { sort, limit, ...filters } = request.query;
  const values =
    Object.keys(filters).length > 0
      ? filterEntities(entityName(request), filters as Record<string, unknown>)
      : listEntities(
          entityName(request),
          typeof sort === "string" ? sort : undefined,
          typeof limit === "string" ? Number(limit) : 100,
        );
  response.json(values);
};

export const get = (request: Request, response: Response) => {
  const item = getEntity(entityName(request), request.params.id as string);
  if (!item) {
    response.status(404).json({ message: "Entity not found" });
    return;
  }
  response.json(item);
};

export const create = (request: Request, response: Response) => {
  response.status(201).json(createEntity(entityName(request), request.body));
};

export const update = (request: Request, response: Response) => {
  const item = updateEntity(
    entityName(request),
    request.params.id as string,
    request.body,
  );
  if (!item) {
    response.status(404).json({ message: "Entity not found" });
    return;
  }
  response.json(item);
};

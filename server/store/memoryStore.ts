import { randomUUID } from "node:crypto";

export type Entity = Record<string, unknown> & { id: string };

const collections = new Map<string, Entity[]>();

const collection = (name: string) => {
  const existing = collections.get(name);
  if (existing) return existing;
  const created: Entity[] = [];
  collections.set(name, created);
  return created;
};

export const listEntities = (name: string, sort?: string, limit = 100) => {
  const values = [...collection(name)];
  const field = sort?.replace(/^-/, "");
  if (field) {
    const direction = sort?.startsWith("-") ? -1 : 1;
    values.sort((a, b) =>
      String(a[field] ?? "").localeCompare(String(b[field] ?? "")) * direction,
    );
  }
  return values.slice(0, Math.max(1, Math.min(limit, 500)));
};

export const filterEntities = (name: string, filters: Record<string, unknown>) =>
  listEntities(name).filter((item) =>
    Object.entries(filters).every(([key, value]) => item[key] === value),
  );

export const getEntity = (name: string, id: string) =>
  collection(name).find((item) => item.id === id);

export const createEntity = (name: string, data: Record<string, unknown>) => {
  const item = { ...data, id: randomUUID() } as Entity;
  collection(name).push(item);
  return item;
};

export const updateEntity = (
  name: string,
  id: string,
  data: Record<string, unknown>,
) => {
  const items = collection(name);
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return undefined;
  items[index] = { ...items[index], ...data, id };
  return items[index];
};

import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

type User = {
  id: string;
  email: string;
  passwordHash: string;
  app_role?: string;
};

const users = new Map<string, User>();
const tokens = new Map<string, string>();

const hashPassword = (password: string, salt = randomBytes(16).toString("hex")) =>
  `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;

const validPassword = (password: string, encoded: string) => {
  const [salt, expected] = encoded.split(":");
  if (!salt || !expected) return false;
  const actual = scryptSync(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(expected, "hex"));
};

export const registerUser = (email: string, password: string) => {
  if (users.has(email)) return undefined;
  const user = { id: randomUUID(), email, passwordHash: hashPassword(password) };
  users.set(email, user);
  return user;
};

export const authenticate = (email: string, password: string) => {
  const user = users.get(email);
  return user && validPassword(password, user.passwordHash) ? user : undefined;
};

export const issueToken = (userId: string) => {
  const token = randomBytes(32).toString("hex");
  tokens.set(token, userId);
  return token;
};

export const userForToken = (token: string | undefined) => {
  if (!token) return undefined;
  const userId = tokens.get(token);
  return [...users.values()].find((user) => user.id === userId);
};

export const updateUser = (user: User, data: Partial<User>) => {
  const updated = { ...user, ...data };
  users.set(updated.email, updated);
  return updated;
};

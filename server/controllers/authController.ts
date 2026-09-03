import { Request, Response } from "express";
import {
  authenticate,
  issueToken,
  registerUser,
  updateUser,
  userForToken,
} from "../store/authStore";

const bearer = (request: Request) =>
  request.header("authorization")?.replace(/^Bearer\s+/i, "");

export const me = (request: Request, response: Response) => {
  const user = userForToken(bearer(request));
  if (!user) {
    response.status(401).json({ message: "Authentication required" });
    return;
  }
  const { passwordHash: _passwordHash, ...safeUser } = user;
  response.json(safeUser);
};

export const register = (request: Request, response: Response) => {
  const { email, password } = request.body as { email?: string; password?: string };
  if (!email || !password || password.length < 8) {
    response.status(400).json({ message: "Email and password (8+ characters) are required" });
    return;
  }
  const user = registerUser(email, password);
  if (!user) {
    response.status(409).json({ message: "Email is already registered" });
    return;
  }
  response.status(201).json({ message: "Registration successful", userId: user.id });
};

export const login = (request: Request, response: Response) => {
  const { email, password } = request.body as { email?: string; password?: string };
  const user = email && password ? authenticate(email, password) : undefined;
  if (!user) {
    response.status(401).json({ message: "Invalid email or password" });
    return;
  }
  response.json({ access_token: issueToken(user.id) });
};

export const updateMe = (request: Request, response: Response) => {
  const user = userForToken(bearer(request));
  if (!user) {
    response.status(401).json({ message: "Authentication required" });
    return;
  }
  const updated = updateUser(user, request.body);
  const { passwordHash: _passwordHash, ...safeUser } = updated;
  response.json(safeUser);
};

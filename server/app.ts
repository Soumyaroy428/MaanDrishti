import cors from "cors";
import express from "express";
import { authRouter } from "./routes/auth";
import { entityRouter } from "./routes/entities";
import { functionRouter } from "./routes/functions";
import { chatRouter } from "./routes/chat";

const server = express();

server.use(cors({ origin: process.env.CLIENT_URL?.split(",") ?? true }));
server.use(express.json());

server.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

server.get("/api/message", (_request, response) => {
  response.json({ message: "Hello from the Express backend." });
});

server.get("/api/app/public-settings", (_request, response) => {
  response.json({});
});

server.use("/api/auth", authRouter);
server.use("/api/entities", entityRouter);
server.use("/api/functions", functionRouter);
server.use("/api/chat", chatRouter);

export { server };

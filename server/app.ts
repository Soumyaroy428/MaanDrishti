import cors from "cors";
import express from "express";
import { authRouter } from "./routes/auth";
import { entityRouter } from "./routes/entities";
import { functionRouter } from "./routes/functions";
import { chatRouter } from "./routes/chat";

const server = express();

const allowedOrigins = process.env.CLIENT_URL?.split(",") ?? [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3003",
];

server.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
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

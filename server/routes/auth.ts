import { Router } from "express";
import * as authController from "../controllers/authController";

const authRouter = Router();
authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.get("/me", authController.me);
authRouter.patch("/me", authController.updateMe);
authRouter.put("/me", authController.updateMe);
authRouter.post("/logout", (_request, response) => response.status(204).end());
authRouter.post("/verify-otp", (_request, response) => response.json({ access_token: "" }));
authRouter.post("/resend-otp", (_request, response) => response.json({ message: "OTP sent" }));
authRouter.post("/forgot-password", (_request, response) => response.json({ message: "If the account exists, reset instructions were sent" }));
authRouter.post("/reset-password", (_request, response) => response.json({ message: "Password reset successful" }));

export { authRouter };

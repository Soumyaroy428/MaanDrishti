import { Request, Response } from "express";
import { User } from "../models/User";
import { generateToken, AuthRequest } from "../middleware/auth";
import bcrypt from "bcryptjs";

export const me = async (request: AuthRequest, response: Response) => {
  try {
    if (!request.user) {
      response.status(401).json({ message: "Authentication required" });
      return;
    }

    const { password: _password, ...safeUser } = request.user.toObject();
    response.json(safeUser);
  } catch (error) {
    response.status(500).json({ message: "Server error" });
  }
};

export const register = async (request: Request, response: Response) => {
  try {
    const { email, password, name } = request.body as {
      email?: string;
      password?: string;
      name?: string;
    };

    console.log("Registration request:", { email, password: password ? "***" : undefined, name });

    if (!email || !password || password.length < 8) {
      response.status(400).json({
        message: "Email and password (8+ characters) are required",
      });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      response.status(409).json({ message: "Email is already registered" });
      return;
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ email, password: hashedPassword, name });
    await user.save();

    const token = generateToken(user._id.toString());

    response.status(201).json({
      message: "Registration successful",
      access_token: token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    response.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : String(error) });
  }
};

export const login = async (request: Request, response: Response) => {
  try {
    const { email, password } = request.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      response.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      response.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      response.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = generateToken(user._id.toString());

    response.json({
      access_token: token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    response.status(500).json({ message: "Server error" });
  }
};

export const updateMe = async (request: AuthRequest, response: Response) => {
  try {
    if (!request.user) {
      response.status(401).json({ message: "Authentication required" });
      return;
    }

    const { name, email } = request.body as {
      name?: string;
      email?: string;
    };

    if (email && email !== request.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        response.status(409).json({ message: "Email is already registered" });
        return;
      }
    }

    if (name) request.user.name = name;
    if (email) request.user.email = email;

    await request.user.save();

    const { password: _password, ...safeUser } = request.user.toObject();
    response.json(safeUser);
  } catch (error) {
    response.status(500).json({ message: "Server error" });
  }
};

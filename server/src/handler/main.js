import express from "express";
import helmet from "helmet";
import xss from "xss-clean";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import authRoutes from "../routes/authRoutes.js";
import uploadRoutes from "../routes/uploadRoutes.js";
import groupRoutes from "../routes/groupRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import messageRoutes from "../routes/messageRoutes.js";
import { chatSocket } from "../socket/chat.js";
import { videoSocket } from "../socket/video.js";
import { JWT_SECRET } from "../config/auth.js";
import { socketServer } from "../socket/socketServer.js";

dotenv.config();

const mainHandler = async () => {
  const app = express();

  app.use(helmet());
  app.use(xss());
  app.use(express.json());

  // ✅ FIXED CORS
  app.use(
    cors({
      origin: "*", // frontend URL
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // ✅ REQUIRED FOR PREFLIGHT
  app.options("*", cors());

  app.use("/uploads", express.static("uploads"));

  // ROUTES
  app.use("/auth", authRoutes);
  app.use("/file", uploadRoutes);
  app.use("/group", groupRoutes);
  app.use("/users", userRoutes);
  app.use("/message", messageRoutes);

  // SOCKET SETUP
  socketServer(app);
};

export default mainHandler;

import express from "express";
import helmet from "helmet";
import xss from "xss-clean";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import http from "http";

import authRoutes from "../routes/authRoutes.js";
import uploadRoutes from "../routes/uploadRoutes.js";
import groupRoutes from "../routes/groupRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import messageRoutes from "../routes/messageRoutes.js";
import { socketServer } from "../socket/socketServer.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mainHandler = async () => {
  const app = express();
  const PORT = process.env.PORT || 8080;

  // 🔐 Security
  app.use(helmet());
  app.use(xss());
  app.use(express.json());

  // 🌐 CORS (Azure-safe)
  app.use(
    cors({
      origin: true, // SAME ORIGIN in production
      credentials: true,
    })
  );

  app.options("*", cors());

  // 📂 Static uploads
  app.use("/uploads", express.static("uploads"));

  // 🔗 API routes
  app.use("/auth", authRoutes);
  app.use("/file", uploadRoutes);
  app.use("/group", groupRoutes);
  app.use("/users", userRoutes);
  app.use("/message", messageRoutes);

  // 🌍 Serve React (Vite build)
  const clientDistPath = path.join(__dirname, "../../client/dist");

  app.use(express.static(clientDistPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });

  const server = http.createServer(app);
  // 🔌 Socket + HTTP server
  socketServer(server);

  server.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
};

export default mainHandler;

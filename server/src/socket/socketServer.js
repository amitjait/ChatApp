import { JWT_SECRET } from "../config/auth.js";
import { chatSocket } from "./chat.js";
import { videoSocket } from "./video.js";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UserModel } from "../models/userModel.js";
import { groupVideoSocket } from "./groupVideo.js";

export const socketServer = (server) => {
  // const io = new Server(server, {
  //   cors: {
  //     origin: "*",
  //     methods: ["GET", "POST"],
  //     credentials: true,
  //   },
  //   transports: ["websocket", "polling"],
  // });

  const io = new Server(server, {
    cors: {
      origin: true, // ✅ same-origin in production
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  const userSocketMap = {};
  const groupMembersMap = {};

  // SOCKET AUTH
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));

    try {
      socket.user = jwt.verify(token, JWT_SECRET);
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    try {
      const userRes = await UserModel.getUserById(socket.user.id);

      if (userRes?.statusCode !== 200) {
        console.log("❌ USER NOT FOUND");
        return;
      }
      const user = userRes?.data;

      if (!userSocketMap[user.id]) {
        userSocketMap[user.id] = new Set();
      }
      userSocketMap[user.id].add(socket.id);

      const groupIds = user.groups || [];

      groupIds.forEach((groupId) => {
        if (!groupMembersMap[groupId]) groupMembersMap[groupId] = new Set();
        groupMembersMap[groupId].add(user.id);
        socket.join(groupId);
      });

      chatSocket(io, socket, userSocketMap, groupMembersMap);
      videoSocket(io, socket, userSocketMap, groupMembersMap);
      groupVideoSocket(io, socket, userSocketMap, groupMembersMap);

      const onlineUsers = Object.keys(userSocketMap);

      socket.emit("users_online", {
        count: onlineUsers.length,
        users: onlineUsers,
      });

      // notify others
      //   socket.broadcast.emit("user_online", {
      //     userId: user.id,
      //   });

      socket.on("disconnect", () => {
        const sockets = userSocketMap[user.id];
        if (!sockets) return;

        sockets.delete(socket.id);

        // user is fully offline only if no sockets left
        if (sockets?.size === 0) {
          delete userSocketMap[user.id];

          io.emit("user_offline", {
            userId: user.id,
          });
        }

        console.log(`${user.name} disconnected`);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

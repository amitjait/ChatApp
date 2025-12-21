import bcrypt from "bcryptjs";
import { readDB, writeDB } from "../database/db.js";

const db = readDB();

export class MessageModel {
  static async savePrivateMessage(body) {
    try {
      const { receiverId, content, fileUrl, fileName, user, blobName } = body;
      console.log({ blobName });
      const message = {
        id: `msg-${Date.now()}`,
        senderId: user.id,
        senderName: user.name,
        receiverId,
        content: content || "",
        fileUrl,
        fileName,
        timestamp: Date.now(),
        blobName,
      };

      db.messages.push(message);
      writeDB(db);

      return {
        statusCode: 201,
        message: "Message saved successfully",
        data: message,
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        message: error.message,
      };
    }
  }

  /* ---------------- SAVE GROUP MESSAGE ---------------- */
  static async saveGroupMessage(body) {
    try {
      const { groupId, content, fileUrl, fileName, user } = body;

      if (!groupId) {
        return {
          statusCode: 400,
          message: "groupId is required",
        };
      }

      const message = {
        id: `msg-${Date.now()}`,
        senderId: user.id,
        senderName: user.name,
        groupId,
        content: content || "",
        fileUrl,
        fileName,
        timestamp: Date.now(),
      };

      db.messages.push(message);
      writeDB(db);

      return {
        statusCode: 201,
        data: message,
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        message: error.message,
      };
    }
  }

  static async getPrivateMessages({ user, receiverId }) {
    try {
      const chatMessages = db.messages.filter(
        (msg) =>
          (msg.senderId === user.id && msg.receiverId === receiverId) ||
          (msg.senderId === receiverId && msg.receiverId === user.id)
      );

      return {
        statusCode: 200,
        data: chatMessages,
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        message: error?.message,
      };
    }
  }

  static async getGroupMessages(groupId) {
    try {
      const groupMessages = db.messages.filter(
        (msg) => msg.groupId === groupId
      );

      return {
        statusCode: 200,
        data: groupMessages,
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        message: error.message,
      };
    }
  }

  static async getAllMyMessages(user) {
    try {
      const myMessages = db.messages.filter(
        (msg) => msg.senderId === user.id || msg.receiverId === user.id
      );

      return myMessages;
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        message: error.message,
      };
    }
  }
}

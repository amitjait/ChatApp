import { getPool } from "../config/azureDb.js";

export class MessageModel {
  /* ================= PRIVATE MESSAGE ================= */
  static async savePrivateMessage(body) {
    try {
      const {
        receiverId,
        content = null,
        fileUrl = null,
        fileName = null,
        blobName = null,
        user,
      } = body;

      const pool = await getPool();

      const result = await pool
        .request()
        .input("senderId", user.id)
        .input("senderName", user.name)
        .input("receiverId", receiverId)
        .input("content", content)
        .input("fileUrl", fileUrl)
        .input("fileName", fileName)
        .input("blobName", blobName)
        .input("timestamp", Date.now()).query(`
          INSERT INTO messages (
            senderId, senderName, receiverId,
            content, fileUrl, fileName, blobName, timestamp
          )
          OUTPUT INSERTED.*
          VALUES (
            @senderId, @senderName, @receiverId,
            @content, @fileUrl, @fileName, @blobName, @timestamp
          )
        `);

      return {
        statusCode: 201,
        message: "Message saved successfully",
        data: result.recordset[0],
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        message: error.message,
      };
    }
  }

  /* ================= GROUP MESSAGE ================= */
  static async saveGroupMessage(body) {
    try {
      const {
        groupId,
        content = null,
        fileUrl = null,
        fileName = null,
        blobName = null,
        user,
      } = body;

      if (!groupId) {
        return {
          statusCode: 400,
          message: "groupId is required",
        };
      }

      const pool = await getPool();

      const result = await pool
        .request()
        .input("senderId", user.id)
        .input("senderName", user.name)
        .input("groupId", groupId)
        .input("content", content)
        .input("fileUrl", fileUrl)
        .input("fileName", fileName)
        .input("blobName", blobName)
        .input("timestamp", Date.now()).query(`
          INSERT INTO messages (
            senderId, senderName, groupId,
            content, fileUrl, fileName, blobName, timestamp
          )
          OUTPUT INSERTED.*
          VALUES (
            @senderId, @senderName, @groupId,
            @content, @fileUrl, @fileName, @blobName, @timestamp
          )
        `);

      return {
        statusCode: 201,
        data: result.recordset[0],
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        message: error.message,
      };
    }
  }

  /* ================= GET PRIVATE MESSAGES ================= */
  static async getPrivateMessages({ user, receiverId }) {
    try {
      const pool = await getPool();

      const result = await pool
        .request()
        .input("userId", user.id)
        .input("receiverId", receiverId).query(`
          SELECT *
          FROM messages
          WHERE
            (senderId = @userId AND receiverId = @receiverId)
            OR
            (senderId = @receiverId AND receiverId = @userId)
          ORDER BY timestamp ASC
        `);

      return {
        statusCode: 200,
        data: result.recordset,
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        message: error.message,
      };
    }
  }

  /* ================= GET GROUP MESSAGES ================= */
  static async getGroupMessages(groupId) {
    try {
      const pool = await getPool();

      const result = await pool.request().input("groupId", groupId).query(`
          SELECT *
          FROM messages
          WHERE groupId = @groupId
          ORDER BY timestamp ASC
        `);

      return {
        statusCode: 200,
        data: result.recordset,
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        message: error.message,
      };
    }
  }

  /* ================= GET ALL MY MESSAGES ================= */
  static async getAllMyMessages(user) {
    try {
      const pool = await getPool();

      const result = await pool.request().input("userId", user.id).query(`
          SELECT *
          FROM messages
          WHERE senderId = @userId OR receiverId = @userId
          ORDER BY timestamp DESC
        `);

      return {
        statusCode: 200,
        data: result.recordset,
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        message: error.message,
      };
    }
  }
}

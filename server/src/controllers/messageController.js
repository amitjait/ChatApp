import { MessageModel } from "../models/messageModel.js";

export class MessageController {
  async savePrivateMessage(req, res) {
    try {
      const user = req.user;
      const { receiverId, content, fileUrl, fileName, blobName } = req.body;

      if (!receiverId) {
        throw new Error("receiverId is required");
      }
      const messageRes = await MessageModel.savePrivateMessage({
        receiverId,
        content,
        fileUrl,
        fileName,
        user,
        blobName,
      });

      return res.send({
        statusCode: 201,
        message: "Message saved successfully",
        data: messageRes?.data,
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }

  async saveGroupMessage(req, res) {
    try {
      const user = req.user;
      const { groupId, content, fileUrl, fileName } = req.body;

      if (!groupId) {
        throw new Error("groupId is required");
      }

      const messageRes = await MessageModel.saveGroupMessage({
        groupId,
        content,
        fileUrl,
        fileName,
        user,
      });

      return res.send({
        statusCode: 201,
        message: "Message saved successfully",
        data: messageRes?.data,
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  }

  async getPrivateMessages(req, res) {
    try {
      const user = req.user;
      const { userId } = req.params;

      const chatMessages = await MessageModel.getPrivateMessages({
        user,
        receiverId: userId,
      });

      return res.send({
        statusCode: 200,
        message: "Messages fetched successfully",
        data: chatMessages?.data,
      });
    } catch (error) {
      console.error(error);
      res.status(404).json({ message: error.message });
    }
  }
  async getGroupMessages(req, res) {
    try {
      const { groupId } = req.params;

      const groupMessages = await MessageModel.getGroupMessages(groupId);

      return res.send({
        statusCode: 200,
        message: "Messages fetched successfully",
        data: groupMessages?.data,
      });
    } catch (error) {
      console.error(error);
      res.status(404).json({ message: error.message });
    }
  }
}

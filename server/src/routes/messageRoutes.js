import express from "express";
import { authMiddleware } from "../config/auth.js";
import { MessageController } from "../controllers/messageController.js";

const router = express.Router();

const messageController = new MessageController();

router.post("/private", authMiddleware, messageController.savePrivateMessage);
router.post("/group", authMiddleware, messageController.saveGroupMessage);

router.get(
  "/private/:userId",
  authMiddleware,
  messageController.getPrivateMessages
);
router.get(
  "/group/:groupId",
  authMiddleware,
  messageController.getGroupMessages
);
// router.get("/me", authMiddleware, messageController.getAllMyMessages);

export default router;

import express from "express";
import { authMiddleware } from "../config/auth.js";
import { GroupController } from "../controllers/groupController.js";

const router = express.Router();
const groupController = new GroupController();

router.post("/create", authMiddleware, groupController.createGroup);
router.get("/", authMiddleware, groupController.getGroups);
router.get(
  "/getMembers/:groupId",
  authMiddleware,
  groupController.getMembersByGroupId
);

export default router;

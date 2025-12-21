import express from "express";
import { authMiddleware } from "../config/auth.js";
import { UserController } from "../controllers/userController.js";

const router = express.Router();

const userController = new UserController();

// router.get("/me", authMiddleware, getMe);
router.get("/", authMiddleware, userController.getUsers);
router.get("/:id", authMiddleware, userController.getUserById);
router.put("/me", authMiddleware, userController.updateUser);

export default router;

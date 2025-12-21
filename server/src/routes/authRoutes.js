import express from "express";
import { AuthController } from "../controllers/authController.js";

const router = express.Router();

const authController = new AuthController();

router.post("/register", authController.signup);
router.post("/login", authController.login);

export default router;

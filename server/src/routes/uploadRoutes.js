import express from "express";
import multer from "multer";
import { authMiddleware } from "../config/auth.js";
import { UploadController } from "../controllers/uploadController.js";

const uploadController = new UploadController();

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  uploadController.uploadFile
);
router.post("/generateSasUrl", uploadController.generateSasUrl);

export default router;

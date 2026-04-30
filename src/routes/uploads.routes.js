import express from "express";
import multer from "multer";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { uploadImage } from "../services/s3.service.js";

const router = express.Router();

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, and WEBP images are accepted for oral images."));
    }
  },
});

const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, or PDF files are accepted for documents."));
    }
  },
});

router.post(
  "/",
  requireAuth(),
  requireRole("PATIENT", "DOCTOR", "ADMIN"),
  imageUpload.single("image"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Missing file field: image" });
      }

      const result = await uploadImage({
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
        originalName: req.file.originalname,
      });

      return res.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  },
);

router.post(
  "/document",
  requireAuth(),
  requireRole("PATIENT", "DOCTOR", "ADMIN"),
  documentUpload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Missing file field: file" });
      }

      const result = await uploadImage({
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
        originalName: req.file.originalname,
      });

      return res.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  },
);

export default router;

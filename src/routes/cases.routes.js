import express from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { HttpError } from "../utils/httpError.js";

const router = express.Router();

const createCaseSchema = z.object({
  urgency: z.enum(["low", "moderate", "high"]).default("low"),
  imageUploads: z.array(
    z.object({
      objectKey: z.string().min(3),
      fileUrl: z.string().url(),
    }),
  ).min(1),
});

const reviewSchema = z.object({
  doctorNotes: z.string().min(2),
  finalOpinion: z.string().min(2),
  recommendations: z.string().min(2),
  status: z.enum(["IN_REVIEW", "REVIEWED"]).default("REVIEWED"),
});

router.post("/", requireAuth(), requireRole("PATIENT", "ADMIN"), async (req, res, next) => {
  try {
    const input = createCaseSchema.parse(req.body);
    const newCase = await prisma.case.create({
      data: {
        patientId: req.user.id,
        urgency: input.urgency,
        images: {
          create: input.imageUploads,
        },
      },
      include: { images: true },
    });

    return res.status(201).json(newCase);
  } catch (error) {
    return next(error);
  }
});

router.get("/me", requireAuth(), async (req, res, next) => {
  try {
    let where = {};
    if (req.user.role === "PATIENT") where = { patientId: req.user.id };
    if (req.user.role === "DOCTOR") where = { OR: [{ doctorId: req.user.id }, { doctorId: null }] };

    const cases = await prisma.case.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true, email: true, mobileNumber: true } },
        doctor: { select: { id: true, name: true, email: true, mobileNumber: true } },
        images: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(cases);
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", requireAuth(), async (req, res, next) => {
  try {
    const item = await prisma.case.findUnique({
      where: { id: req.params.id },
      include: {
        patient: { select: { id: true, name: true, email: true, mobileNumber: true } },
        doctor: { select: { id: true, name: true, email: true, mobileNumber: true } },
        images: true,
      },
    });

    if (!item) throw new HttpError(404, "Case not found");

    if (req.user.role === "PATIENT" && item.patientId !== req.user.id) {
      throw new HttpError(403, "Forbidden");
    }
    if (req.user.role === "DOCTOR" && item.doctorId && item.doctorId !== req.user.id) {
      throw new HttpError(403, "Forbidden");
    }

    return res.json(item);
  } catch (error) {
    return next(error);
  }
});

router.patch("/:id/review", requireAuth(), requireRole("DOCTOR", "ADMIN"), async (req, res, next) => {
  try {
    const input = reviewSchema.parse(req.body);
    const existing = await prisma.case.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new HttpError(404, "Case not found");

    const updated = await prisma.case.update({
      where: { id: req.params.id },
      data: {
        doctorId: req.user.id,
        doctorNotes: input.doctorNotes,
        finalOpinion: input.finalOpinion,
        recommendations: input.recommendations,
        status: input.status,
      },
    });

    return res.json(updated);
  } catch (error) {
    return next(error);
  }
});

export default router;

import express from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { classifyImage } from "../services/ai.service.js";
import { HttpError } from "../utils/httpError.js";

const router = express.Router();

const classifySchema = z.object({
  caseId: z.string().uuid(),
  imageUrl: z.string().url(),
});

router.post("/classify", requireAuth(), requireRole("PATIENT", "DOCTOR", "ADMIN"), async (req, res, next) => {
  try {
    const input = classifySchema.parse(req.body);

    const existingCase = await prisma.case.findUnique({ where: { id: input.caseId } });
    if (!existingCase) throw new HttpError(404, "Case not found");

    const isPatient = req.user.role === "PATIENT";
    const isOwner = existingCase.patientId === req.user.id;
    if (isPatient && !isOwner) {
      throw new HttpError(403, "Forbidden for this case");
    }

    const aiResult = await classifyImage(input);

    const updated = await prisma.case.update({
      where: { id: input.caseId },
      data: {
        urgency: aiResult.urgency,
        aiRiskScore: aiResult.riskScore,
        aiSummary: aiResult,
      },
    });

    return res.json({ case: updated, aiResult });
  } catch (error) {
    return next(error);
  }
});

export default router;

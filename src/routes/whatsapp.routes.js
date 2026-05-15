import express from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { sendWhatsAppMessage } from "../services/whatsapp.service.js";
import { HttpError } from "../utils/httpError.js";

const router = express.Router();

const sendSchema = z.object({
  caseId: z.string().uuid(),
  toPhone: z.string().min(8),
  messageBody: z.string().min(2),
});

router.post("/send", requireAuth(), requireRole("DOCTOR", "ADMIN"), async (req, res, next) => {
  try {
    const input = sendSchema.parse(req.body);

    const existingCase = await prisma.case.findUnique({ where: { id: input.caseId } });
    if (!existingCase) throw new HttpError(404, "Case not found");

    if (req.user.role === "DOCTOR" && existingCase.doctorId && existingCase.doctorId !== req.user.id) {
      throw new HttpError(403, "Forbidden for this case");
    }

    const providerResult = await sendWhatsAppMessage({
      toPhone: input.toPhone,
      body: input.messageBody,
    });

    const stored = await prisma.whatsAppMessage.create({
      data: {
        caseId: input.caseId,
        senderId: req.user.id,
        toPhone: input.toPhone,
        messageBody: input.messageBody,
        providerId: providerResult.id,
      },
    });

    return res.status(201).json({
      message: stored,
      provider: providerResult,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;

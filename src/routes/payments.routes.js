import crypto from "crypto";
import express from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { env } from "../config/env.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { createOrder } from "../services/razorpay.service.js";

const router = express.Router();

const createOrderSchema = z.object({
  caseId: z.string().uuid(),
  amountPaise: z.number().int().positive(),
});

router.post("/order", requireAuth(), requireRole("PATIENT", "ADMIN"), async (req, res, next) => {
  try {
    const input = createOrderSchema.parse(req.body);

    const createdOrder = await createOrder({
      amountPaise: input.amountPaise,
      receipt: `case_${input.caseId}_${Date.now()}`,
    });

    const payment = await prisma.payment.create({
      data: {
        caseId: input.caseId,
        amountPaise: input.amountPaise,
        razorpayOrderId: createdOrder.id,
      },
    });

    return res.status(201).json({
      payment,
      order: createdOrder,
      keyId: env.razorpay.keyId || "mock_key",
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res, next) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const bodyRaw = req.body;

    if (env.razorpay.webhookSecret) {
      const expected = crypto
        .createHmac("sha256", env.razorpay.webhookSecret)
        .update(bodyRaw)
        .digest("hex");

      if (signature !== expected) {
        return res.status(400).json({ message: "Invalid webhook signature" });
      }
    }

    const body = JSON.parse(bodyRaw.toString("utf8"));
    const paymentEntity = body.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;

    if (orderId) {
      await prisma.payment.updateMany({
        where: { razorpayOrderId: orderId },
        data: {
          status: paymentEntity.status === "captured" ? "PAID" : "FAILED",
          razorpayPaymentId: paymentEntity.id || null,
        },
      });
    }

    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

export default router;

import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { env } from "../config/env.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { HttpError } from "../utils/httpError.js";

function normalizeEmail(value) {
  if (!value) return undefined;
  return value.trim().toLowerCase();
}

function normalizeMobileNumber(value) {
  if (!value) return undefined;
  const digits = value.replace(/\D/g, "");
  return digits || undefined;
}

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  mobileNumber: z.string().min(10).max(15).optional(),
  phone: z.string().min(10).max(20).optional(),
  password: z.string().min(8),
  role: z.enum(["PATIENT", "DOCTOR", "ADMIN"]).default("PATIENT"),
  age: z.number().int().min(1).max(120).optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
  address: z.string().min(5).max(300).optional(),
  hospitalName: z.string().min(2).max(100).optional(),
  hospitalAddress: z.string().min(5).max(300).optional(),
  tobaccoGutkaHistory: z.enum(["NEVER", "FORMER", "OCCASIONAL", "DAILY"]).optional(),
  tobaccoGutkaDetails: z.string().max(250).optional(),
}).superRefine((value, ctx) => {
  const normalizedEmail = normalizeEmail(value.email);
  const normalizedMobile = normalizeMobileNumber(value.mobileNumber);

  if (!normalizedMobile && value.mobileNumber) {
    ctx.addIssue({
      path: ["mobileNumber"],
      code: z.ZodIssueCode.custom,
      message: "Enter a valid mobile number",
    });
  }

  if (value.role === "PATIENT") {
    if (!normalizedEmail && !normalizedMobile) {
      ctx.addIssue({
        path: ["email"],
        code: z.ZodIssueCode.custom,
        message: "Provide email or mobile number",
      });
    }
    if (value.age == null) {
      ctx.addIssue({ path: ["age"], code: z.ZodIssueCode.custom, message: "Age is required" });
    }
    if (!value.gender) {
      ctx.addIssue({ path: ["gender"], code: z.ZodIssueCode.custom, message: "Gender is required" });
    }
    if (!value.address?.trim()) {
      ctx.addIssue({ path: ["address"], code: z.ZodIssueCode.custom, message: "Address is required" });
    }
    if (!value.tobaccoGutkaHistory) {
      ctx.addIssue({
        path: ["tobaccoGutkaHistory"],
        code: z.ZodIssueCode.custom,
        message: "Please select tobacco or gutka history",
      });
    }
  } else if (!normalizedEmail) {
    ctx.addIssue({
      path: ["email"],
      code: z.ZodIssueCode.custom,
      message: "Email is required for doctor/admin accounts",
    });
  }
});

const loginSchema = z.object({
  identifier: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8),
}).superRefine((value, ctx) => {
  if (!value.identifier && !value.email) {
    ctx.addIssue({
      path: ["identifier"],
      code: z.ZodIssueCode.custom,
      message: "Provide mobile number or email",
    });
  }
});

const router = express.Router();

function issueToken(user) {
  return jwt.sign({ role: user.role }, env.jwtSecret, {
    subject: user.id,
    expiresIn: env.jwtExpiresIn,
  });
}

router.post("/register", async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const email = normalizeEmail(input.email);
    const mobileNumber = normalizeMobileNumber(input.mobileNumber);

    const matches = [];
    if (email) matches.push({ email });
    if (mobileNumber) matches.push({ mobileNumber });

    if (matches.length) {
      const existing = await prisma.user.findFirst({ where: { OR: matches } });
      if (existing?.email && existing.email === email) {
        throw new HttpError(409, "Email already registered");
      }
      if (existing?.mobileNumber && existing.mobileNumber === mobileNumber) {
        throw new HttpError(409, "Mobile number already registered");
      }
    }

    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email,
        mobileNumber,
        phone: input.phone?.trim() || null,
        passwordHash,
        role: input.role,
        age: input.age,
        gender: input.gender,
        address: input.address?.trim() || null,
        hospitalName: input.hospitalName?.trim() || null,
        hospitalAddress: input.hospitalAddress?.trim() || null,
        tobaccoGutkaHistory: input.tobaccoGutkaHistory,
        tobaccoGutkaDetails: input.tobaccoGutkaDetails?.trim() || null,
      },
    });

    const token = issueToken(user);
    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        phone: user.phone,
        role: user.role,
        age: user.age,
        gender: user.gender,
        address: user.address,
        hospitalName: user.hospitalName,
        hospitalAddress: user.hospitalAddress,
        tobaccoGutkaHistory: user.tobaccoGutkaHistory,
        tobaccoGutkaDetails: user.tobaccoGutkaDetails,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const identifier = (input.identifier || input.email || "").trim();
    const isEmailLogin = identifier.includes("@");

    const user = await prisma.user.findFirst({
      where: isEmailLogin
        ? { email: normalizeEmail(identifier) }
        : { mobileNumber: normalizeMobileNumber(identifier) },
    });

    if (!user) {
      throw new HttpError(401, "Invalid credentials");
    }

    const isValid = await comparePassword(input.password, user.passwordHash);
    if (!isValid) {
      throw new HttpError(401, "Invalid credentials");
    }

    const token = issueToken(user);
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        phone: user.phone,
        role: user.role,
        age: user.age,
        gender: user.gender,
        address: user.address,
        hospitalName: user.hospitalName,
        hospitalAddress: user.hospitalAddress,
        tobaccoGutkaHistory: user.tobaccoGutkaHistory,
        tobaccoGutkaDetails: user.tobaccoGutkaDetails,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/me", requireAuth(), async (req, res) => {
  return res.json({ user: req.user });
});

export default router;

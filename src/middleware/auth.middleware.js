import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma.js";
import { env } from "../config/env.js";

export function requireAuth() {
  return async (req, res, next) => {
    try {
      const auth = req.headers.authorization || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
      if (!token) {
        return res.status(401).json({ message: "Missing auth token" });
      }

      const payload = jwt.verify(token, env.jwtSecret);
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) {
        return res.status(401).json({ message: "Invalid token user" });
      }

      req.user = {
        id: user.id,
        role: user.role,
        email: user.email,
        mobileNumber: user.mobileNumber,
        name: user.name,
        age: user.age,
        gender: user.gender,
        address: user.address,
        tobaccoGutkaHistory: user.tobaccoGutkaHistory,
        tobaccoGutkaDetails: user.tobaccoGutkaDetails,
      };
      return next();
    } catch (_error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden for this role" });
    }
    return next();
  };
}

import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { env, validateEnv } from "./config/env.js";
import { notFoundMiddleware, errorMiddleware } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import uploadsRoutes from "./routes/uploads.routes.js";
import casesRoutes from "./routes/cases.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";
import whatsappRoutes from "./routes/whatsapp.routes.js";

validateEnv();

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json({ limit: "4mb" }));

if (env.nodeEnv === "development") {
  app.use("/uploads-local", express.static(path.resolve(process.cwd(), "uploads-local")));
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "oralscan-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/cases", casesRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/whatsapp", whatsappRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.listen(env.port, () => {
  console.log(`OralScan backend running on port ${env.port}`);
});

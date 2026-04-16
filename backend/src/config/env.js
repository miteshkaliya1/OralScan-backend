import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 8080),
  nodeEnv: process.env.NODE_ENV || "development",
  apiBaseUrl: process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 8080}`,
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  s3: {
    endpoint: process.env.S3_ENDPOINT || "",
    region: process.env.S3_REGION || "ap-south-1",
    accessKey: process.env.S3_ACCESS_KEY || "",
    secretKey: process.env.S3_SECRET_KEY || "",
    bucket: process.env.S3_BUCKET || "",
    publicBaseUrl: process.env.S3_PUBLIC_BASE_URL || "",
  },

  ai: {
    inferenceUrl: process.env.AI_INFERENCE_URL || "",
    apiKey: process.env.AI_INFERENCE_API_KEY || "",
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  },

  whatsapp: {
    apiUrl: process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v20.0",
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
  },
};

export function validateEnv() {
  const required = ["DATABASE_URL", "JWT_SECRET"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}

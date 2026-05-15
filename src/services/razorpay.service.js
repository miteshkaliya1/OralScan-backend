import Razorpay from "razorpay";
import { env } from "../config/env.js";

function isConfiguredRazorpayValue(value) {
  if (!value) return false;

  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;

  return !normalized.includes("xxxx") && !normalized.includes("your-");
}

const hasValidRazorpayConfig =
  isConfiguredRazorpayValue(env.razorpay.keyId) && isConfiguredRazorpayValue(env.razorpay.keySecret);

function buildMockOrder({ amountPaise, receipt }) {
  return {
    id: `mock_order_${Date.now()}`,
    amount: amountPaise,
    currency: "INR",
    receipt,
    isMock: true,
  };
}

export const razorpayClient = hasValidRazorpayConfig
  ? new Razorpay({
      key_id: env.razorpay.keyId,
      key_secret: env.razorpay.keySecret,
    })
  : null;

export async function createOrder({ amountPaise, receipt }) {
  if (!razorpayClient) {
    return buildMockOrder({ amountPaise, receipt });
  }

  try {
    return await razorpayClient.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt,
    });
  } catch (error) {
    if (env.nodeEnv === "development") {
      console.warn("Razorpay order failed in development. Falling back to mock order.", error);
      return buildMockOrder({ amountPaise, receipt });
    }

    throw error;
  }
}

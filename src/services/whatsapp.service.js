import { env } from "../config/env.js";

function isConfiguredWhatsAppValue(value) {
  if (!value) return false;

  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;

  return !normalized.includes("xxxx") && !normalized.includes("your-");
}

const hasValidWhatsAppConfig =
  isConfiguredWhatsAppValue(env.whatsapp.accessToken) &&
  isConfiguredWhatsAppValue(env.whatsapp.phoneNumberId);

export async function sendWhatsAppMessage({ toPhone, body }) {
  if (!hasValidWhatsAppConfig) {
    return {
      id: `mock_wa_${Date.now()}`,
      toPhone,
      status: "mock_sent",
    };
  }

  const endpoint = `${env.whatsapp.apiUrl}/${env.whatsapp.phoneNumberId}/messages`;
  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.whatsapp.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: toPhone,
        type: "text",
        text: { body },
      }),
    });
  } catch (error) {
    if (env.nodeEnv === "development") {
      console.warn("WhatsApp network error in development. Falling back to mock send.", error);
      return {
        id: `mock_wa_${Date.now()}`,
        toPhone,
        status: "mock_sent",
      };
    }
    throw error;
  }

  const payload = await response.json();
  if (!response.ok) {
    if (env.nodeEnv === "development") {
      console.warn("WhatsApp provider rejected request in development. Falling back to mock send.", payload);
      return {
        id: `mock_wa_${Date.now()}`,
        toPhone,
        status: "mock_sent",
      };
    }

    throw new Error(payload.error?.message || "WhatsApp API request failed");
  }

  return {
    id: payload.messages?.[0]?.id || `wa_${Date.now()}`,
    toPhone,
    status: "sent",
  };
}

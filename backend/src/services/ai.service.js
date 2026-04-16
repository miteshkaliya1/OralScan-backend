import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

function buildMockAiResult({ imageUrl, caseId }) {
  return {
    model: "cnn-oral-lesion-v1",
    urgency: "moderate",
    riskScore: 0.46,
    summary: "Localized mucosal irregularity detected. Clinical confirmation is advised.",
    findings: [
      "Mucosal patch with heterogeneous texture",
      "Localized color contrast variation",
      "Mild lesion boundary asymmetry",
    ],
    redFlags: [
      "Non-uniform lesion pattern",
      "Persistent patch-like appearance",
    ],
    source: "local-dev-fallback",
    caseId,
    imageUrl,
  };
}

export async function classifyImage({ imageUrl, caseId }) {
  if (!env.ai.inferenceUrl) {
    if (env.nodeEnv === "development") {
      return buildMockAiResult({ imageUrl, caseId });
    }

    throw new HttpError(500, "AI_INFERENCE_URL is not configured");
  }

  let response;
  try {
    response = await fetch(env.ai.inferenceUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.ai.apiKey}`,
      },
      body: JSON.stringify({ imageUrl, caseId }),
    });
  } catch (error) {
    if (env.nodeEnv === "development") {
      console.warn("Cloud inference network failure in development. Falling back to local mock AI result.", error);
      return buildMockAiResult({ imageUrl, caseId });
    }

    throw new HttpError(502, "Cloud inference API network failure");
  }

  if (!response.ok) {
    const raw = await response.text();
    if (env.nodeEnv === "development") {
      console.warn("Cloud inference API failed in development. Falling back to local mock AI result.", {
        status: response.status,
        raw,
      });
      return buildMockAiResult({ imageUrl, caseId });
    }

    throw new HttpError(502, "Cloud inference API failed", { status: response.status, raw });
  }

  const result = await response.json();
  return {
    model: result.model || "cnn-oral-lesion-v1",
    urgency: result.urgency || "low",
    riskScore: Number(result.riskScore || 0),
    summary: result.summary || "No summary provided",
    findings: result.findings || [],
    redFlags: result.redFlags || [],
    source: "cloud",
    caseId,
    imageUrl,
  };
}

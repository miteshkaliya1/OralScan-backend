import Anthropic from "@anthropic-ai/sdk";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

const CLAUDE_MODEL = "claude-sonnet-4-5";

const SYSTEM_PROMPT = `You are an expert oral cancer screening assistant. Analyze oral cavity images for clinical findings.

Respond ONLY with a valid JSON object in this exact format:
{
  "urgency": "low" | "moderate" | "high",
  "riskScore": <float 0.0 to 1.0>,
  "summary": "<one or two sentence clinical summary>",
  "findings": ["<finding 1>", "<finding 2>"],
  "redFlags": ["<red flag 1>"] or []
}

Guidelines:
- urgency "high": immediate attention needed (ulceration, erythroplakia, speckled leukoplakia, raised lesion margins)
- urgency "moderate": follow-up within weeks (mild mucosal changes, minor irregular patches)
- urgency "low": routine monitoring, no visible lesions
- riskScore: 0.0–0.3 low, 0.31–0.65 moderate, 0.66–1.0 high
- findings: specific clinical observations (texture, color, location, size estimates)
- redFlags: only list if present (e.g. speckled pattern, indurated border, ulceration)
- Do NOT include personal information or specific treatment plans
- Respond ONLY with the JSON object, no markdown, no explanation`;

async function fetchImageAsBase64(imageUrl) {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = response.headers.get("content-type") || "image/jpeg";
  // Claude only supports image/jpeg, image/png, image/gif, image/webp
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const mediaType = allowedTypes.includes(contentType.split(";")[0].trim())
    ? contentType.split(";")[0].trim()
    : "image/jpeg";
  return { base64: buffer.toString("base64"), mediaType };
}

function buildMockResult({ imageUrl, caseId }) {
  return {
    model: CLAUDE_MODEL,
    urgency: "moderate",
    riskScore: 0.46,
    summary: "Localized mucosal irregularity detected. Clinical confirmation is advised.",
    findings: [
      "Mucosal patch with heterogeneous texture",
      "Localized color contrast variation",
      "Mild lesion boundary asymmetry",
    ],
    redFlags: ["Non-uniform lesion pattern", "Persistent patch-like appearance"],
    source: "dev-fallback",
    caseId,
    imageUrl,
  };
}

export async function classifyImage({ imageUrl, caseId }) {
  const apiKey = env.anthropic.apiKey;

  if (!apiKey) {
    if (env.nodeEnv === "development") {
      console.warn("[ai.service] ANTHROPIC_API_KEY not set – returning mock result.");
      return buildMockResult({ imageUrl, caseId });
    }
    throw new HttpError(500, "ANTHROPIC_API_KEY is not configured");
  }

  // Fetch and encode the image
  let imageData;
  try {
    imageData = await fetchImageAsBase64(imageUrl);
  } catch (err) {
    if (env.nodeEnv === "development") {
      console.warn("[ai.service] Could not fetch image – returning mock result.", err.message);
      return buildMockResult({ imageUrl, caseId });
    }
    throw new HttpError(502, "Failed to retrieve image for analysis");
  }

  // Call Claude Sonnet with vision
  const client = new Anthropic({ apiKey });
  let message;
  try {
    message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: imageData.mediaType,
                data: imageData.base64,
              },
            },
            {
              type: "text",
              text: "Analyze this oral cavity image for signs of abnormality or oral cancer risk. Respond with the JSON object only.",
            },
          ],
        },
      ],
    });
  } catch (err) {
    if (env.nodeEnv === "development") {
      console.warn("[ai.service] Claude API call failed – returning mock result.", err.message);
      return buildMockResult({ imageUrl, caseId });
    }
    throw new HttpError(502, `Claude API error: ${err.message}`);
  }

  // Parse structured JSON from Claude's response
  let parsed;
  try {
    const text = message.content[0].text.trim();
    // Strip markdown code block if Claude wraps it
    const jsonStr = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    parsed = JSON.parse(jsonStr);
  } catch {
    if (env.nodeEnv === "development") {
      console.warn("[ai.service] Failed to parse Claude response – returning mock result.");
      return buildMockResult({ imageUrl, caseId });
    }
    throw new HttpError(502, "Failed to parse Claude analysis response");
  }

  const allowedUrgencies = ["low", "moderate", "high"];
  return {
    model: CLAUDE_MODEL,
    urgency: allowedUrgencies.includes(parsed.urgency) ? parsed.urgency : "moderate",
    riskScore: Math.min(1, Math.max(0, Number(parsed.riskScore) || 0.4)),
    summary: typeof parsed.summary === "string" ? parsed.summary : "No summary provided",
    findings: Array.isArray(parsed.findings) ? parsed.findings : [],
    redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
    source: "claude-sonnet",
    caseId,
    imageUrl,
  };
}

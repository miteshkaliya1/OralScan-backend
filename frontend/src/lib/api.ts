import type { PatientCase, ReviewStatus, Urgency } from "../data/content";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) || "/api";
const TOKEN_KEY = "oralscan_token";

type ApiUser = {
  id: string;
  name: string;
  email: string | null;
  mobileNumber: string | null;
  phone?: string | null;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  age?: number | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY" | null;
  address?: string | null;
  hospitalName?: string | null;
  hospitalAddress?: string | null;
  tobaccoGutkaHistory?: "NEVER" | "FORMER" | "OCCASIONAL" | "DAILY" | null;
  tobaccoGutkaDetails?: string | null;
};

type ApiCase = {
  id: string;
  patientId: string;
  doctorId: string | null;
  status: "PENDING" | "IN_REVIEW" | "REVIEWED";
  urgency: "low" | "moderate" | "high";
  aiSummary: {
    summary?: string;
    findings?: string[];
    redFlags?: string[];
  } | null;
  aiRiskScore: number | null;
  doctorNotes: string | null;
  finalOpinion: string | null;
  recommendations: string | null;
  createdAt: string;
  updatedAt: string;
  patient?: { name: string; email: string | null; mobileNumber?: string | null };
  doctor?: { name: string; email: string | null; mobileNumber?: string | null };
  images: Array<{ objectKey: string; fileUrl: string }>;
};

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (!token) localStorage.removeItem(TOKEN_KEY);
  else localStorage.setItem(TOKEN_KEY, token);
}

async function request<T>(path: string, init: RequestInit = {}, token?: string | null): Promise<T> {
  const authToken = token ?? getStoredToken();
  const headers = new Headers(init.headers || {});

  headers.set("Cache-Control", "no-store");
  headers.set("Pragma", "no-cache");

  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const response = await fetch(`${API_BASE}${path}`, { ...init, headers, cache: "no-store" });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed (${response.status})`);
  }
  return payload as T;
}

export async function login(input: { identifier: string; password: string }) {
  return request<{ token: string; user: ApiUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function register(input: {
  name: string;
  email?: string;
  mobileNumber?: string;
  phone?: string;
  password: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  age?: number;
  gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  address?: string;
  hospitalName?: string;
  hospitalAddress?: string;
  tobaccoGutkaHistory?: "NEVER" | "FORMER" | "OCCASIONAL" | "DAILY";
  tobaccoGutkaDetails?: string;
}) {
  return request<{ token: string; user: ApiUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getCurrentUser(token?: string | null) {
  return request<{ user: ApiUser }>("/auth/me", {}, token);
}

export async function uploadDocumentApi(file: File, token?: string | null) {
  const form = new FormData();
  form.append("file", file);

  return request<{ objectKey: string; fileUrl: string }>("/uploads/document", {
    method: "POST",
    body: form,
  }, token);
}

export async function uploadImageApi(file: File, token?: string | null) {
  const form = new FormData();
  form.append("image", file);

  return request<{ objectKey: string; fileUrl: string }>("/uploads", {
    method: "POST",
    body: form,
  }, token);
}

export async function createCase(input: {
  urgency: Urgency;
  imageUploads: Array<{ objectKey: string; fileUrl: string }>;
}, token?: string | null) {
  return request<ApiCase>("/cases", {
    method: "POST",
    body: JSON.stringify(input),
  }, token);
}

export async function getMyCases(token?: string | null) {
  return request<ApiCase[]>("/cases/me", {}, token);
}

export async function classifyCase(input: { caseId: string; imageUrl: string }, token?: string | null) {
  return request<{ case: ApiCase; aiResult: unknown }>("/ai/classify", {
    method: "POST",
    body: JSON.stringify(input),
  }, token);
}

export async function createPaymentOrder(input: { caseId: string; amountPaise: number }, token?: string | null) {
  return request<{ payment: { id: string }; order: { id: string; isMock?: boolean }; keyId: string }>("/payments/order", {
    method: "POST",
    body: JSON.stringify(input),
  }, token);
}

export async function submitCaseReview(
  caseId: string,
  input: { doctorNotes: string; finalOpinion: string; recommendations: string; status: "IN_REVIEW" | "REVIEWED" },
  token?: string | null,
) {
  return request<ApiCase>(`/cases/${caseId}/review`, {
    method: "PATCH",
    body: JSON.stringify(input),
  }, token);
}

export async function sendWhatsApp(
  input: { caseId: string; toPhone: string; messageBody: string },
  token?: string | null,
) {
  return request<{ message: { id: string }; provider: { id: string; status: string } }>("/whatsapp/send", {
    method: "POST",
    body: JSON.stringify(input),
  }, token);
}

export function mapApiCaseToPatientCase(item: ApiCase): PatientCase {
  const urgency = (item.urgency || "low") as Urgency;
  const status: ReviewStatus = item.status === "REVIEWED" ? "Reviewed" : "Pending";
  const riskScoreBase = item.aiRiskScore == null ? 0 : item.aiRiskScore <= 1 ? item.aiRiskScore * 100 : item.aiRiskScore;
  const recommendationKey = urgency === "high" ? "immediate" : urgency === "moderate" ? "consult" : "monitor";
  const summaryText = item.aiSummary?.summary || "AI analysis is pending.";
  const hasDoctorReviewContent = Boolean(item.doctorNotes || item.finalOpinion || item.recommendations);

  return {
    id: item.id,
    patientName: item.patient?.name || "",
    phone: item.patient?.mobileNumber || item.patient?.email || "",
    submittedAt: item.createdAt,
    urgency,
    status,
    riskScore: Math.round(riskScoreBase),
    findings: item.aiSummary?.findings || [],
    conditions: item.aiSummary?.findings || [],
    redFlags: item.aiSummary?.redFlags || [],
    recommendationKey,
    summary: {
      en: summaryText,
      hi: summaryText,
      gu: summaryText,
    },
    aiTechnicalSummary: summaryText,
    doctorName: item.doctor?.name || undefined,
    reviewedAt: item.status === "REVIEWED" || hasDoctorReviewContent ? item.updatedAt : undefined,
    doctorNotes: item.doctorNotes || undefined,
    finalOpinion: item.finalOpinion || undefined,
    recommendations: item.recommendations || undefined,
    images: (item.images || []).map((img) => ({
      name: img.objectKey.split("/").pop() || "uploaded-image",
      previewUrl: img.fileUrl,
    })),
  };
}

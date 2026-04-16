import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import Panel from "../../components/Panel";
import UrgencyBadge from "../../components/UrgencyBadge";
import { useApp } from "../../context/AppContext";
import { appCopy, recommendationText } from "../../data/content";
import { sendWhatsApp, submitCaseReview } from "../../lib/api";
import { formatShortDate } from "../../lib/utils";

export default function CaseReview() {
  const { caseId } = useParams<{ caseId: string }>();
  const { language, doctorCases, setDoctorCases, authToken, refreshDoctorCases } = useApp();
  const copy = appCopy[language];
  const navigate = useNavigate();

  const caseData = doctorCases.find((c) => c.id === caseId) ?? doctorCases[0];

  const [doctorName, setDoctorName] = useState(caseData?.doctorName ?? "Dr. Nidhi Shah");
  const [doctorNotes, setDoctorNotes] = useState(caseData?.doctorNotes ?? "");
  const [finalOpinion, setFinalOpinion] = useState(caseData?.finalOpinion ?? "");
  const [recommendations, setRecommendations] = useState(caseData?.recommendations ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [isWhatsAppMockMode, setIsWhatsAppMockMode] = useState(false);

  useEffect(() => {
    if (!caseData) return;
    setDoctorNotes(caseData.doctorNotes ?? "");
    setFinalOpinion(caseData.finalOpinion ?? "");
    setRecommendations(caseData.recommendations ?? "");
    setSaved(false);
    setError(null);
    setIsWhatsAppMockMode(false);
  }, [caseData?.id]);

  function validateReviewInputs(): string | null {
    if (doctorNotes.trim().length < 2) return "Please add technical notes before saving or sending.";
    if (finalOpinion.trim().length < 2) return "Please add a final opinion before saving or sending.";
    if (recommendations.trim().length < 2) return "Please add recommendations before saving or sending.";
    return null;
  }

  if (!caseData) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 text-stone-500">
          <p className="text-4xl">🔍</p>
          <p className="mt-3 font-semibold">Case not found</p>
          <button className="action-button-secondary mt-4" onClick={() => navigate("/doctor/queue")}>
            ← Back to queue
          </button>
        </div>
      </Layout>
    );
  }

  async function handleSave() {
    const validationError = validateReviewInputs();
    if (validationError) {
      setError(validationError);
      setSaved(false);
      return;
    }

    try {
      setError(null);
      await submitCaseReview(
        caseData.id,
        {
          doctorNotes,
          finalOpinion,
          recommendations,
          status: "IN_REVIEW",
        },
        authToken,
      );
      setDoctorCases((prev) =>
        prev.map((c) =>
          c.id === caseData.id ? { ...c, doctorNotes, finalOpinion, recommendations } : c,
        ),
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save review");
      setSaved(false);
    }
  }

  async function handleSendWhatsapp() {
    const validationError = validateReviewInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSending(true);
    setError(null);
    setIsWhatsAppMockMode(false);

    const reviewedAt = new Date().toISOString();
    const reviewer = doctorName.trim() || "Dr. OralScan";
    const rec = recommendations || recommendationText.en[caseData.recommendationKey];
    const message = `Dear ${caseData.patientName}, your OralScan screening ${caseData.id} has been reviewed by ${reviewer}. ${rec}`;

    try {
      await submitCaseReview(
        caseData.id,
        {
          doctorNotes,
          finalOpinion,
          recommendations,
          status: "REVIEWED",
        },
        authToken,
      );

      const whatsappResult = await sendWhatsApp(
        {
          caseId: caseData.id,
          toPhone: caseData.phone,
          messageBody: message,
        },
        authToken,
      );

      if (whatsappResult.provider?.status === "mock_sent") {
        setIsWhatsAppMockMode(true);
      }

      setDoctorCases((prev) =>
        prev.map((c) =>
          c.id === caseData.id
            ? { ...c, status: "Reviewed", reviewedAt, doctorName: reviewer, doctorNotes, finalOpinion, recommendations }
            : c,
        ),
      );

      window.open(
        `https://wa.me/${caseData.phone}?text=${encodeURIComponent(message)}`,
        "_blank",
        "noopener,noreferrer",
      );
      await refreshDoctorCases().catch(() => undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send WhatsApp feedback");
    } finally {
      setSending(false);
    }
  }

  return (
    <Layout>
      <div className="flex flex-col gap-5">
        {/* Back breadcrumb */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            className="action-button-secondary"
            onClick={() => navigate("/doctor/queue")}
          >
            ← {copy.doctorQueue}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-stone-300">/</span>
            <span className="text-sm font-semibold text-stone-700">{caseData.patientName}</span>
            <span className="rounded-full border border-stone-900/10 bg-stone-100 px-3 py-1 text-xs text-stone-500">
              {caseData.id}
            </span>
          </div>
        </div>

        <Panel
          title="Patient review"
          subtitle="Images, AI summary, clinical notes, and WhatsApp feedback."
          accent="bg-[linear-gradient(90deg,#1d3a6f,#2b6bb6,#3d8dcf)]"
        >
          <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
            {/* Image panel */}
            <div className="space-y-3">
              {caseData.images.length > 0 ? (
                caseData.images.map((image) => (
                  <div
                    key={image.name}
                    className="overflow-hidden rounded-3xl border border-stone-900/10 bg-stone-50"
                  >
                    <img
                      alt={image.name}
                      className="h-52 w-full object-cover"
                      src={image.previewUrl}
                    />
                    <div className="px-4 py-2.5 text-xs text-stone-500 truncate">{image.name}</div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center rounded-3xl border border-dashed border-stone-900/10 bg-stone-50 py-16 text-stone-400">
                  <div className="text-center">
                    <p className="text-3xl">🖼️</p>
                    <p className="mt-2 text-sm">No images uploaded</p>
                  </div>
                </div>
              )}
            </div>

            {/* Review panel */}
            <div className="space-y-4">
              {/* AI summary */}
              <div className="rounded-3xl border border-stone-900/10 bg-stone-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-stone-900">{caseData.patientName}</p>
                    <p className="mt-0.5 text-sm text-stone-500">
                      Risk score{" "}
                      <span className="font-bold text-rose-700">{caseData.riskScore}%</span>
                    </p>
                  </div>
                  <UrgencyBadge urgency={caseData.urgency} />
                </div>
                <p className="mt-4 text-sm leading-relaxed text-stone-700">
                  {caseData.aiTechnicalSummary}
                </p>
                <div className="mt-4 grid gap-2 border-t border-stone-900/8 pt-4 text-sm text-stone-700">
                  <p>
                    <span className="font-semibold text-stone-900">Detected: </span>
                    {caseData.findings.join(", ")}
                  </p>
                  <p>
                    <span className="font-semibold text-stone-900">Red flags: </span>
                    {caseData.redFlags.join(", ")}
                  </p>
                </div>
              </div>

              {/* Doctor form */}
              <div className="grid gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.13em] text-stone-500">Doctor name</label>
                  <input
                    className="field"
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="Doctor name"
                    value={doctorName}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.13em] text-stone-500">{copy.technicalNotes}</label>
                  <textarea
                    className="field min-h-28 resize-y"
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder={copy.technicalNotes}
                    value={doctorNotes}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.13em] text-stone-500">{copy.finalOpinion}</label>
                  <textarea
                    className="field min-h-24 resize-y"
                    onChange={(e) => setFinalOpinion(e.target.value)}
                    placeholder={copy.finalOpinion}
                    value={finalOpinion}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.13em] text-stone-500">{copy.recommendations}</label>
                  <textarea
                    className="field min-h-24 resize-y"
                    onChange={(e) => setRecommendations(e.target.value)}
                    placeholder={copy.recommendations}
                    value={recommendations}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <button className="action-button flex-1 sm:flex-none" onClick={handleSave}>
                  {saved ? "✓ Saved!" : "Save notes"}
                </button>
                <button
                  className="action-button-secondary flex-1 sm:flex-none"
                  disabled={sending}
                  onClick={handleSendWhatsapp}
                >
                  {sending ? "Sending..." : `📲 ${copy.whatsapp}`}
                </button>
              </div>

              {error && <p className="text-sm text-rose-700">{error}</p>}

              {isWhatsAppMockMode && (
                <p className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs text-amber-800">
                  WhatsApp mock mode: provider fallback used in local development.
                </p>
              )}

              {/* Audit trail */}
              <div className="rounded-3xl border border-stone-900/10 bg-white/80 p-4 text-sm">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">
                  {copy.doctorFeedback}
                </p>
                <div className="mt-3 grid gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Status</span>
                    <span className={
                      caseData.status === "Reviewed"
                        ? "rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-900"
                        : "rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-900"
                    }>
                      {caseData.status === "Reviewed" ? copy.reviewed : copy.pending}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Doctor</span>
                    <span className="font-medium text-stone-900">
                      {caseData.doctorName ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Reviewed at</span>
                    <span className="font-medium text-stone-900">
                      {caseData.reviewedAt ? formatShortDate(caseData.reviewedAt) : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </Layout>
  );
}

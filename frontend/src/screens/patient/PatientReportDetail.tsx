import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import Panel from "../../components/Panel";
import UrgencyBadge from "../../components/UrgencyBadge";
import { useApp } from "../../context/AppContext";
import { appCopy, recommendationText } from "../../data/content";
import { formatShortDate } from "../../lib/utils";

function fileExtension(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return ext;
}

function fileKind(name: string) {
  const ext = fileExtension(name);
  if (ext === "pdf") return "PDF";
  if (["jpg", "jpeg", "png", "webp"].includes(ext)) return "Image";
  return "File";
}

export default function PatientReportDetail() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { language, generatedCase, patientCases, refreshPatientCases } = useApp();
  const copy = appCopy[language];

  useEffect(() => {
    refreshPatientCases().catch(() => undefined);
  }, [refreshPatientCases]);

  const reports = useMemo(() => {
    const backendReports = patientCases;
    return generatedCase ? [generatedCase, ...backendReports] : backendReports;
  }, [generatedCase, patientCases]);

  const report = reports.find((item) => item.id === reportId);

  return (
    <Layout>
      <Panel
        title="Previous Report Details"
        subtitle="Complete report information with AI findings, recommendation, doctor review, and uploaded files."
        accent="bg-[linear-gradient(90deg,#6f1d1b,#b6462b,#d7a83d)]"
      >
        {!report ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
            Report not found. It may still be syncing from the backend.
            <div className="mt-4">
              <button className="action-button-secondary" onClick={() => navigate("/patient")}>
                Back to dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-3xl border border-stone-900/10 bg-white/90 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Report ID</p>
                  <p className="font-semibold text-stone-900">{report.id}</p>
                  <p className="mt-1 text-xs text-stone-500">Submitted on {formatShortDate(report.submittedAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <UrgencyBadge urgency={report.urgency} />
                  <p className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                    Risk score: {report.riskScore}%
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-stone-700">{report.summary[language]}</p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border border-sky-200 bg-sky-50/60 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">{copy.findings}</p>
                {report.findings.length ? (
                  <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-sky-900">
                    {report.findings.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-sky-900">No findings available.</p>
                )}
              </div>

              <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">{copy.redFlags}</p>
                {report.redFlags.length ? (
                  <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-amber-900">
                    {report.redFlags.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-amber-900">No critical red flags identified.</p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-stone-900/10 bg-stone-50/90 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-600">{copy.recommendation}</p>
              <p className="mt-3 text-sm leading-relaxed text-stone-700">
                {recommendationText[language][report.recommendationKey]}
              </p>
            </div>

            {(report.doctorNotes || report.finalOpinion || report.recommendations) && (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">{copy.doctorFeedback}</p>
                {report.finalOpinion && (
                  <p className="mt-3 text-sm text-emerald-900">
                    <span className="font-semibold">{copy.finalOpinion}: </span>{report.finalOpinion}
                  </p>
                )}
                {report.doctorNotes && (
                  <p className="mt-2 text-sm text-emerald-900">
                    <span className="font-semibold">{copy.technicalNotes}: </span>{report.doctorNotes}
                  </p>
                )}
                {report.recommendations && (
                  <p className="mt-2 text-sm text-emerald-900">
                    <span className="font-semibold">{copy.recommendations}: </span>{report.recommendations}
                  </p>
                )}
                <p className="mt-3 text-xs text-emerald-700">
                  Reviewed by {report.doctorName || "Doctor"}
                  {report.reviewedAt ? ` on ${formatShortDate(report.reviewedAt)}` : ""}
                </p>
              </div>
            )}

            <div className="rounded-3xl border border-stone-900/10 bg-white/90 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-600">Uploaded files</p>
              {report.images.length ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {report.images.map((img) => (
                    <a
                      key={`${report.id}-${img.name}-${img.previewUrl}`}
                      className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 transition hover:border-stone-400 hover:bg-stone-100"
                      href={img.previewUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <span className="truncate pr-3">{img.name}</span>
                      <span className="shrink-0 rounded-full bg-stone-200 px-2 py-1 text-[11px] font-bold text-stone-700">
                        {fileKind(img.name)}
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-stone-500">No uploaded files available for this report.</p>
              )}
            </div>

            <div className="pt-1">
              <button className="action-button-secondary" onClick={() => navigate("/patient")}>← Back to dashboard</button>
            </div>
          </div>
        )}
      </Panel>
    </Layout>
  );
}

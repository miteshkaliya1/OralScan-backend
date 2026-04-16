import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import MetricCard from "../../components/MetricCard";
import Panel from "../../components/Panel";
import UrgencyBadge from "../../components/UrgencyBadge";
import { useApp } from "../../context/AppContext";
import { appCopy } from "../../data/content";
import { formatShortDate } from "../../lib/utils";

export default function PatientDashboard() {
  const { language, generatedCase, patientCases, refreshPatientCases, currentUser } = useApp();
  const copy = appCopy[language];
  const navigate = useNavigate();

  useEffect(() => {
    refreshPatientCases().catch(() => undefined);
  }, [refreshPatientCases]);

  const backendReports = patientCases;
  const reports = generatedCase ? [generatedCase, ...backendReports] : backendReports;

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Welcome + start CTA */}
        <Panel
          title={`Hello, ${(currentUser?.name || "there").split(" ")[0]} 👋`}
          subtitle="Start a new screening or review your previous results."
          accent="bg-[linear-gradient(90deg,#6f1d1b,#b6462b,#d7a83d)]"
        >
          <div className="grid gap-5 sm:grid-cols-3">
            <MetricCard
              accent="bg-emerald-100 text-emerald-800"
              icon="🔬"
              label={copy.startScreening}
              onClick={() => navigate("/patient/consent")}
              value="Start →"
            />
            <MetricCard
              accent="bg-amber-100 text-amber-800"
              icon="📋"
              label={copy.previousReports}
              value={String(reports.length).padStart(2, "0")}
            />
            <MetricCard
              accent="bg-sky-100 text-sky-800"
              icon="👤"
              label={copy.profile}
              value={(currentUser?.name || "").split(" ")[0]}
            />
          </div>
        </Panel>

        {/* Previous reports */}
        <Panel
          title={copy.previousReports}
          subtitle="Previous screenings with multilingual AI summaries."
        >
          {reports.length === 0 ? (
            <div className="rounded-3xl border border-stone-900/10 bg-white/90 p-5 text-sm text-stone-500">
              No screenings yet. Start a new screening to see results here.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-stone-900/10 bg-white/90 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-stone-900">{item.id}</p>
                      <p className="text-xs text-stone-400">{formatShortDate(item.submittedAt)}</p>
                    </div>
                    <UrgencyBadge urgency={item.urgency} />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">
                    {item.summary[language]}
                  </p>

                  <div className="mt-4">
                    <button
                      className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 transition hover:border-stone-500 hover:bg-stone-100"
                      onClick={() => navigate(`/patient/report/${item.id}`)}
                    >
                      View full report
                    </button>
                  </div>

                  {(item.doctorNotes || item.finalOpinion || item.recommendations) && (
                    <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
                        {copy.doctorFeedback}
                      </p>

                      {item.finalOpinion && (
                        <p className="mt-2 text-sm text-emerald-900">
                          <span className="font-semibold">{copy.finalOpinion}: </span>
                          {item.finalOpinion}
                        </p>
                      )}

                      {item.doctorNotes && (
                        <p className="mt-1.5 text-sm text-emerald-900">
                          <span className="font-semibold">{copy.technicalNotes}: </span>
                          {item.doctorNotes}
                        </p>
                      )}

                      {item.recommendations && (
                        <p className="mt-1.5 text-sm text-emerald-900">
                          <span className="font-semibold">{copy.recommendations}: </span>
                          {item.recommendations}
                        </p>
                      )}

                      <p className="mt-2 text-xs text-emerald-700">
                        Reviewed by {item.doctorName || "Doctor"}
                        {item.reviewedAt ? ` on ${formatShortDate(item.reviewedAt)}` : ""}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Patient details */}
        <Panel title={copy.patientDetails} subtitle="Patient profile details.">
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["Name", currentUser?.name || "", "👤"],
                ["Mobile", currentUser?.mobileNumber || "-", "📱"],
                ["Email", currentUser?.email || "-", "📧"],
                ["Age", currentUser?.age ? String(currentUser.age) : "-", "🎂"],
                ["Gender", currentUser?.gender || "-", "⚧"],
                ["Tobacco/Gutka", currentUser?.tobaccoGutkaHistory || "-", "🩺"],
                ["Role", currentUser?.role || "", "🏥"],
              ] as [string, string, string][]
            ).map(([label, value, icon]) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-stone-900/10 bg-white/90 px-4 py-3.5 text-sm"
              >
                <span className="text-base">{icon}</span>
                <span className="flex-1 text-stone-500 font-medium">{label}</span>
                <span className="font-bold text-stone-900">{value}</span>
              </div>
            ))}

            <div className="sm:col-span-2 rounded-2xl border border-stone-900/10 bg-white/90 px-4 py-3.5 text-sm">
              <span className="font-bold text-stone-900">Address: </span>
              <span className="text-stone-600">{currentUser?.address || "-"}</span>
            </div>

            <div className="sm:col-span-2 rounded-2xl border border-stone-900/10 bg-white/90 px-4 py-3.5 text-sm">
              <span className="font-bold text-stone-900">History details: </span>
              <span className="text-stone-600">{currentUser?.tobaccoGutkaDetails || "-"}</span>
            </div>
          </div>
        </Panel>
      </div>
    </Layout>
  );
}

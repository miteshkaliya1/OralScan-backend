import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import MetricCard from "../../components/MetricCard";
import Panel from "../../components/Panel";
import UrgencyBadge from "../../components/UrgencyBadge";
import { useApp } from "../../context/AppContext";
import { appCopy } from "../../data/content";
import { formatShortDate } from "../../lib/utils";

export default function DoctorDashboard() {
  const { language, doctorCases, refreshDoctorCases } = useApp();
  const copy = appCopy[language];
  const navigate = useNavigate();

  useEffect(() => {
    refreshDoctorCases().catch(() => undefined);
  }, [refreshDoctorCases]);

  const stats = useMemo(
    () => ({
      totalPatients: doctorCases.length,
      pendingReviews: doctorCases.filter((c) => c.status === "Pending").length,
      urgentCases: doctorCases.filter((c) => c.urgency === "high").length,
    }),
    [doctorCases],
  );

  const recentCases = doctorCases.slice(0, 5);

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <Panel
          title={copy.doctorPortal}
          subtitle="Overview of the patient queue and priority cases."
          accent="bg-[linear-gradient(90deg,#1d3a6f,#2b6bb6,#3d8dcf)]"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              accent="bg-stone-100 text-stone-700"
              icon="👥"
              label="Total patients"
              value={String(stats.totalPatients).padStart(2, "0")}
            />
            <MetricCard
              accent="bg-amber-100 text-amber-800"
              icon="⏳"
              label="Pending reviews"
              onClick={() => navigate("/doctor/queue?filter=pending")}
              value={String(stats.pendingReviews).padStart(2, "0")}
            />
            <MetricCard
              accent="bg-rose-100 text-rose-800"
              icon="🚨"
              label="Urgent cases"
              onClick={() => navigate("/doctor/queue?filter=urgent")}
              value={String(stats.urgentCases).padStart(2, "0")}
            />
          </div>
          <button
            className="action-button mt-6"
            onClick={() => navigate("/doctor/queue")}
          >
            View full patient queue →
          </button>
        </Panel>

        <Panel
          title="Recent cases"
          subtitle="Latest submissions across all urgency levels. Tap any row to review."
        >
          {/* Mobile card list */}
          <div className="flex flex-col gap-3 md:hidden">
            {recentCases.map((item) => (
              <div
                key={item.id}
                className="flex cursor-pointer items-start justify-between gap-3 rounded-3xl border border-stone-900/10 bg-white/90 p-5 transition-colors hover:bg-stone-50 active:bg-stone-100"
                onClick={() => navigate(`/doctor/review/${item.id}`)}
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-stone-900">{item.patientName}</p>
                  <p className="text-xs text-stone-400">{item.id} · {formatShortDate(item.submittedAt)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <UrgencyBadge urgency={item.urgency} />
                  <span className={item.status === "Reviewed"
                    ? "rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-900"
                    : "rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900"
                  }>
                    {item.status === "Reviewed" ? copy.reviewed : copy.pending}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-3xl border border-stone-900/10 md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-stone-100/80 text-stone-500">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-[0.1em] text-xs">Patient</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-[0.1em] text-xs">Submitted</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-[0.1em] text-xs">Urgency</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-[0.1em] text-xs">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentCases.map((item) => (
                  <tr
                    key={item.id}
                    className="cursor-pointer border-t border-stone-900/8 bg-white transition-colors hover:bg-amber-50/60"
                    onClick={() => navigate(`/doctor/review/${item.id}`)}
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-stone-900">{item.patientName}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{item.id}</p>
                    </td>
                    <td className="px-6 py-4 text-stone-600">{formatShortDate(item.submittedAt)}</td>
                    <td className="px-6 py-4"><UrgencyBadge urgency={item.urgency} /></td>
                    <td className="px-6 py-4">
                      <span className={item.status === "Reviewed"
                        ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900"
                        : "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900"
                      }>
                        {item.status === "Reviewed" ? copy.reviewed : copy.pending}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </Layout>
  );
}

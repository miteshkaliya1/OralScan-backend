import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../../components/Layout";
import Panel from "../../components/Panel";
import UrgencyBadge from "../../components/UrgencyBadge";
import { useApp } from "../../context/AppContext";
import { appCopy } from "../../data/content";
import { formatShortDate } from "../../lib/utils";

type FilterMode = "all" | "pending" | "urgent";

export default function PatientQueue() {
  const { language, doctorCases, refreshDoctorCases } = useApp();
  const copy = appCopy[language];
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialFilter = (searchParams.get("filter") as FilterMode) ?? "all";
  const [filterMode, setFilterMode] = useState<FilterMode>(initialFilter);

  useEffect(() => {
    refreshDoctorCases().catch(() => undefined);
  }, [refreshDoctorCases]);

  const filteredCases = useMemo(() => {
    if (filterMode === "pending") return doctorCases.filter((c) => c.status === "Pending");
    if (filterMode === "urgent") return doctorCases.filter((c) => c.urgency === "high");
    return doctorCases;
  }, [doctorCases, filterMode]);

  const filterConfig: [FilterMode, string, string][] = [
    ["all", copy.allPatients, "bg-stone-100 text-stone-700"],
    ["pending", copy.pendingOnly, "bg-amber-100 text-amber-800"],
    ["urgent", copy.urgentOnly, "bg-rose-100 text-rose-800"],
  ];

  return (
    <Layout>
      <Panel
        title={copy.doctorQueue}
        subtitle="Tap any row to open the full patient review screen."
        accent="bg-[linear-gradient(90deg,#1d3a6f,#2b6bb6,#3d8dcf)]"
      >
        <div className="mb-6 flex flex-wrap gap-2">
          {filterConfig.map(([mode, label, colors]) => (
            <button
              key={mode}
              className={clsx(
                "rounded-full px-4 py-2 text-sm font-semibold transition-all min-h-[36px]",
                filterMode === mode
                  ? "bg-stone-900 text-white shadow-sm"
                  : `${colors} hover:opacity-90`,
              )}
              onClick={() => setFilterMode(mode)}
            >
              {label}
              <span className="ml-1.5 rounded-full bg-white/25 px-1.5 py-0.5 text-xs">
                {mode === "all" ? doctorCases.length
                  : mode === "pending" ? doctorCases.filter((c) => c.status === "Pending").length
                  : doctorCases.filter((c) => c.urgency === "high").length}
              </span>
            </button>
          ))}
        </div>

        {filteredCases.length === 0 ? (
          <div className="rounded-3xl border border-stone-900/10 py-16 text-center text-stone-400">
            <p className="text-3xl">📋</p>
            <p className="mt-2 text-sm font-medium">No cases match this filter.</p>
          </div>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="flex flex-col gap-3 md:hidden">
              {filteredCases.map((item) => (
                <div
                  key={item.id}
                  className="flex cursor-pointer items-start justify-between gap-3 rounded-3xl border border-stone-900/10 bg-white/90 p-5 transition-all hover:shadow-md active:bg-stone-50"
                  onClick={() => navigate(`/doctor/review/${item.id}`)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-stone-900">{item.patientName}</p>
                    <p className="mt-0.5 text-xs text-stone-400">{item.id}</p>
                    <p className="mt-0.5 text-xs text-stone-500">{formatShortDate(item.submittedAt)}</p>
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

            {/* Desktop: table */}
            <div className="hidden overflow-hidden rounded-3xl border border-stone-900/10 md:block">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-stone-100/80 text-stone-500">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase tracking-[0.1em] text-xs">Patient Name</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-[0.1em] text-xs">Submitted</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-[0.1em] text-xs">Urgency</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-[0.1em] text-xs">Status</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-[0.1em] text-xs text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.map((item) => (
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
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs font-bold text-stone-400 group-hover:text-stone-700">Review →</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Panel>
    </Layout>
  );
}

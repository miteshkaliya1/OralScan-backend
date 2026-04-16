import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import Panel from "../../components/Panel";
import { useApp } from "../../context/AppContext";
import { appCopy } from "../../data/content";
import { evaluateQuality } from "../../lib/utils";

const CHECK_ICONS = ["☀️", "👁️", "🔆", "📐"];

export default function QualityCheck() {
  const { language, uploadedImages, qualityResult, setQualityResult } = useApp();
  const copy = appCopy[language];
  const navigate = useNavigate();

  function runCheck() {
    if (!uploadedImages.length) return;
    setQualityResult(evaluateQuality(uploadedImages));
  }

  return (
    <Layout>
      <Panel
        title={copy.qualityTitle}
        subtitle="All four AI quality gates must pass before payment is enabled."
        accent="bg-[linear-gradient(90deg,#6f1d1b,#b6462b,#d7a83d)]"
      >
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            className="action-button"
            disabled={!uploadedImages.length}
            onClick={runCheck}
          >
            Run AI quality check
          </button>
          {qualityResult && (
            <span
              className={clsx(
                "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold",
                qualityResult.passed
                  ? "bg-emerald-100 text-emerald-900"
                  : "bg-rose-100 text-rose-900",
              )}
            >
              {qualityResult.passed ? "✓ " : "✗ "}
              {qualityResult.passed ? copy.qualityPass : copy.qualityFail}
            </span>
          )}
        </div>

        {qualityResult ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {qualityResult.checks.map((check, i) => (
              <div
                key={check.key}
                className={clsx(
                  "rounded-3xl border p-5 transition-colors",
                  check.passed
                    ? "border-emerald-200 bg-emerald-50/60"
                    : "border-rose-200 bg-rose-50/60",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{CHECK_ICONS[i]}</span>
                    <p className="font-bold text-stone-900 text-sm">{check.label[language]}</p>
                  </div>
                  <span
                    className={clsx(
                      "shrink-0 rounded-full px-3 py-1 text-xs font-bold",
                      check.passed
                        ? "bg-emerald-500 text-white"
                        : "bg-rose-500 text-white",
                    )}
                  >
                    {check.passed ? "Pass" : "Fail"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-stone-600 pl-9 leading-relaxed">{check.detail[language]}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {CHECK_ICONS.map((icon, i) => (
              <div key={i} className="flex items-center gap-3 rounded-3xl border border-stone-900/10 bg-stone-50 p-5">
                <span className="text-2xl opacity-30">{icon}</span>
                <div className="h-3 w-32 rounded-full bg-stone-200 animate-pulse" />
              </div>
            ))}
          </div>
        )}

        <div className="mt-7 flex flex-wrap gap-3">
          {qualityResult?.passed && (
            <button className="action-button" onClick={() => navigate("/patient/payment")}>
              Proceed to payment →
            </button>
          )}
          {qualityResult && !qualityResult.passed && (
            <button
              className="action-button-secondary"
              onClick={() => navigate("/patient/upload")}
            >
              ← Re-upload images
            </button>
          )}
        </div>
      </Panel>
    </Layout>
  );
}

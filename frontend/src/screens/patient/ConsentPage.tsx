import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import Panel from "../../components/Panel";
import { useApp } from "../../context/AppContext";
import { appCopy } from "../../data/content";

const CONSENT_ICONS = ["🔒", "🤖", "👨‍⚕️"];

export default function ConsentPage() {
  const { language, consentTimestamp, setConsentTimestamp } = useApp();
  const copy = appCopy[language];
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  function handleConsent() {
    if (!checked) return;
    setConsentTimestamp(new Date().toLocaleString("en-IN"));
    navigate("/patient/upload");
  }

  return (
    <Layout>
      <Panel
        title={copy.consentTitle}
        subtitle="Please read each item carefully before proceeding."
        accent="bg-[linear-gradient(90deg,#6f1d1b,#b6462b,#d7a83d)]"
      >
        <div className="space-y-3 sm:space-y-4">
          {[copy.consentLine1, copy.consentLine2, copy.consentLine3].map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-2xl border border-stone-900/10 bg-white/80 p-5 transition-colors hover:bg-white"
            >
              <span className="mt-0.5 text-2xl shrink-0">{CONSENT_ICONS[i]}</span>
              <p className="text-sm leading-relaxed text-stone-700">{item}</p>
            </div>
          ))}
        </div>

        {consentTimestamp && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <span className="text-emerald-600">✓</span>
            <p className="text-sm text-emerald-800">
              Previously consented on <span className="font-semibold">{consentTimestamp}</span>
            </p>
          </div>
        )}

        <div className="mt-5 rounded-2xl border border-stone-900/10 bg-white/70 p-5">
          <label className="flex cursor-pointer items-start gap-4">
            <div className="relative mt-0.5 shrink-0">
              <input
                checked={checked}
                className="peer sr-only"
                onChange={(e) => setChecked(e.target.checked)}
                type="checkbox"
              />
              <div className="h-5 w-5 rounded-md border-2 border-stone-300 bg-white transition-colors peer-checked:border-stone-900 peer-checked:bg-stone-900" />
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-white text-xs font-bold opacity-0 peer-checked:opacity-100">✓</span>
            </div>
              <span className="text-sm leading-relaxed text-stone-700 font-medium">{copy.consentButton}</span>
          </label>
        </div>

        <button
          className="action-button mt-5 w-full sm:w-auto"
          disabled={!checked}
          onClick={handleConsent}
        >
          {copy.consentButton} →
        </button>
      </Panel>
    </Layout>
  );
}

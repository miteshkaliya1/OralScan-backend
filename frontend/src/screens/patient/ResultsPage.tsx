import clsx from "clsx";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Layout from "../../components/Layout";
import Panel from "../../components/Panel";
import UrgencyBadge from "../../components/UrgencyBadge";
import { useApp } from "../../context/AppContext";
import { appCopy, recommendationText, type Language, type PatientCase } from "../../data/content";
import { classifyCase, mapApiCaseToPatientCase } from "../../lib/api";
import { downloadPdf } from "../../lib/utils";

type LocalizedCopy = (typeof appCopy)[Language];
type ResultsLocationState = { testModePayment?: boolean };

export default function ResultsPage() {
  const {
    language,
    uploadedImages,
    paymentComplete,
    qualityResult,
    generatedCase,
    setGeneratedCase,
    setDoctorCases,
    caseShared,
    setCaseShared,
    activeCaseId,
    authToken,
    refreshDoctorCases,
    currentUser,
  } = useApp();
  const location = useLocation();
  const locationState = location.state as ResultsLocationState | null;
  const isTestModePayment = Boolean(locationState?.testModePayment);
  const copy = appCopy[language];
  const report = generatedCase;
  const analysisRunning = paymentComplete && qualityResult?.passed && !generatedCase;
  const cannotAnalyze = paymentComplete && qualityResult?.passed && !activeCaseId;

  useEffect(() => {
    if (!paymentComplete || !qualityResult?.passed || generatedCase) return;
    if (!activeCaseId) return;

    const id = window.setTimeout(() => {
      const firstRemote = uploadedImages.find((img) => img.remoteUrl)?.remoteUrl;
      if (!firstRemote) return;
      classifyCase({ caseId: activeCaseId, imageUrl: firstRemote }, authToken)
        .then((result) => {
          setGeneratedCase(mapApiCaseToPatientCase(result.case));
        })
        .catch(() => undefined);
    }, 1400);
    return () => window.clearTimeout(id);
  }, [paymentComplete, qualityResult, generatedCase, setGeneratedCase, uploadedImages, activeCaseId, authToken]);

  function handleShare() {
    if (!generatedCase || caseShared) return;
    setDoctorCases((prev) => [generatedCase, ...prev]);
    setCaseShared(true);
    refreshDoctorCases().catch(() => undefined);
  }

  function handleDownload() {
    if (!report) return;
    downloadPdf(report, language, copy.disclaimer, uploadedImages, currentUser?.name);
  }

  return (
    <Layout>
      <Panel
        title={copy.analysisTitle}
        subtitle="AI triage output in your selected language."
        accent="bg-[linear-gradient(90deg,#6f1d1b,#b6462b,#d7a83d)]"
      >
        {isTestModePayment && (
          <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            Test mode payment confirmed. This result was generated using a mock Razorpay order in local development.
          </div>
        )}
        {cannotAnalyze ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
            Backend case context missing. Please re-upload and complete payment again.
          </div>
        ) : analysisRunning ? (
          <div className="rounded-3xl border border-stone-900/10 bg-stone-50 p-8">
            <p className="mb-4 text-sm font-semibold text-stone-700">
              Analyzing oral images for lesion patterns, urgency, and risk factors…
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-stone-200">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-[linear-gradient(90deg,#6f1d1b,#d7a83d)]" />
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {["Pattern detection", "Urgency triage", "Report generation"].map((step) => (
                <div key={step} className="flex items-center gap-2 rounded-2xl bg-white border border-stone-900/10 px-4 py-3 text-sm text-stone-600">
                  <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  {step}
                </div>
              ))}
            </div>
          </div>
        ) : report ? (
          <ResultsCard
            copy={copy}
            language={language}
            onDownload={handleDownload}
            onShare={handleShare}
            report={report}
            shared={caseShared}
          />
        ) : (
          <div className="rounded-3xl border border-stone-900/10 bg-stone-50 p-6 text-stone-600">
            Waiting for AI analysis response from backend.
          </div>
        )}
      </Panel>
    </Layout>
  );
}

function ResultsCard({
  copy, language, onDownload, onShare, report, shared,
}: {
  copy: LocalizedCopy;
  language: Language;
  onDownload: () => void;
  onShare: () => void;
  report: PatientCase;
  shared: boolean;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
      {/* Left: urgency + summary */}
      <div className="rounded-[1.75rem] border border-stone-900/10 bg-[linear-gradient(160deg,rgba(111,29,27,0.96),rgba(182,70,43,0.88),rgba(207,122,48,0.7))] p-6 text-white">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">
          {copy.resultsTitle}
        </p>
        <div className="mt-5">
          <p className="font-display text-6xl capitalize leading-none">{report.urgency}</p>
          <p className="mt-2 text-xs text-white/50">{report.id}</p>
          <div className="mt-3">
            <UrgencyBadge urgency={report.urgency} />
          </div>
        </div>
        <p className="mt-6 text-sm leading-relaxed text-white/82">
          {report.summary[language]}
        </p>
        <div className="mt-5 rounded-2xl bg-white/12 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">
            {copy.recommendation}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/86">
            {recommendationText[language][report.recommendationKey]}
          </p>
        </div>
      </div>

      {/* Right: findings + actions */}
      <div className="space-y-5 rounded-[1.75rem] border border-stone-900/10 bg-white/92 p-6">
        <DetailedExplanation report={report} language={language} />

        <DataGroup title={copy.findings} values={report.findings} color="bg-sky-50 text-sky-900 border-sky-200" />
        <DataGroup title={copy.conditions} values={report.conditions} color="bg-amber-50 text-amber-900 border-amber-200" />
        <DataGroup title={copy.redFlags} values={report.redFlags} color="bg-rose-50 text-rose-900 border-rose-200" />

        <div className="flex flex-wrap gap-3 pt-1">
          <button className="action-button flex-1 sm:flex-none" onClick={onDownload}>
            ⬇ {copy.downloadPdf}
          </button>
          <button
            className="action-button-secondary flex-1 sm:flex-none"
            disabled={shared}
            onClick={onShare}
          >
            {shared ? `✓ ${copy.sharedReview}` : `↗ ${copy.shareReview}`}
          </button>
        </div>

        {shared && (
          <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <span className="text-emerald-600 mt-0.5">✓</span>
            <p className="text-sm text-emerald-800">
              Case added to the surgeon queue. A doctor will review and send WhatsApp feedback.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailedExplanation({ report, language }: { report: PatientCase; language: Language }) {
  const lines = buildDetailedExplanation(report, language);

  return (
    <div className="rounded-3xl border border-stone-900/10 bg-stone-50/90 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">AI clinical explanation</p>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-stone-700">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function buildDetailedExplanation(report: PatientCase, language: Language): string[] {
  const findingSummary = report.findings.length
    ? report.findings.join(", ")
    : "no strong lesion-specific markers";
  const redFlagSummary = report.redFlags.length
    ? report.redFlags.join(", ")
    : "no high-risk red flags";

  const urgencyLine = report.urgency === "high"
    ? "Urgency is high because the visual pattern includes signs that can overlap with clinically significant oral lesions and needs fast specialist examination."
    : report.urgency === "moderate"
      ? "Urgency is moderate because the AI sees suspicious but non-emergency features that still require timely clinical confirmation."
      : "Urgency is low because current image patterns look less concerning, but monitoring is still important.";

  const actionLine = report.urgency === "high"
    ? "Please arrange an in-person oral oncology or maxillofacial consultation as early as possible, ideally within 24-48 hours."
    : report.urgency === "moderate"
      ? "Please book a surgeon or oral medicine consultation within the next few days and carry this report for review."
      : "Continue observation, avoid irritants such as tobacco, and repeat screening if symptoms persist or change.";

  if (language === "hi") {
    return [
      `AI विश्लेषण के अनुसार प्रमुख संकेत: ${findingSummary}।`,
      `महत्वपूर्ण रेड फ्लैग: ${redFlagSummary}।`,
      urgencyLine,
      actionLine,
      "यह रिपोर्ट स्क्रीनिंग सहायता है, अंतिम निदान नहीं। पुष्टि के लिए डॉक्टर की जांच आवश्यक है।",
    ];
  }

  if (language === "gu") {
    return [
      `AI વિશ્લેષણ મુજબ મુખ્ય નિરીક્ષણ: ${findingSummary}.`,
      `મહત્વના રેડ ફ્લેગ્સ: ${redFlagSummary}.`,
      urgencyLine,
      actionLine,
      "આ રિપોર્ટ સ્ક્રીનિંગ સહાય છે, અંતિમ નિદાન નથી. ખાતરી માટે ડોક્ટરની ક્લિનિકલ તપાસ જરૂરી છે.",
    ];
  }

  return [
    `Based on image analysis, the most relevant visual findings are: ${findingSummary}.`,
    `Risk-focused markers noted: ${redFlagSummary}.`,
    urgencyLine,
    actionLine,
    "This is a screening interpretation, not a final diagnosis. Clinical examination and, if needed, biopsy remain the diagnostic standard.",
  ];
}

function DataGroup({ title, values, color }: { title: string; values: string[]; color: string }) {
  return (
    <div>
      <p className="mb-2.5 text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{title}</p>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <span
            key={value}
            className={clsx("rounded-full border px-3 py-1.5 text-sm font-medium", color)}
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}

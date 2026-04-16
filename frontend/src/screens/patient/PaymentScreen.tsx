import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import Panel from "../../components/Panel";
import { useApp } from "../../context/AppContext";
import { appCopy } from "../../data/content";
import { createCase, createPaymentOrder } from "../../lib/api";
import { screeningFee } from "../../lib/utils";

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", icon: "⚡" },
  { id: "cards", label: "Cards", icon: "💳" },
  { id: "netbanking", label: "Netbanking", icon: "🏦" },
];

const INCLUDED = [
  "AI image analysis",
  "Certified surgeon review",
  "Downloadable PDF report",
  "WhatsApp feedback within 24 hrs",
];

export default function PaymentScreen() {
  const { language, qualityResult, paymentComplete, setPaymentComplete, uploadedImages, uploadedDocuments, authToken, activeCaseId, setActiveCaseId } = useApp();
  const copy = appCopy[language];
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTestModeOrder, setIsTestModeOrder] = useState(false);

  async function handlePayment() {
    if (!qualityResult?.passed) return;
    try {
      setProcessing(true);
      setError(null);
      setIsTestModeOrder(false);

      let caseId = activeCaseId;
      if (!caseId) {
        const imageUploads = [...uploadedImages, ...uploadedDocuments]
          .filter((img) => img.objectKey && img.remoteUrl)
          .map((img) => ({ objectKey: img.objectKey as string, fileUrl: img.remoteUrl as string }));

        if (!imageUploads.length) {
          throw new Error("Please upload images again (storage sync failed).");
        }

        const createdCase = await createCase({ urgency: "moderate", imageUploads }, authToken);
        caseId = createdCase.id;
        setActiveCaseId(caseId);
      }

      const paymentOrder = await createPaymentOrder({ caseId, amountPaise: screeningFee * 100 }, authToken);
      const isMockOrder = Boolean(paymentOrder.order.isMock);

      if (isMockOrder) {
        setIsTestModeOrder(true);
      }

      setPaymentComplete(true);

      if (isMockOrder) {
        await new Promise((resolve) => window.setTimeout(resolve, 900));
      }

      navigate("/patient/results", { state: { testModePayment: isMockOrder } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment init failed");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <Layout>
      <Panel
        title={copy.paymentTitle}
        subtitle="Secure payment is enabled after AI quality gates pass."
        accent="bg-[linear-gradient(90deg,#6f1d1b,#b6462b,#d7a83d)]"
      >
        <div className="grid gap-6 md:grid-cols-[0.85fr_1.15fr]">
          {/* Fee card */}
          <div className="rounded-3xl border border-stone-900/10 bg-stone-50 p-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
              {copy.screeningFee}
            </p>
            <p className="mt-4 font-display text-7xl font-semibold text-stone-950 tracking-tight">₹{screeningFee}</p>
            <p className="mt-4 text-sm text-stone-500 leading-relaxed">{copy.paymentBody}</p>
            <ul className="mt-6 space-y-3">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-stone-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700 font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Payment method + CTA */}
          <div className="rounded-3xl border border-stone-900/10 bg-white p-7">
            <p className="text-sm font-bold text-stone-700 uppercase tracking-[0.12em]">Select payment method</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  className="flex flex-col items-center gap-1.5 rounded-2xl border border-stone-900/10 bg-stone-50 px-3 py-5 text-stone-700 transition-colors hover:border-stone-900/20 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-900/20"
                >
                  <span className="text-2xl">{method.icon}</span>
                  <span className="text-xs font-bold uppercase tracking-[0.1em]">{method.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-stone-900/10 bg-stone-50 p-4 text-xs text-stone-500 leading-relaxed">
              <span className="font-bold text-stone-700">Razorpay secured · </span>
              PCI DSS compliant. Your payment details are never stored.
            </div>

            {isTestModeOrder && (
              <div className="mt-3 rounded-2xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
                Test mode payment: mock Razorpay order used for local development.
              </div>
            )}

            <button
              className="action-button mt-5 w-full"
              disabled={!qualityResult?.passed || paymentComplete || processing}
              onClick={handlePayment}
            >
              {paymentComplete ? copy.paymentSuccess : processing ? "Processing..." : `Pay ₹${screeningFee} — ${copy.paymentButton}`}
            </button>
            {error && <p className="mt-3 text-center text-xs text-rose-700">{error}</p>}
            {!qualityResult?.passed && (
              <p className="mt-3 text-center text-xs text-rose-600">
                Complete the quality check before proceeding.
              </p>
            )}
          </div>
        </div>
      </Panel>
    </Layout>
  );
}

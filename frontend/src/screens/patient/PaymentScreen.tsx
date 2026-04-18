import { useRef, useState } from "react";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import Panel from "../../components/Panel";
import { useApp } from "../../context/AppContext";
import { appCopy } from "../../data/content";
import { createCase, createPaymentOrder } from "../../lib/api";
import { screeningFee } from "../../lib/utils";

// Merchant UPI ID — replace with real merchant VPA in production
const MERCHANT_UPI_ID = "oralscan@hdfc";
const MERCHANT_NAME  = "OralScan";

function buildUpiUrl(amount: number) {
  const params = new URLSearchParams({
    pa: MERCHANT_UPI_ID,
    pn: MERCHANT_NAME,
    am: String(amount),
    cu: "INR",
    tn: "Oral Cancer Screening",
  });
  return `upi://pay?${params.toString()}`;
}

// ─── Razorpay global type ────────────────────────────────────────────────────
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, any>) => { open(): void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
type PaymentMethod = "upi" | "card" | "netbanking";

function detectCardType(num: string): "visa" | "mastercard" | "rupay" | "amex" | null {
  if (num.startsWith("4")) return "visa";
  if (/^5[1-5]|^2[2-7]/.test(num)) return "mastercard";
  if (/^6[0-9]/.test(num)) return "rupay";
  if (/^3[47]/.test(num)) return "amex";
  return null;
}

function formatCardDisplay(val: string): string {
  const d = val.replace(/\D/g, "").slice(0, 16);
  return d.padEnd(16, "·").replace(/(.{4})/g, "$1 ").trim();
}

function formatCardInput(val: string): string {
  const d = val.replace(/\D/g, "").slice(0, 16);
  return d.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(val: string): string {
  const d = val.replace(/\D/g, "").slice(0, 4);
  if (d.length >= 3) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return d;
}

// ─── Data ────────────────────────────────────────────────────────────────────
const UPI_APPS = [
  { id: "phonepe", name: "PhonePe", bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", ring: "ring-purple-400", abbr: "Ph" },
  { id: "gpay",    name: "GPay",    bg: "bg-blue-100",   text: "text-blue-700",   border: "border-blue-200",   ring: "ring-blue-400",   abbr: "G" },
  { id: "paytm",   name: "Paytm",   bg: "bg-sky-100",    text: "text-sky-700",    border: "border-sky-200",    ring: "ring-sky-400",    abbr: "P" },
  { id: "bhim",    name: "BHIM",    bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200", ring: "ring-orange-400", abbr: "B" },
];

const POPULAR_BANKS = [
  { code: "SBIN", name: "SBI" },
  { code: "HDFC", name: "HDFC" },
  { code: "ICIC", name: "ICICI" },
  { code: "UTIB", name: "Axis" },
  { code: "KKBK", name: "Kotak" },
  { code: "PUNB", name: "PNB" },
  { code: "CNRB", name: "Canara" },
  { code: "BARB", name: "BOB" },
  { code: "UBIN", name: "Union" },
  { code: "YESB", name: "Yes" },
  { code: "IOBA", name: "Indian" },
  { code: "FDRL", name: "Federal" },
];

const ALL_BANKS = [
  { code: "SBIN", name: "State Bank of India" },
  { code: "HDFC", name: "HDFC Bank" },
  { code: "ICIC", name: "ICICI Bank" },
  { code: "UTIB", name: "Axis Bank" },
  { code: "KKBK", name: "Kotak Mahindra Bank" },
  { code: "PUNB", name: "Punjab National Bank" },
  { code: "CNRB", name: "Canara Bank" },
  { code: "BARB", name: "Bank of Baroda" },
  { code: "UBIN", name: "Union Bank of India" },
  { code: "YESB", name: "Yes Bank" },
  { code: "IOBA", name: "Indian Bank" },
  { code: "FDRL", name: "Federal Bank" },
  { code: "INDB", name: "IndusInd Bank" },
  { code: "IDIB", name: "Indian Overseas Bank" },
  { code: "CBIN", name: "Central Bank of India" },
];

const INCLUDED = [
  "AI image analysis (Claude Sonnet)",
  "Certified surgeon review",
  "Downloadable PDF report",
  "WhatsApp feedback within 24 hrs",
];

// ─── Animated Credit Card ────────────────────────────────────────────────────
function CardVisual({ number, name, expiry, cvv, flipped }: {
  number: string; name: string; expiry: string; cvv: string; flipped: boolean;
}) {
  const type = detectCardType(number.replace(/\s/g, ""));
  const masked = formatCardDisplay(number.replace(/\s/g, ""));

  const networkLabel =
    type === "visa" ? "VISA" :
    type === "mastercard" ? "MC" :
    type === "rupay" ? "RuPay" :
    type === "amex" ? "AMEX" : "";

  return (
    <div style={{ perspective: "900px" }} className="w-full select-none">
      <div
        className="relative w-full h-44 transition-all duration-700"
        style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "none" }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl p-5 text-white overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            background: "linear-gradient(135deg, #1e293b 0%, #1e3a5f 60%, #0f172a 100%)",
          }}
        >
          {/* Shine overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_left,_white_0%,_transparent_60%)]" />
          <div className="relative flex justify-between items-start">
            {/* Chip */}
            <div className="flex flex-col gap-px">
              <div className="h-4 w-6 rounded-sm" style={{ background: "linear-gradient(135deg,#d4a017,#f5c842)" }} />
              <div className="h-[1px] w-6 bg-yellow-300/40" />
            </div>
            {networkLabel && (
              <span className="text-[11px] font-black tracking-widest opacity-60">{networkLabel}</span>
            )}
          </div>

          <div className="mt-4 font-mono text-base tracking-[0.2em] text-white/90 drop-shadow">
            {masked}
          </div>

          <div className="mt-3 flex justify-between items-end">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/40">Card Holder</p>
              <p className="text-sm font-semibold mt-0.5 uppercase truncate max-w-[150px] tracking-wide">
                {name || "YOUR NAME"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-widest text-white/40">Expires</p>
              <p className="text-sm font-semibold mt-0.5 font-mono">{expiry || "MM/YY"}</p>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden text-white"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1e293b 100%)",
          }}
        >
          <div className="mt-6 h-10 bg-stone-700/80 w-full" />
          <div className="flex justify-end items-center mt-4 px-5">
            <div className="flex-1 h-7 rounded" style={{ background: "repeating-linear-gradient(90deg,#ffffff20 0px,#ffffff20 6px,transparent 6px,transparent 10px)" }} />
            <div className="ml-3 bg-white/90 text-stone-900 rounded font-mono text-sm font-bold tracking-[0.3em] px-4 py-1.5 min-w-[56px] text-center">
              {cvv || "•••"}
            </div>
          </div>
          <p className="text-right px-5 mt-1 text-[9px] uppercase tracking-widest text-white/40">CVV / CVC</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function PaymentScreen() {
  const {
    language, qualityResult, paymentComplete, setPaymentComplete,
    uploadedImages, uploadedDocuments, authToken, activeCaseId, setActiveCaseId,
    currentUser,
  } = useApp();
  const copy = appCopy[language];
  const navigate = useNavigate();

  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UPI
  const [upiMode, setUpiMode] = useState<"id" | "qr">("id");
  const [upiId, setUpiId] = useState("");
  const [selectedApp, setSelectedApp] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);

  // Card
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardFlipped, setCardFlipped] = useState(false);

  // Netbanking
  const [selectedBank, setSelectedBank] = useState("");

  function switchMethod(m: PaymentMethod) {
    setMethod(m);
    setError(null);
  }

  function validateBeforePay(): string | null {
    if (method === "upi" && upiMode === "id") {
      if (!upiId.trim()) return "Please enter your UPI ID (e.g. name@upi).";
      if (!/^[\w.\-+]+@[\w]+$/.test(upiId.trim())) return "Enter a valid UPI ID (e.g. name@okaxis).";
    }
    if (method === "card") {
      if (cardNumber.replace(/\s/g, "").length < 16) return "Enter a valid 16-digit card number.";
      if (!cardName.trim()) return "Enter the cardholder name.";
      if (cardExpiry.length < 5) return "Enter a valid expiry date (MM/YY).";
      if (cardCvv.length < 3) return "Enter a valid CVV.";
    }
    if (method === "netbanking" && !selectedBank) return "Please select your bank.";
    return null;
  }

  async function handlePayment() {
    if (!qualityResult?.passed) return;
    const validationErr = validateBeforePay();
    if (validationErr) { setError(validationErr); return; }

    setError(null);
    setProcessing(true);

    try {
      let caseId = activeCaseId;
      if (!caseId) {
        const imageUploads = [...uploadedImages, ...uploadedDocuments]
          .filter((img) => img.objectKey && img.remoteUrl)
          .map((img) => ({ objectKey: img.objectKey as string, fileUrl: img.remoteUrl as string }));
        if (!imageUploads.length) throw new Error("Please upload images again (storage sync failed).");
        const createdCase = await createCase({ urgency: "moderate", imageUploads }, authToken);
        caseId = createdCase.id;
        setActiveCaseId(caseId);
      }

      const paymentOrder = await createPaymentOrder({ caseId, amountPaise: screeningFee * 100 }, authToken);
      const isMock = Boolean(paymentOrder.order.isMock);

      if (isMock) {
        // Simulate payment in dev / no-Razorpay-key mode
        await new Promise((resolve) => window.setTimeout(resolve, 1400));
        setPaymentComplete(true);
        navigate("/patient/results", { state: { testModePayment: true } });
        return;
      }

      // Real Razorpay checkout
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Could not load payment gateway. Check your connection.");

      const prefill: Record<string, string> = {
        name:    currentUser?.name || "",
        email:   currentUser?.email || "",
        contact: currentUser?.mobileNumber || "",
      };
      if (method === "upi" && upiMode === "id" && upiId.trim()) prefill["vpa"] = upiId.trim();

      // Build display config to pre-select the chosen method
      const displayBlocks: Record<string, unknown> = {
        instruments: [
          method === "upi"        ? { method: "upi",        flows: ["qr", "intent", "collect"], intent_mode: "none" } :
          method === "card"       ? { method: "card" } :
          /* netbanking */          { method: "netbanking", banks: selectedBank ? [selectedBank] : [] },
        ],
      };

      const rzpOptions = {
        key:          paymentOrder.keyId,
        amount:       screeningFee * 100,
        currency:     "INR",
        name:         "OralScan",
        description:  "Oral Cancer Screening",
        order_id:     paymentOrder.order.id,
        prefill,
        config: { display: { sequence: ["block.methods"], blocks: { methods: displayBlocks }, hide: [{ method: "wallet" }, { method: "emi" }, { method: "paylater" }] } },
        handler: (_response: Record<string, string>) => {
          setPaymentComplete(true);
          navigate("/patient/results");
        },
        modal: { ondismiss: () => setProcessing(false) },
        theme: { color: "#1d3a6f" },
      };

      const rzp = new window.Razorpay(rzpOptions);
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed. Please try again.");
      setProcessing(false);
    }
  }

  const btnLabel = paymentComplete
    ? "Payment Successful ✓"
    : processing
    ? "Processing…"
    : `Pay ₹${screeningFee} securely →`;

  return (
    <Layout>
      <Panel
        title={copy.paymentTitle}
        subtitle="Secure payment is enabled after AI quality gates pass."
        accent="bg-[linear-gradient(90deg,#6f1d1b,#b6462b,#d7a83d)]"
      >
        <div className="grid gap-6 md:grid-cols-[0.85fr_1.15fr]">
          {/* ── Left – Fee summary ── */}
          <div className="rounded-3xl border border-stone-900/10 bg-stone-50 p-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{copy.screeningFee}</p>
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

          {/* ── Right – Payment form ── */}
          <div className="rounded-3xl border border-stone-900/10 bg-white p-7 flex flex-col gap-5">

            {/* Method tabs */}
            <div className="flex rounded-2xl border border-stone-200 bg-stone-50 p-1 gap-1">
              {(["upi", "card", "netbanking"] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMethod(m)}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-bold uppercase tracking-[0.1em] transition-all focus:outline-none ${
                    method === m
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-500 hover:text-stone-700"
                  }`}
                >
                  {m === "upi" ? "⚡ UPI" : m === "card" ? "💳 Card" : "🏦 Netbanking"}
                </button>
              ))}
            </div>

            {/* ── UPI ── */}
            {method === "upi" && (
              <div className="flex flex-col gap-4">

                {/* UPI sub-tabs: Enter ID vs Scan QR */}
                <div className="flex rounded-xl border border-stone-200 bg-stone-50 p-0.5 gap-0.5">
                  <button
                    onClick={() => setUpiMode("id")}
                    className={`flex-1 rounded-[10px] py-2 text-xs font-bold uppercase tracking-[0.1em] transition-all focus:outline-none ${
                      upiMode === "id" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
                    }`}
                  >
                    Enter UPI ID
                  </button>
                  <button
                    onClick={() => setUpiMode("qr")}
                    className={`flex-1 rounded-[10px] py-2 text-xs font-bold uppercase tracking-[0.1em] transition-all focus:outline-none ${
                      upiMode === "qr" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
                    }`}
                  >
                    📷 Scan QR
                  </button>
                </div>

                {/* ── Enter UPI ID mode ── */}
                {upiMode === "id" && (
                  <>
                    {/* App shortcuts */}
                    <div className="grid grid-cols-4 gap-2">
                      {UPI_APPS.map((app) => {
                        const active = selectedApp === app.id;
                        return (
                          <button
                            key={app.id}
                            onClick={() => setSelectedApp(active ? "" : app.id)}
                            className={`flex flex-col items-center gap-1.5 rounded-2xl border py-3 px-1 text-center text-xs font-bold transition-all focus:outline-none ${
                              active
                                ? `${app.bg} ${app.text} ${app.border} ring-2 ${app.ring} ring-offset-1`
                                : "border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100"
                            }`}
                          >
                            <span className={`flex h-8 w-8 items-center justify-center rounded-full font-black text-sm ${active ? `${app.bg} ${app.text}` : "bg-stone-200 text-stone-600"}`}>
                              {app.abbr}
                            </span>
                            <span className="text-[10px]">{app.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* UPI ID input */}
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
                        UPI ID <span className="inline-block text-rose-600">*</span>
                      </label>
                      <div className="relative">
                        <input
                          className="field pr-16"
                          placeholder="yourname@okaxis"
                          value={upiId}
                          onChange={(e) => { setUpiId(e.target.value); setError(null); }}
                          autoComplete="off"
                          inputMode="email"
                        />
                        {upiId.includes("@") && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-sm">✓</span>
                        )}
                      </div>
                      <p className="mt-1.5 text-[11px] text-stone-400">Works with PhonePe, GPay, Paytm, BHIM and any UPI app.</p>
                    </div>
                  </>
                )}

                {/* ── Scan QR mode ── */}
                {upiMode === "qr" && (
                  <div className="flex flex-col items-center gap-4">
                    {/* QR code card */}
                    <div ref={qrRef} className="flex flex-col items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-5 w-full">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Scan to Pay ₹{screeningFee}</p>
                      <div className="rounded-xl bg-white p-3 shadow-sm border border-stone-100">
                        <QRCode
                          value={buildUpiUrl(screeningFee)}
                          size={180}
                          bgColor="#ffffff"
                          fgColor="#0f172a"
                          level="M"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-stone-700">{MERCHANT_NAME}</p>
                        <p className="text-[11px] text-stone-400 mt-0.5">{MERCHANT_UPI_ID}</p>
                      </div>
                    </div>

                    {/* Steps */}
                    <ol className="w-full space-y-2">
                      {[
                        "Open any UPI app — PhonePe, GPay, Paytm, BHIM…",
                        "Tap 'Scan QR' and point your camera at the code above",
                        `Confirm payment of ₹${screeningFee} to OralScan`,
                        "Tap the Pay button below after payment completes",
                      ].map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-xs text-stone-600">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white text-[10px] font-bold mt-0.5">{i + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ol>

                    <p className="text-[11px] text-stone-400 text-center">
                      QR is valid for this session only. Refresh to regenerate.
                    </p>
                  </div>
                )}

              </div>
            )}

            {/* ── Card ── */}
            {method === "card" && (
              <div className="flex flex-col gap-4">
                <CardVisual
                  number={cardNumber}
                  name={cardName}
                  expiry={cardExpiry}
                  cvv={cardCvv}
                  flipped={cardFlipped}
                />

                {/* Card number */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
                    Card number <span className="inline-block text-rose-600">*</span>
                  </label>
                  <input
                    className="field font-mono tracking-wider"
                    placeholder="1234  5678  9012  3456"
                    maxLength={19}
                    value={cardNumber}
                    inputMode="numeric"
                    onChange={(e) => { setCardNumber(formatCardInput(e.target.value)); setError(null); }}
                  />
                </div>

                {/* Cardholder name */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
                    Cardholder name <span className="inline-block text-rose-600">*</span>
                  </label>
                  <input
                    className="field uppercase tracking-widest"
                    placeholder="NAME ON CARD"
                    value={cardName}
                    onChange={(e) => { setCardName(e.target.value.toUpperCase()); setError(null); }}
                  />
                </div>

                {/* Expiry + CVV */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
                      Expiry <span className="inline-block text-rose-600">*</span>
                    </label>
                    <input
                      className="field font-mono"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardExpiry}
                      inputMode="numeric"
                      onChange={(e) => { setCardExpiry(formatExpiry(e.target.value)); setError(null); }}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
                      CVV <span className="inline-block text-rose-600">*</span>
                    </label>
                    <input
                      className="field font-mono tracking-[0.4em]"
                      placeholder="•••"
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      inputMode="numeric"
                      onFocus={() => setCardFlipped(true)}
                      onBlur={() => setCardFlipped(false)}
                      onChange={(e) => { setCardCvv(e.target.value.replace(/\D/g, "")); setError(null); }}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-stone-400 leading-relaxed">
                  🔒 Card data is tokenised by Razorpay's PCI-DSS-compliant vault and never stored on OralScan servers.
                </p>
              </div>
            )}

            {/* ── Netbanking ── */}
            {method === "netbanking" && (
              <div className="flex flex-col gap-4">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Popular banks</p>
                  <div className="grid grid-cols-4 gap-2">
                    {POPULAR_BANKS.map((bank) => (
                      <button
                        key={bank.code}
                        onClick={() => { setSelectedBank(selectedBank === bank.code ? "" : bank.code); setError(null); }}
                        className={`rounded-xl border py-2.5 text-xs font-bold transition-all focus:outline-none ${
                          selectedBank === bank.code
                            ? "border-stone-900 bg-stone-900 text-white"
                            : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100"
                        }`}
                      >
                        {bank.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
                    All banks
                  </label>
                  <select
                    className="field"
                    value={selectedBank}
                    onChange={(e) => { setSelectedBank(e.target.value); setError(null); }}
                  >
                    <option value="">— Select your bank —</option>
                    {ALL_BANKS.map((b) => (
                      <option key={b.code} value={b.code}>{b.name}</option>
                    ))}
                  </select>
                </div>

                {selectedBank && (
                  <div className="rounded-xl border border-emerald-300/60 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 font-medium">
                    ✓ Selected: {ALL_BANKS.find((b) => b.code === selectedBank)?.name}
                  </div>
                )}
              </div>
            )}

            {/* Security badge */}
            <div className="rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-xs text-stone-500 leading-relaxed">
              <span className="font-bold text-stone-700">🔒 Secured by Razorpay · </span>
              PCI DSS compliant. Your payment details are never stored on our servers.
            </div>

            {/* Processing indicator */}
            {processing && (
              <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                <svg className="h-4 w-4 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                </svg>
                Initialising secure payment…
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-rose-300/60 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              className="action-button w-full"
              disabled={!qualityResult?.passed || paymentComplete || processing}
              onClick={handlePayment}
            >
              {btnLabel}
            </button>

            {!qualityResult?.passed && (
              <p className="text-center text-xs text-rose-600">
                Complete the quality check before proceeding.
              </p>
            )}
          </div>
        </div>
      </Panel>
    </Layout>
  );
}


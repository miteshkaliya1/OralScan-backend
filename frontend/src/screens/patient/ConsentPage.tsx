import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { useApp } from "../../context/AppContext";
import { appCopy } from "../../data/content";

// Bilingual consent content — always shown in both EN and GU
const CONSENT_ITEMS: Array<{
  icon: string;
  category: string;
  en: string;
  gu: string;
}> = [
  {
    icon: "🤖",
    category: "AI Limitation · AI મર્યાદા",
    en: "AI screening is a supportive tool, not a substitute for professional medical diagnosis. Results must be interpreted by a qualified clinician before any treatment decision is made.",
    gu: "AI સ્ક્રીનિંગ એ એક સહાયક સાધન છે, વ્યાવસાયિક તબીબી નિદાનનો વિકલ્પ નથી. કોઈ પણ સારવારનો નિર્ણય લેતા પહેલા લાયક ચિકિત્સક દ્વારા પરિણામોનું અર્થઘટન થવું જોઈએ.",
  },
  {
    icon: "🔒",
    category: "Data Privacy · ડેટા ગોપનીયતા",
    en: "Your oral cavity images, personal details, and health history are encrypted and securely stored in compliance with applicable data protection laws. Your data is used solely for screening purposes.",
    gu: "તમારી ઓરલ કેવિટી ઇમેજ, વ્યક્તિગત વિગતો અને સ્વાસ્થ્ય ઇતિહાસ એન્ક્રિપ્ટ કરીને સુરક્ષિત રીતે સંગ્રહિત છે. ડેટા ફક્ત સ્ક્રીનિંગ હેતુ માટે ઉપયોગ કરવામાં આવે છે.",
  },
  {
    icon: "👨‍⚕️",
    category: "Clinical Review · ક્લિનિકલ સમીક્ષા",
    en: "A certified oral surgeon or oncologist may review your submitted images and provide clinical feedback. This review is advisory and non-binding.",
    gu: "પ્રમાણિત ઓરલ સર્જન અથવા ઓન્કોલોજિસ્ટ તમારી ઇમેજ સમીક્ષા કરી ક્લિનિકલ ફીડબેક આપી શકે છે. આ સમીક્ષા સલાહકારી છે અને બંધનકારક નથી.",
  },
  {
    icon: "⚠️",
    category: "Scope of Detection · શોધની સીમા",
    en: "OralScan detects early signs of oral lesions, leukoplakia, and tobacco-related conditions. It does not diagnose cancer. A clinical examination and biopsy are required for confirmation.",
    gu: "OralScan ઓરલ ઘા, લ્યુકોપ્લાકિયા અને તમાકુ-સંબંધિત સ્થિતિઓના પ્રારંભિક સંકેતો શોધે છે. તે કેન્સરનું નિદાન કરતું નથી. પુષ્ટિ માટે ક્લિનિકલ તપાસ અને બાયોપ્સી ફરજિયાત છે.",
  },
  {
    icon: "📊",
    category: "Data Usage · ડેટા ઉપયોગ",
    en: "Your case data — including images and AI findings — may be anonymised and used to improve AI model accuracy. No personally identifiable information is shared with third parties.",
    gu: "તમારો કેસ ડેટા — ઇમેજ અને AI તારણ — AI મોડેલ સુધારવા માટે અનામી રૂપે ઉપયોગ થઈ શકે છે. કોઈ પણ વ્યક્તિ-ઓળખ માહિતી ત્રીજા પક્ષ સાથે શેર કરવામાં આવતી નથી.",
  },
  {
    icon: "↩️",
    category: "Right to Withdraw · પાછી ખેંચવાનો અધિકાર",
    en: "You may withdraw consent at any time by contacting OralScan support. Withdrawal does not affect any care already provided.",
    gu: "તમે OralScan સહાય ટીમ સાથે સંપર્ક કરીને ગમે ત્યારે સંમતિ પાછી ખેંચી શકો છો. પાછી ખેંચવાથી અગાઉ આપવામાં આવેલી સંભાળ પ્રભાવિત થતી નથી.",
  },
  {
    icon: "🏥",
    category: "Emergency Notice · ઇમર્જન્સી સૂચના",
    en: "For emergency symptoms — rapid swelling, severe pain, or difficulty swallowing — please contact a hospital immediately. Do not rely on this platform for emergencies.",
    gu: "ઇમર્જન્સી લક્ષણો — ઝડપી સોજો, ગંભીર દુખાવો, ગળવામાં તકલીફ — માટે તાત્કાલિક હોસ્પિટલ સાથે સંપર્ક કરો. ઇમર્જન્સી માટે આ પ્લેટફૉર્મ પર આધાર ન રાખો.",
  },
  {
    icon: "📋",
    category: "Eligibility · પાત્રતા",
    en: "By consenting, you confirm that you are 18 years of age or older, or are a legal guardian providing consent on behalf of a minor patient.",
    gu: "સંમતિ આપીને, તમે ખાતરી આપો છો કે તમારી ઉંમર 18 વર્ષ અથવા તેથી વધુ છે, અથવા તમે સગીર દર્દી વતી સંમતિ આપતા કાનૂની વાલી છો.",
  },
];

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
      <div className="mx-auto max-w-3xl">
        {/* ── Header card ── */}
        <div className="overflow-hidden rounded-[2rem] border border-stone-900/10 shadow-[0_20px_60px_rgba(111,29,27,0.10)]">
          <div className="h-1.5 w-full bg-[linear-gradient(90deg,#6f1d1b,#b6462b,#d7a83d)]" />
          <div className="bg-white px-7 py-6 sm:px-10 sm:py-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-stone-900 text-xl font-bold text-white shadow-lg">
                📃
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">
                  OralScan · {copy.patientPortal}
                </p>
                <h1 className="mt-0.5 font-display text-2xl font-semibold text-stone-950 leading-snug">
                  Informed Consent for Oral Cancer Screening
                </h1>
                <p className="mt-0.5 text-sm font-medium text-stone-600">
                  ઓરલ કેન્સર સ્ક્રીનિંગ માટે જાણકાર સંમતિ
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 space-y-1.5">
              <p className="text-xs text-amber-900 leading-relaxed">
                <span className="font-bold">EN:</span> Please read all terms carefully. Consent is required before proceeding with your screening.
              </p>
              <p className="text-xs text-amber-900 leading-relaxed">
                <span className="font-bold">ગુ:</span> કૃપા કરીને તમામ શરતો કાળજીપૂર્વક વાંચો. આગળ વધવા માટે સંમતિ ફરજિયાત છે.
              </p>
            </div>
          </div>
        </div>

        {/* ── Bilingual consent items ── */}
        <div className="mt-4 space-y-3">
          {CONSENT_ITEMS.map((item, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-stone-900/10 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Category header */}
              <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50/80 px-5 py-2.5">
                <span className="text-base">{item.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500">{item.category}</span>
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-[10px] font-bold text-white shrink-0">{i + 1}</span>
              </div>

              {/* Bilingual body — English left, Gujarati right */}
              <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
                <div className="px-5 py-4">
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">English</p>
                  <p className="text-sm leading-relaxed text-stone-700">{item.en}</p>
                </div>
                <div className="px-5 py-4 bg-orange-50/40">
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-orange-600">ગુજરાતી</p>
                  <p className="text-sm leading-relaxed text-stone-700">{item.gu}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Previously consented banner ── */}
        {consentTimestamp && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3">
            <span className="text-emerald-600 text-lg">✓</span>
            <p className="text-sm text-emerald-800">
              Previously consented on <span className="font-semibold">{consentTimestamp}</span>
            </p>
          </div>
        )}

        {/* ── Agreement + CTA ── */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-stone-900/10 bg-white shadow-sm">
          <div className="px-6 py-5">
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
              <div>
                <p className="text-sm font-semibold leading-relaxed text-stone-800">
                  I have read and agree to all the above terms.
                </p>
                <p className="mt-0.5 text-sm text-stone-600 leading-relaxed">
                  મેં ઉપરની તમામ શરતો વાંચી અને સ્વીકાર કરું છું.
                </p>
              </div>
            </label>
          </div>

          <div className="border-t border-stone-100 bg-stone-50/60 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              className="action-button shrink-0"
              disabled={!checked}
              onClick={handleConsent}
            >
              Agree &amp; Continue / સ્વીકૃત →
            </button>
            <p className="text-xs text-stone-400 leading-relaxed">
              Your consent will be recorded with a timestamp for medical audit purposes.{" "}
              <span className="text-stone-400">· તમારી સંમતિ મેડિકલ ઓડિટ માટે ટાઇમસ્ટેમ્પ સાથે નોંધવામાં આવશે.</span>
            </p>
          </div>
        </div>

        {/* ── Disclaimer strip ── */}
        <div className="mt-4 mb-8 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-3 text-xs text-stone-500 leading-relaxed">
          <span className="font-bold text-stone-700">Disclaimer / અસ્વીકરણ: </span>
          OralScan is a screening support system only. It does not replace clinical diagnosis, biopsy, or emergency medical care. ·{" "}
          OralScan ફક્ત સ્ક્રીનિંગ સહાય પ્રણાલી છે. તે ક્લિનિકલ નિદાન, બાયોપ્સી અથવા ઇમર્જન્સી સારવારનું સ્થાન લઈ શકતું નથી.
        </div>
      </div>
    </Layout>
  );
}

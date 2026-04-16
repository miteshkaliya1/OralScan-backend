import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useApp } from "../context/AppContext";
import { appCopy, complianceItems, futureEnhancements, pipelineSteps } from "../data/content";

const STATS = [
  { value: "94%", label: "AI accuracy (OSCC detection)" },
  { value: "< 5 min", label: "End-to-end screening time" },
  { value: "₹499", label: "Per screening, all inclusive" },
];

export default function Landing() {
  const { language } = useApp();
  const copy = appCopy[language];
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col gap-7">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[2rem] border border-stone-900/10 bg-[linear-gradient(135deg,#6f1d1b_0%,#b6462b_45%,#e4b85d_100%)] text-white shadow-[0_30px_90px_rgba(111,29,27,0.28)]">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -right-20 -top-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-40 w-40 -translate-x-1/2 translate-y-1/2 rounded-full border border-white/15" />
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 translate-x-1/3 -translate-y-1/3 rounded-full border border-white/10" />

          <div className="relative grid gap-8 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-10">
            <div>
              <span className="inline-block rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
                {copy.heroKicker}
              </span>
              <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                {copy.heroTitle}
              </h1>
              <p className="mt-4 max-w-xl text-base text-white/82 md:text-lg">{copy.heroBody}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  className="rounded-full bg-white px-7 py-4 text-sm font-bold text-stone-950 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
                  onClick={() => navigate("/patient/login")}
                >
                  {copy.patientPortal} →
                </button>
                <button
                  className="rounded-full border border-white/30 bg-white/10 px-7 py-4 text-sm font-bold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
                  onClick={() => navigate("/doctor/login")}
                >
                  {copy.doctorPortal}
                </button>
              </div>
            </div>

            {/* Stats sidebar */}
            <div className="grid gap-3 md:w-56">
              {STATS.map((stat) => (
                <div
                  key={stat.value}
                  className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                >
                  <p className="font-display text-2xl font-semibold text-white">{stat.value}</p>
                  <p className="mt-1 text-xs text-white/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer inside hero */}
          <div className="border-t border-white/10 px-6 py-3 md:px-10">
            <p className="text-xs text-white/55">{copy.disclaimer}</p>
          </div>
        </section>

        {/* Info cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="glass rounded-[2rem] border border-stone-900/10 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">
              {copy.pipeline}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {pipelineSteps.map((step, i) => (
                <span
                  key={step}
                  className="flex items-center gap-2 rounded-full border border-stone-900/10 bg-stone-50 px-3.5 py-2 text-sm text-stone-700"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-200 text-[10px] font-bold text-stone-600">
                    {i + 1}
                  </span>
                  {step}
                </span>
              ))}
            </div>
          </div>

          <div className="glass rounded-[2rem] border border-stone-900/10 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">
              {copy.compliance}
            </p>
            <div className="mt-4 space-y-2">
              {complianceItems.map((item) => (
                <p
                  key={item}
                  className="flex items-center gap-2.5 rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm text-stone-700"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="glass rounded-[2rem] border border-stone-900/10 p-6 sm:col-span-2 lg:col-span-1">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">
              {copy.future}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {futureEnhancements.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-900"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

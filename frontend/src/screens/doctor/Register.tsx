import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { useApp } from "../../context/AppContext";
import { appCopy } from "../../data/content";
import { register } from "../../lib/api";

export default function DoctorRegister() {
  const { language, setSession, refreshDoctorCases } = useApp();
  const copy = appCopy[language];
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    try {
      setLoading(true);
      setError(null);
      const auth = await register({ name, email, password, role: "DOCTOR" });
      setSession(auth.token, auth.user);
      await refreshDoctorCases();
      navigate("/doctor");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-md">
        <div className="glass overflow-hidden rounded-[2rem] border border-stone-900/10 shadow-[0_20px_60px_rgba(29,58,111,0.10)]">
          <div className="h-1.5 bg-[linear-gradient(90deg,#1d3a6f,#2b6bb6,#3d8dcf)]" />
          <div className="p-7 sm:p-9">
            <div className="mb-7 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-stone-900 font-display text-xl font-bold text-white shadow-lg">
                Dr
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">
                  {copy.doctorPortal}
                </p>
                <h2 className="font-display text-2xl font-semibold text-stone-950 mt-0.5">Create clinician account</h2>
              </div>
            </div>

            <p className="mb-6 text-sm text-stone-500 leading-relaxed">
              Register a clinician account to review cases, trigger AI analysis, and send patient feedback.
            </p>

            <div className="grid gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Clinician name</label>
                <input className="field" onChange={(e) => setName(e.target.value)} placeholder="Full name" value={name} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Hospital email</label>
                <input className="field" onChange={(e) => setEmail(e.target.value)} placeholder="doctor@hospital.com" type="email" value={email} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Password</label>
                <input className="field" onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters" type="password" value={password} />
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-rose-700">{error}</p>}

            <button className="action-button mt-6 w-full" disabled={loading} onClick={handleRegister}>
              {loading ? "Please wait..." : "Create account →"}
            </button>

            <p className="mt-5 text-center text-xs text-stone-500">
              Already have an account? <button className="font-bold text-stone-900 hover:underline" onClick={() => navigate("/doctor/login")}>Sign in</button>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

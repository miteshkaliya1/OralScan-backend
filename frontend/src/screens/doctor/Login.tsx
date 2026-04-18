import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { useApp } from "../../context/AppContext";
import { appCopy } from "../../data/content";
import { login } from "../../lib/api";

export default function DoctorLogin() {
  const { language, setSession, refreshDoctorCases } = useApp();
  const copy = appCopy[language];
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);
      setError(null);

      const auth = await login({ identifier, password });

      setSession(auth.token, auth.user);
      await refreshDoctorCases();
      navigate("/doctor");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-md">
        <div className="glass rounded-[2rem] border border-stone-900/10 overflow-hidden shadow-[0_20px_60px_rgba(29,58,111,0.10)]">
          <div className="h-1.5 bg-[linear-gradient(90deg,#1d3a6f,#2b6bb6,#3d8dcf)]" />
          <div className="p-7 sm:p-9">
            <div className="mb-7 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-900 text-white text-lg font-bold font-display shrink-0 shadow-lg">
                Dr
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">
                  {copy.doctorPortal}
                </p>
                <h2 className="font-display text-2xl font-semibold text-stone-950 mt-0.5">{copy.doctorAuth}</h2>
              </div>
            </div>

            <p className="mb-6 text-sm text-stone-500 leading-relaxed">
              Sign in with your registered surgeon or clinician credentials.
            </p>

            <div className="grid gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Hospital email</label>
                <input className="field" onChange={(e) => setIdentifier(e.target.value)} placeholder="doctor@hospital.com" type="email" value={identifier} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Password</label>
                <input className="field" onChange={(e) => setPassword(e.target.value)} placeholder="Your password" type="password" value={password} />
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-rose-700">{error}</p>}

            <button className="action-button mt-6 w-full" disabled={loading} onClick={handleLogin}>
              {loading ? "Please wait..." : `${copy.doctorAuth} →`}
            </button>

            <p className="mt-5 text-center text-xs text-stone-500">
              New clinician? <button className="font-bold text-stone-900 hover:underline" onClick={() => navigate("/doctor/register")}>Create an account</button>
            </p>

            <p className="mt-2 text-center text-xs text-stone-400">
              HIPAA-compliant authentication. Session expires after 8 hours.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

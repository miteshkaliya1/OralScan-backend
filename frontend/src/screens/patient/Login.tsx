import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { useApp } from "../../context/AppContext";
import { appCopy } from "../../data/content";
import { login } from "../../lib/api";

export default function PatientLogin() {
  const { language, setSession } = useApp();
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
      navigate("/patient");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-md">
        <div className="glass rounded-[2rem] border border-stone-900/10 overflow-hidden">
          {/* Top accent */}
          <div className="h-1.5 w-full bg-[linear-gradient(90deg,#6f1d1b,#b6462b,#d7a83d)]" />
          <div className="p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-900 text-white text-lg font-bold font-display shrink-0">
                O
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                  {copy.patientPortal}
                </p>
                <h2 className="font-display text-2xl font-semibold text-stone-950">{copy.patientAuth}</h2>
              </div>
            </div>

            <p className="mb-5 text-sm text-stone-500">
              Sign in with your registered patient account credentials.
            </p>

            <div className="grid gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Mobile number / Email</label>
                <input
                  className="field"
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter mobile or email"
                  type="text"
                  value={identifier}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Password</label>
                <input
                  className="field"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  type="password"
                  value={password}
                />
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-rose-700">{error}</p>}

            <button className="action-button mt-6 w-full" disabled={loading} onClick={handleLogin}>
              {loading ? "Please wait..." : `${copy.patientAuth} →`}
            </button>

            <p className="mt-5 text-center text-xs text-stone-500">
              New patient? <button className="font-bold text-stone-900 hover:underline" onClick={() => navigate("/patient/register")}>Create an account</button>
            </p>

            <p className="mt-2 text-center text-xs text-stone-400">
              Authentication connects directly to the backend API.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

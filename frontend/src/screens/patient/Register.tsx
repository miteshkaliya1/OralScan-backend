import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { useApp } from "../../context/AppContext";
import { appCopy } from "../../data/content";
import { register } from "../../lib/api";

type FieldErrors = Partial<Record<
  "name" | "identifier" | "mobile" | "email" | "age" | "gender" | "address" | "tobaccoGutkaHistory" | "password",
  string
>>;

function validateForm(fields: {
  name: string; mobileNumber: string; email: string; password: string;
  age: string; address: string;
}): FieldErrors {
  const errs: FieldErrors = {};
  if (!fields.name.trim()) errs.name = "Full name is required.";
  if (!fields.mobileNumber.trim() && !fields.email.trim())
    errs.identifier = "Provide at least a mobile number or email.";
  if (fields.mobileNumber.trim() && !/^\d{10,15}$/.test(fields.mobileNumber.replace(/\D/g, "")))
    errs.mobile = "Enter a valid 10-15 digit mobile number.";
  if (fields.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()))
    errs.email = "Enter a valid email address.";
  const ageNum = Number(fields.age);
  if (!fields.age || isNaN(ageNum) || ageNum < 1 || ageNum > 120)
    errs.age = "Enter a valid age between 1 and 120.";
  if (!fields.address.trim() || fields.address.trim().length < 5)
    errs.address = "Please enter a complete address.";
  if (fields.password.length < 8)
    errs.password = "Password must be at least 8 characters.";
  return errs;
}

export default function PatientRegister() {
  const { language, setSession } = useApp();
  const copy = appCopy[language];
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY">("PREFER_NOT_TO_SAY");
  const [address, setAddress] = useState("");
  const [tobaccoGutkaHistory, setTobaccoGutkaHistory] = useState<"NEVER" | "FORMER" | "OCCASIONAL" | "DAILY">("NEVER");
  const [tobaccoGutkaDetails, setTobaccoGutkaDetails] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function touch(field: keyof FieldErrors) {
    const errs = validateForm({ name, mobileNumber, email, password, age, address });
    setFieldErrors((prev) => ({ ...prev, [field]: errs[field] }));
  }

  async function handleRegister() {
    const errs = validateForm({ name, mobileNumber, email, password, age, address });
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    try {
      setLoading(true);
      setSubmitError(null);
      const auth = await register({
        name,
        email: email.trim() || undefined,
        mobileNumber: mobileNumber.trim() || undefined,
        password,
        role: "PATIENT",
        age: Number(age),
        gender,
        address,
        tobaccoGutkaHistory,
        tobaccoGutkaDetails: tobaccoGutkaDetails.trim() || undefined,
      });
      setSession(auth.token, auth.user);
      navigate("/patient");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-lg">
        <div className="glass overflow-hidden rounded-[2rem] border border-stone-900/10 shadow-[0_20px_60px_rgba(111,29,27,0.12)]">
          <div className="h-1.5 w-full bg-[linear-gradient(90deg,#6f1d1b,#b6462b,#d7a83d)]" />
          <div className="p-7 sm:p-9">
            <div className="mb-7 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-stone-900 font-display text-xl font-bold text-white shadow-lg">
                O
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">
                  {copy.patientPortal}
                </p>
                <h2 className="font-display text-2xl font-semibold text-stone-950 mt-0.5">Create patient account</h2>
              </div>
            </div>

            <p className="mb-6 text-sm text-stone-500 leading-relaxed">
              Register your patient account to start oral screening, share better risk context, and track reports.
            </p>

            <div className="mb-5 rounded-2xl border border-amber-300/70 bg-amber-50/80 px-4 py-3 text-xs text-amber-900">
              Use either mobile number or email to create your account. Adding both is recommended.
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Full name */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Full name *</label>
                <input
                  className={`field ${fieldErrors.name ? "border-rose-400 focus:border-rose-500" : ""}`}
                  onBlur={() => touch("name")}
                  onChange={(e) => { setName(e.target.value); setFieldErrors((p) => ({ ...p, name: undefined })); }}
                  placeholder="Full name"
                  value={name}
                />
                {fieldErrors.name && <p className="mt-1 text-xs text-rose-600">{fieldErrors.name}</p>}
              </div>

              {/* Mobile */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Mobile number</label>
                <input
                  className={`field ${fieldErrors.mobile || fieldErrors.identifier ? "border-rose-400" : ""}`}
                  onBlur={() => { touch("mobile"); touch("identifier"); }}
                  onChange={(e) => { setMobileNumber(e.target.value); setFieldErrors((p) => ({ ...p, mobile: undefined, identifier: undefined })); }}
                  placeholder="10-digit mobile number"
                  type="tel"
                  value={mobileNumber}
                />
                {fieldErrors.mobile && <p className="mt-1 text-xs text-rose-600">{fieldErrors.mobile}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Email address</label>
                <input
                  className={`field ${fieldErrors.email || fieldErrors.identifier ? "border-rose-400" : ""}`}
                  onBlur={() => { touch("email"); touch("identifier"); }}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined, identifier: undefined })); }}
                  placeholder="Email address"
                  type="email"
                  value={email}
                />
                {fieldErrors.email && <p className="mt-1 text-xs text-rose-600">{fieldErrors.email}</p>}
              </div>

              {/* Identifier-level error (neither provided) */}
              {fieldErrors.identifier && !fieldErrors.mobile && !fieldErrors.email && (
                <p className="sm:col-span-2 -mt-2 text-xs text-rose-600">{fieldErrors.identifier}</p>
              )}

              {/* Age */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Age *</label>
                <input
                  className={`field ${fieldErrors.age ? "border-rose-400" : ""}`}
                  min={1}
                  onBlur={() => touch("age")}
                  onChange={(e) => { setAge(e.target.value); setFieldErrors((p) => ({ ...p, age: undefined })); }}
                  placeholder="Your age"
                  type="number"
                  value={age}
                />
                {fieldErrors.age && <p className="mt-1 text-xs text-rose-600">{fieldErrors.age}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Gender *</label>
                <select
                  className="field"
                  onChange={(e) => setGender(e.target.value as "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY")}
                  value={gender}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Address *</label>
                <textarea
                  className={`field min-h-[90px] resize-y ${fieldErrors.address ? "border-rose-400" : ""}`}
                  onBlur={() => touch("address")}
                  onChange={(e) => { setAddress(e.target.value); setFieldErrors((p) => ({ ...p, address: undefined })); }}
                  placeholder="Area, city, district, state"
                  value={address}
                />
                {fieldErrors.address && <p className="mt-1 text-xs text-rose-600">{fieldErrors.address}</p>}
              </div>

              {/* Tobacco / Gutka history */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Tobacco / Gutka history *</label>
                <select
                  className="field"
                  onChange={(e) => setTobaccoGutkaHistory(e.target.value as "NEVER" | "FORMER" | "OCCASIONAL" | "DAILY")}
                  value={tobaccoGutkaHistory}
                >
                  <option value="NEVER">Never</option>
                  <option value="FORMER">Former user</option>
                  <option value="OCCASIONAL">Occasional</option>
                  <option value="DAILY">Daily</option>
                </select>
              </div>

              {/* History details */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">History details <span className="normal-case font-normal text-stone-400">(optional)</span></label>
                <input
                  className="field"
                  onChange={(e) => setTobaccoGutkaDetails(e.target.value)}
                  placeholder="Duration / frequency, if any"
                  value={tobaccoGutkaDetails}
                />
              </div>

              {/* Password */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Password *</label>
                <input
                  className={`field ${fieldErrors.password ? "border-rose-400" : ""}`}
                  onBlur={() => touch("password")}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
                  placeholder="Minimum 8 characters"
                  type="password"
                  value={password}
                />
                {fieldErrors.password && <p className="mt-1 text-xs text-rose-600">{fieldErrors.password}</p>}
              </div>
            </div>

            {submitError && (
              <div className="mt-3 rounded-xl border border-rose-300/60 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {submitError}
              </div>
            )}

            <button className="action-button mt-5 w-full" disabled={loading} onClick={handleRegister}>
              {loading ? "Please wait..." : "Create account →"}
            </button>

            <p className="mt-5 text-center text-xs text-stone-500">
              Already have an account? <button className="font-bold text-stone-900 hover:underline" onClick={() => navigate("/patient/login")}>Sign in</button>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

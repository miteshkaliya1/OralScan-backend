import { Suspense, lazy, type ReactElement } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { useApp } from "./context/AppContext";

const Landing = lazy(() => import("./screens/Landing"));
const PatientLogin = lazy(() => import("./screens/patient/Login"));
const PatientRegister = lazy(() => import("./screens/patient/Register"));
const PatientDashboard = lazy(() => import("./screens/patient/Dashboard"));
const ConsentPage = lazy(() => import("./screens/patient/ConsentPage"));
const ImageUpload = lazy(() => import("./screens/patient/ImageUpload"));
const QualityCheck = lazy(() => import("./screens/patient/QualityCheck"));
const PaymentScreen = lazy(() => import("./screens/patient/PaymentScreen"));
const ResultsPage = lazy(() => import("./screens/patient/ResultsPage"));
const PatientReportDetail = lazy(() => import("./screens/patient/PatientReportDetail"));
const DoctorLogin = lazy(() => import("./screens/doctor/Login"));
const DoctorRegister = lazy(() => import("./screens/doctor/Register"));
const DoctorDashboard = lazy(() => import("./screens/doctor/Dashboard"));
const PatientQueue = lazy(() => import("./screens/doctor/PatientQueue"));
const CaseReview = lazy(() => import("./screens/doctor/CaseReview"));

type AllowedRole = "PATIENT" | "DOCTOR" | "ADMIN";

function RouteFallback() {
  return (
    <div className="section-shell py-16 text-center text-sm text-stone-500">
      Loading interface...
    </div>
  );
}

function RequireAuth({ allowedRoles, children }: { allowedRoles: AllowedRole[]; children: ReactElement }) {
  const { authReady, currentUser } = useApp();

  if (!authReady) {
    return (
      <div className="section-shell py-16 text-center text-sm text-stone-500">
        Restoring your secure session...
      </div>
    );
  }

  if (!currentUser) {
    const redirectTo = allowedRoles.includes("PATIENT") ? "/patient/login" : "/doctor/login";
    return <Navigate replace to={redirectTo} />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    const redirectTo = currentUser.role === "PATIENT" ? "/patient" : "/doctor";
    return <Navigate replace to={redirectTo} />;
  }

  return children;
}

function AuthOnly({ role, children }: { role: Exclude<AllowedRole, "ADMIN">; children: ReactElement }) {
  const { authReady, currentUser } = useApp();

  if (!authReady) {
    return (
      <div className="section-shell py-16 text-center text-sm text-stone-500">
        Restoring your secure session...
      </div>
    );
  }

  if (!currentUser) {
    return children;
  }

  const redirectTo = currentUser.role === "ADMIN"
    ? role === "PATIENT" ? "/patient" : "/doctor"
    : currentUser.role === "PATIENT" ? "/patient" : "/doctor";
  return <Navigate replace to={redirectTo} />;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/patient/login" element={<AuthOnly role="PATIENT"><PatientLogin /></AuthOnly>} />
            <Route path="/patient/register" element={<AuthOnly role="PATIENT"><PatientRegister /></AuthOnly>} />
            <Route path="/patient" element={<RequireAuth allowedRoles={["PATIENT", "ADMIN"]}><PatientDashboard /></RequireAuth>} />
            <Route path="/patient/consent" element={<RequireAuth allowedRoles={["PATIENT", "ADMIN"]}><ConsentPage /></RequireAuth>} />
            <Route path="/patient/upload" element={<RequireAuth allowedRoles={["PATIENT", "ADMIN"]}><ImageUpload /></RequireAuth>} />
            <Route path="/patient/quality" element={<RequireAuth allowedRoles={["PATIENT", "ADMIN"]}><QualityCheck /></RequireAuth>} />
            <Route path="/patient/payment" element={<RequireAuth allowedRoles={["PATIENT", "ADMIN"]}><PaymentScreen /></RequireAuth>} />
            <Route path="/patient/results" element={<RequireAuth allowedRoles={["PATIENT", "ADMIN"]}><ResultsPage /></RequireAuth>} />
            <Route path="/patient/report/:reportId" element={<RequireAuth allowedRoles={["PATIENT", "ADMIN"]}><PatientReportDetail /></RequireAuth>} />
            <Route path="/doctor/login" element={<AuthOnly role="DOCTOR"><DoctorLogin /></AuthOnly>} />
            <Route path="/doctor/register" element={<AuthOnly role="DOCTOR"><DoctorRegister /></AuthOnly>} />
            <Route path="/doctor" element={<RequireAuth allowedRoles={["DOCTOR", "ADMIN"]}><DoctorDashboard /></RequireAuth>} />
            <Route path="/doctor/queue" element={<RequireAuth allowedRoles={["DOCTOR", "ADMIN"]}><PatientQueue /></RequireAuth>} />
            <Route path="/doctor/review/:caseId" element={<RequireAuth allowedRoles={["DOCTOR", "ADMIN"]}><CaseReview /></RequireAuth>} />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  );
}

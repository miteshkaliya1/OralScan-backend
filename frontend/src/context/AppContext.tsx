import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { type Language, type PatientCase, type QualityResult, type UploadedImage } from "../data/content";
import { getCurrentUser, getMyCases, getStoredToken, mapApiCaseToPatientCase, setStoredToken } from "../lib/api";

type SessionUser = {
  id: string;
  name: string;
  email: string | null;
  mobileNumber: string | null;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  age?: number | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY" | null;
  address?: string | null;
  tobaccoGutkaHistory?: "NEVER" | "FORMER" | "OCCASIONAL" | "DAILY" | null;
  tobaccoGutkaDetails?: string | null;
};

type AppNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  caseId: string;
  targetPath: string;
};

type AppContextValue = {
  language: Language;
  setLanguage: (l: Language) => void;
  patientLoggedIn: boolean;
  setPatientLoggedIn: (v: boolean) => void;
  doctorLoggedIn: boolean;
  setDoctorLoggedIn: (v: boolean) => void;
  consentTimestamp: string | null;
  setConsentTimestamp: (v: string | null) => void;
  uploadedImages: UploadedImage[];
  setUploadedImages: (images: UploadedImage[]) => void;
  uploadedDocuments: UploadedImage[];
  setUploadedDocuments: (docs: UploadedImage[]) => void;
  qualityResult: QualityResult | null;
  setQualityResult: (r: QualityResult | null) => void;
  paymentComplete: boolean;
  setPaymentComplete: (v: boolean) => void;
  generatedCase: PatientCase | null;
  setGeneratedCase: (c: PatientCase | null) => void;
  caseShared: boolean;
  setCaseShared: (v: boolean) => void;
  doctorCases: PatientCase[];
  setDoctorCases: (updater: PatientCase[] | ((prev: PatientCase[]) => PatientCase[])) => void;
  authToken: string | null;
  authReady: boolean;
  currentUser: SessionUser | null;
  setSession: (token: string, user: SessionUser) => void;
  clearSession: () => void;
  refreshDoctorCases: () => Promise<void>;
  refreshPatientCases: () => Promise<void>;
  activeCaseId: string | null;
  setActiveCaseId: (v: string | null) => void;
  patientCases: PatientCase[];
  notifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationsRead: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [patientLoggedIn, setPatientLoggedIn] = useState(false);
  const [doctorLoggedIn, setDoctorLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(getStoredToken());
  const [authReady, setAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [consentTimestamp, setConsentTimestamp] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedImage[]>([]);
  const [qualityResult, setQualityResult] = useState<QualityResult | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [generatedCase, setGeneratedCase] = useState<PatientCase | null>(null);
  const [caseShared, setCaseShared] = useState(false);
  const [doctorCases, setDoctorCasesState] = useState<PatientCase[]>([]);
  const [patientCases, setPatientCases] = useState<PatientCase[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [notificationsReadAt, setNotificationsReadAt] = useState<string | null>(null);
  const refreshDoctorCasesInFlight = useRef<Promise<void> | null>(null);
  const refreshPatientCasesInFlight = useRef<Promise<void> | null>(null);

  const notificationStorageKey = currentUser
    ? `oralscan_notifications_read_${currentUser.role}_${currentUser.id}`
    : null;

  const setDoctorCases = useCallback((updater: PatientCase[] | ((prev: PatientCase[]) => PatientCase[])) => {
    if (typeof updater === "function") {
      setDoctorCasesState(updater);
    } else {
      setDoctorCasesState(updater);
    }
  }, []);

  const setSession = useCallback((token: string, user: SessionUser) => {
    setAuthToken(token);
    setStoredToken(token);
    setCurrentUser(user);
    setPatientLoggedIn(user.role === "PATIENT" || user.role === "ADMIN");
    setDoctorLoggedIn(user.role === "DOCTOR" || user.role === "ADMIN");
  }, []);

  const clearSession = useCallback(() => {
    setAuthToken(null);
    setStoredToken(null);
    setCurrentUser(null);
    setPatientLoggedIn(false);
    setDoctorLoggedIn(false);
    setDoctorCasesState([]);
    setPatientCases([]);
    setActiveCaseId(null);
    setUploadedDocuments([]);
    setNotificationsReadAt(null);
  }, []);

  const markNotificationsRead = useCallback(() => {
    const now = new Date().toISOString();
    setNotificationsReadAt(now);
    if (notificationStorageKey) {
      localStorage.setItem(notificationStorageKey, now);
    }
  }, [notificationStorageKey]);

  useEffect(() => {
    if (!notificationStorageKey) {
      setNotificationsReadAt(null);
      return;
    }
    setNotificationsReadAt(localStorage.getItem(notificationStorageKey));
  }, [notificationStorageKey]);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!authToken) {
        if (!cancelled) {
          setCurrentUser(null);
          setPatientLoggedIn(false);
          setDoctorLoggedIn(false);
          setAuthReady(true);
        }
        return;
      }

      try {
        const response = await getCurrentUser(authToken);
        if (cancelled) return;

        setCurrentUser(response.user);
        setPatientLoggedIn(response.user.role === "PATIENT" || response.user.role === "ADMIN");
        setDoctorLoggedIn(response.user.role === "DOCTOR" || response.user.role === "ADMIN");
      } catch {
        if (cancelled) return;
        clearSession();
      } finally {
        if (!cancelled) {
          setAuthReady(true);
        }
      }
    }

    setAuthReady(false);
    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [authToken, clearSession]);

  const refreshDoctorCases = useCallback(async () => {
    if (refreshDoctorCasesInFlight.current) {
      return refreshDoctorCasesInFlight.current;
    }

    const token = authToken || getStoredToken();
    if (!token) return;

    const request = getMyCases(token)
      .then((rows) => {
        setDoctorCasesState(rows.map(mapApiCaseToPatientCase));
      })
      .finally(() => {
        refreshDoctorCasesInFlight.current = null;
      });

    refreshDoctorCasesInFlight.current = request;
    return request;
  }, [authToken]);

  const refreshPatientCases = useCallback(async () => {
    if (refreshPatientCasesInFlight.current) {
      return refreshPatientCasesInFlight.current;
    }

    const token = authToken || getStoredToken();
    if (!token) return;

    const request = getMyCases(token)
      .then((rows) => {
        setPatientCases(rows.map(mapApiCaseToPatientCase));
      })
      .finally(() => {
        refreshPatientCasesInFlight.current = null;
      });

    refreshPatientCasesInFlight.current = request;
    return request;
  }, [authToken]);

  useEffect(() => {
    if (!authToken || !currentUser) return;

    const run = () => {
      if (currentUser.role === "DOCTOR") {
        void refreshDoctorCases().catch(() => undefined);
      } else if (currentUser.role === "PATIENT") {
        void refreshPatientCases().catch(() => undefined);
      } else {
        void Promise.all([
          refreshDoctorCases().catch(() => undefined),
          refreshPatientCases().catch(() => undefined),
        ]);
      }
    };

    run();
    const timer = window.setInterval(run, 30000);
    return () => window.clearInterval(timer);
  }, [authToken, currentUser, refreshDoctorCases, refreshPatientCases]);

  const notifications = useMemo<AppNotification[]>(() => {
    if (!currentUser) return [];

    if (currentUser.role === "DOCTOR") {
      return doctorCases
        .filter((item) => item.status === "Pending")
        .map((item) => ({
          id: `doctor-${item.id}`,
          title: "New report for review",
          body: `${item.patientName || "A patient"} submitted case ${item.id} for doctor review.`,
          createdAt: item.submittedAt,
          caseId: item.id,
          targetPath: `/doctor/review/${item.id}`,
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return patientCases
      .filter((item) => item.status === "Reviewed" || Boolean(item.reviewedAt))
      .map((item) => ({
        id: `patient-${item.id}`,
        title: "Doctor review available",
        body: `${item.doctorName || "Your doctor"} added review on report ${item.id}.`,
        createdAt: item.reviewedAt || item.submittedAt,
        caseId: item.id,
        targetPath: `/patient/report/${item.id}`,
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [currentUser, doctorCases, patientCases]);

  const unreadNotificationCount = useMemo(() => {
    if (!notificationsReadAt) return notifications.length;
    const seenTs = new Date(notificationsReadAt).getTime();
    return notifications.filter((note) => new Date(note.createdAt).getTime() > seenTs).length;
  }, [notifications, notificationsReadAt]);

  return (
    <AppContext.Provider
      value={{
        language, setLanguage,
        patientLoggedIn, setPatientLoggedIn,
        doctorLoggedIn, setDoctorLoggedIn,
        consentTimestamp, setConsentTimestamp,
        uploadedImages, setUploadedImages,
        uploadedDocuments, setUploadedDocuments,
        qualityResult, setQualityResult,
        paymentComplete, setPaymentComplete,
        generatedCase, setGeneratedCase,
        caseShared, setCaseShared,
        doctorCases, setDoctorCases,
        authToken,
        authReady,
        currentUser,
        setSession,
        clearSession,
        refreshDoctorCases,
        refreshPatientCases,
        activeCaseId,
        setActiveCaseId,
        patientCases,
        notifications,
        unreadNotificationCount,
        markNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { appCopy, languageOptions, type Language } from "../data/content";

const PATIENT_STEPS = [
  { label: "Consent", path: "/patient/consent" },
  { label: "Upload", path: "/patient/upload" },
  { label: "Quality", path: "/patient/quality" },
  { label: "Payment", path: "/patient/payment" },
  { label: "Results", path: "/patient/results" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const {
    language,
    setLanguage,
    patientLoggedIn,
    doctorLoggedIn,
    currentUser,
    clearSession,
    notifications,
    unreadNotificationCount,
    markNotificationsRead,
  } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const copy = appCopy[language];
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on route change
  useEffect(() => {
    setMenuOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  useEffect(() => {
    if (!notificationsOpen) return;
    function handler(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target?.closest('[data-notifications-root="true"]')) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notificationsOpen]);

  const inPatientFlow =
    location.pathname.startsWith("/patient/") &&
    location.pathname !== "/patient/login" &&
    location.pathname !== "/patient/register" &&
    location.pathname !== "/patient";
  const inDoctorPortal =
    location.pathname.startsWith("/doctor/") &&
    location.pathname !== "/doctor/register" &&
    location.pathname !== "/doctor/login";
  const inDoctorDash = location.pathname === "/doctor";
  const isAuthScreen =
    location.pathname === "/patient/login" ||
    location.pathname === "/patient/register" ||
    location.pathname === "/doctor/login" ||
    location.pathname === "/doctor/register";
  const isDev = import.meta.env.DEV;
  const latestNotification = notifications[0];

  function handleLogout() {
    const nextRoute = currentUser?.role === "PATIENT" ? "/patient/login" : "/doctor/login";
    clearSession();
    navigate(nextRoute);
  }

  function toggleNotifications() {
    setNotificationsOpen((open) => {
      const next = !open;
      if (next && unreadNotificationCount > 0) {
        markNotificationsRead();
      }
      return next;
    });
  }

  function handleNotificationClick(targetPath: string) {
    setNotificationsOpen(false);
    navigate(targetPath);
  }

  return (
    <div className="min-h-screen flex flex-col text-stone-900">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 section-shell pt-4">
        <div className="glass mb-4 rounded-[2rem] border border-stone-900/10 px-4 py-3 md:px-7 md:py-4">
          <div className="flex items-center justify-between gap-3">
            {/* Logo */}
            <Link className="flex flex-col shrink-0" to="/">
              <p className="hidden text-[10px] font-semibold uppercase tracking-[0.26em] text-amber-900/70 sm:block">
                {copy.heroKicker}
              </p>
              <span className="font-display text-xl font-semibold md:text-2xl">{copy.appName}</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden items-center gap-2 md:flex">
              {currentUser && (
                <div className="flex items-center gap-2 rounded-full border border-stone-900/10 bg-stone-900 px-3 py-2 text-white">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                    {currentUser.role}
                  </span>
                  <span className="text-sm font-semibold">{currentUser.name}</span>
                </div>
              )}
              <Link
                className={clsx(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  patientLoggedIn
                    ? "bg-emerald-100 text-emerald-900"
                    : "border border-stone-900/10 bg-white/90 text-stone-700 hover:bg-white",
                )}
                to={patientLoggedIn ? "/patient" : "/patient/login"}
              >
                {copy.patientPortal}
              </Link>
              <Link
                className={clsx(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  doctorLoggedIn
                    ? "bg-emerald-100 text-emerald-900"
                    : "border border-stone-900/10 bg-white/90 text-stone-700 hover:bg-white",
                )}
                to={doctorLoggedIn ? "/doctor" : "/doctor/login"}
              >
                {copy.doctorPortal}
              </Link>
              {currentUser && (
                <div className="relative" data-notifications-root="true">
                  <button
                    aria-label="Open notifications"
                    className="relative flex h-10 w-10 items-center justify-center rounded-full border border-stone-900/10 bg-white/90 text-lg transition-colors hover:bg-stone-100"
                    onClick={toggleNotifications}
                  >
                    🔔
                    {unreadNotificationCount > 0 && (
                      <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-600 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                        {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                      </span>
                    )}
                  </button>
                  {notificationsOpen && (
                    <div className="absolute right-0 top-12 z-50 w-80 max-w-[86vw] rounded-2xl border border-stone-900/10 bg-white p-3 shadow-2xl">
                      <p className="px-2 pb-2 text-xs font-bold uppercase tracking-[0.15em] text-stone-500">Notifications</p>
                      {notifications.length === 0 ? (
                        <div className="rounded-xl bg-stone-50 px-3 py-4 text-sm text-stone-500">No notifications yet.</div>
                      ) : (
                        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                          {notifications.slice(0, 12).map((note) => (
                            <button
                              key={note.id}
                              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-left transition hover:border-stone-300 hover:bg-stone-100"
                              onClick={() => handleNotificationClick(note.targetPath)}
                            >
                              <p className="text-xs font-bold uppercase tracking-[0.08em] text-stone-500">{note.title}</p>
                              <p className="mt-1 text-sm text-stone-700">{note.body}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center gap-1.5 rounded-full border border-stone-900/10 bg-white/80 px-3 py-2">
                <span className="text-xs font-medium text-stone-500">{copy.language}</span>
                <select
                  className="bg-transparent px-1 text-sm outline-none"
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  value={language}
                >
                  {languageOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {currentUser && (
                <button
                  className="rounded-full border border-stone-900/10 bg-white/90 px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              )}
            </div>

            {/* Mobile: language select + hamburger */}
            <div className="relative flex items-center gap-2 md:hidden">
              <select
                className="rounded-full border border-stone-900/10 bg-white/90 px-2.5 py-1.5 text-sm outline-none"
                onChange={(e) => setLanguage(e.target.value as Language)}
                value={language}
              >
                {languageOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {currentUser && (
                <div className="relative" data-notifications-root="true">
                  <button
                    aria-label="Open notifications"
                    className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-stone-900/10 bg-white/90 text-base"
                    onClick={toggleNotifications}
                  >
                    🔔
                    {unreadNotificationCount > 0 && (
                      <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-600 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                        {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                      </span>
                    )}
                  </button>
                  {notificationsOpen && (
                    <div className="absolute right-0 top-12 z-50 w-80 max-w-[88vw] rounded-2xl border border-stone-900/10 bg-white p-3 shadow-2xl">
                      <p className="px-2 pb-2 text-xs font-bold uppercase tracking-[0.15em] text-stone-500">Notifications</p>
                      {notifications.length === 0 ? (
                        <div className="rounded-xl bg-stone-50 px-3 py-4 text-sm text-stone-500">No notifications yet.</div>
                      ) : (
                        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                          {notifications.slice(0, 12).map((note) => (
                            <button
                              key={note.id}
                              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-left transition hover:border-stone-300 hover:bg-stone-100"
                              onClick={() => handleNotificationClick(note.targetPath)}
                            >
                              <p className="text-xs font-bold uppercase tracking-[0.08em] text-stone-500">{note.title}</p>
                              <p className="mt-1 text-sm text-stone-700">{note.body}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div ref={menuRef}>
              <button
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-2xl border border-stone-900/10 bg-white/90"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <span className={clsx("h-0.5 w-5 rounded-full bg-stone-800 transition-transform duration-200", menuOpen && "translate-y-[5.5px] rotate-45")} />
                <span className={clsx("h-0.5 w-5 rounded-full bg-stone-800 transition-opacity duration-200", menuOpen && "opacity-0")} />
                <span className={clsx("h-0.5 w-5 rounded-full bg-stone-800 transition-transform duration-200", menuOpen && "-translate-y-[5.5px] -rotate-45")} />
              </button>
              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 top-12 z-50 w-56 glass rounded-[1.5rem] border border-stone-900/10 p-3 shadow-xl">
                  <div className="flex flex-col gap-1">
                    {currentUser && (
                      <div className="rounded-xl bg-stone-900 px-4 py-3 text-white">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
                          {currentUser.role}
                        </p>
                        <p className="mt-1 text-sm font-semibold">{currentUser.name}</p>
                      </div>
                    )}
                    <Link
                      className={clsx(
                        "rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                        patientLoggedIn ? "bg-emerald-100 text-emerald-900" : "text-stone-700 hover:bg-stone-100",
                      )}
                      to={patientLoggedIn ? "/patient" : "/patient/login"}
                    >
                      {copy.patientPortal}
                    </Link>
                    <Link
                      className={clsx(
                        "rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                        doctorLoggedIn ? "bg-emerald-100 text-emerald-900" : "text-stone-700 hover:bg-stone-100",
                      )}
                      to={doctorLoggedIn ? "/doctor" : "/doctor/login"}
                    >
                      {copy.doctorPortal}
                    </Link>
                    <Link className="rounded-xl px-4 py-3 text-sm text-stone-500 hover:bg-stone-100" to="/">
                      Home
                    </Link>
                    {currentUser && (
                      <button
                        className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100"
                        onClick={handleLogout}
                      >
                        Log out
                      </button>
                    )}
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
        {isDev && currentUser && (
          <div className="mb-3 rounded-2xl border border-sky-200 bg-sky-50/80 px-4 py-2 text-xs text-sky-900">
            <span className="font-semibold">QA notifications:</span>{" "}
            total {notifications.length}, unread {unreadNotificationCount}
            {latestNotification ? (
              <>
                {" "}| latest: {latestNotification.title} ({new Date(latestNotification.createdAt).toLocaleString()})
              </>
            ) : (
              " | latest: none"
            )}
          </div>
        )}
      </header>

      {inPatientFlow && <PatientStepBar currentPath={location.pathname} />}
      {(inDoctorPortal || inDoctorDash) && <DoctorNav currentPath={location.pathname} />}

      <main
        className={clsx(
          "section-shell flex-1 page-enter",
          isAuthScreen
            ? "mt-14 mb-10 md:mt-18 md:mb-12"
            : inPatientFlow || inDoctorPortal || inDoctorDash
              ? "mt-12 mb-10"
              : "mt-12 mb-10",
        )}
      >
        {children}
      </main>

      <footer className="section-shell pb-6">
        <p className="rounded-2xl border border-stone-900/10 bg-white/50 px-5 py-3 text-center text-xs text-stone-500">
          {copy.disclaimer}
        </p>
      </footer>
    </div>
  );
}

function PatientStepBar({ currentPath }: { currentPath: string }) {
  const stepIndex = PATIENT_STEPS.findIndex((s) => s.path === currentPath);
  return (
    <div className="section-shell mt-4 mb-8">
      <div className="glass flex items-center rounded-[1.5rem] border border-stone-900/10 px-4 py-3.5">
        {PATIENT_STEPS.map((step, i) => (
          <div key={step.path} className="flex flex-1 items-center">
            <div className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={clsx(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0 transition-all duration-300",
                  i === stepIndex
                    ? "bg-stone-900 text-white shadow-lg ring-4 ring-stone-900/15"
                    : i < stepIndex
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "bg-stone-100 text-stone-400 border border-stone-200",
                )}
              >
                {i < stepIndex ? "✓" : i + 1}
              </div>
              <span
                className={clsx(
                  "hidden text-[10px] font-bold sm:block tracking-[0.12em] uppercase",
                  i === stepIndex ? "text-stone-900" : i < stepIndex ? "text-emerald-600" : "text-stone-400",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < PATIENT_STEPS.length - 1 && (
              <div
                className={clsx(
                  "mb-5 h-0.5 w-4 shrink-0 rounded-full transition-colors duration-300 sm:w-8",
                  i < stepIndex ? "bg-emerald-400" : "bg-stone-200",
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DoctorNav({ currentPath }: { currentPath: string }) {
  const { language } = useApp();
  const copy = appCopy[language];
  const onQueue =
    currentPath.startsWith("/doctor/queue") || currentPath.startsWith("/doctor/review");

  return (
    <div className="section-shell mt-4 mb-5">
      <div className="glass flex items-center gap-1.5 rounded-[1.5rem] border border-stone-900/10 p-2">
        <Link
          className={clsx(
            "flex-1 rounded-xl px-5 py-3 text-center text-sm font-bold transition-all",
            currentPath === "/doctor"
              ? "bg-stone-900 text-white shadow-md"
              : "text-stone-600 hover:bg-stone-100",
          )}
          to="/doctor"
        >
          Dashboard
        </Link>
        <Link
          className={clsx(
            "flex-1 rounded-xl px-5 py-3 text-center text-sm font-bold transition-all",
            onQueue ? "bg-stone-900 text-white shadow-md" : "text-stone-600 hover:bg-stone-100",
          )}
          to="/doctor/queue"
        >
          {copy.doctorQueue}
        </Link>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import clsx from "clsx";
import { ensureLogin } from "./auth";
import { detectLang, setLang, t } from "./i18n";

import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Lots from "./pages/Lots";
import Chats from "./pages/Chats";
import Stats from "./pages/Stats";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import Profile from "./pages/Profile";
import AutoResponses from "./pages/AutoResponses";
import AutoDelivery from "./pages/AutoDelivery";
import Texts from "./pages/Texts";

export default function App() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    setLang(detectLang());
    ensureLogin().then(setAuthed);
  }, []);

  if (authed === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted">{t("common.loading")}</div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="text-2xl mb-2">⚡ Lethal Bot</div>
        <div className="text-text-muted">
          Откройте Mini App из Telegram-бота, чтобы войти.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full pb-16">
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/lots" element={<Lots />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/auto-responses" element={<AutoResponses />} />
          <Route path="/auto-delivery" element={<AutoDelivery />} />
          <Route path="/texts" element={<Texts />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

function BottomNav() {
  const items = [
    { to: "/", label: t("nav.dashboard"), icon: "🏠" },
    { to: "/accounts", label: t("nav.accounts"), icon: "📁" },
    { to: "/lots", label: t("nav.lots"), icon: "📦" },
    { to: "/chats", label: t("nav.chats"), icon: "💬" },
    { to: "/stats", label: t("nav.stats"), icon: "📊" },
    { to: "/settings", label: t("nav.settings"), icon: "⚙️" },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 flex justify-around">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.to === "/"}
          className={({ isActive }) =>
            clsx(
              "flex flex-col items-center px-2 py-1 rounded-lg text-xs",
              isActive ? "text-brand-500" : "text-text-muted"
            )
          }
        >
          <span className="text-lg">{it.icon}</span>
          <span>{it.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

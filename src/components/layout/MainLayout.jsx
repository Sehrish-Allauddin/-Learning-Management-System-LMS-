import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, BookOpen, Award, User, LogOut, Menu, Map, Trophy, Sun, Moon } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import NotificationBell from "../ui/NotificationBell";
import Chatbot from "../Chatbot";
import LanguageToggle from "../LanguageToggle";

export default function MainLayout() {
  const { t, i18n } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, profilePic, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // FIX 3 — lock body scroll while the mobile drawer is open: hides the page
  // scrollbar behind the overlay and stops background scrolling. Auto-unlocks
  // at desktop widths so a carried-over open state can never freeze the desktop.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      document.body.style.overflow = sidebarOpen && !mq.matches ? "hidden" : "";
    };
    update();
    mq.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const navItems = [
    { name: t("mainLayout.nav_dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { name: t("mainLayout.nav_my_courses"), href: "/courses", icon: BookOpen },
    { name: t("mainLayout.nav_learning_paths"), href: "/learning-paths", icon: Map },
    { name: t("mainLayout.nav_leaderboard"), href: "/leaderboard", icon: Trophy },
    { name: t("mainLayout.nav_achievements"), href: "/achievements", icon: Award },
    { name: t("mainLayout.nav_profile"), href: "/profile", icon: User }
  ];

  return (
    <div dir={i18n.language === "ur" ? "rtl" : "ltr"} className="min-h-screen bg-bg">
      {/* Header — highest z-index so nothing overlaps it */}
      <header className="sticky top-0 z-50 h-20 bg-navbar shadow-sm border-b border-border">
        <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-text-dark hover:text-primary focus:outline-none"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/dashboard" className="flex items-center gap-2">
              <img src="/LMS-logo.png" alt="LMS Logo" className="h-16 object-contain" />
              <span className="font-display font-bold text-2xl text-primary hidden sm:block border-s-2 ps-3 border-primary">
                LMS
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {(user?.role === "ADMIN" || user?.role === "MODERATOR") && (
              <Link to="/admin" className="text-sm font-medium text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors">
                {t("mainLayout.admin_panel")}
              </Link>
            )}
            <LanguageToggle />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <NotificationBell />
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-primary font-bold overflow-hidden shadow-sm">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="h-full w-full object-cover" />
              ) : user?.name ? (
                user.name.charAt(0).toUpperCase()
              ) : (
                "U"
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="lg:flex">
        {/* Mobile overlay — FIX 3: translucent dim + blur so the background shows through */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-[0.25px] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar:
            - mobile (< lg): fixed drawer below the 80px header; open/closed transforms are
              scoped to max-lg and mutually exclusive (FIX 2 — black-screen guard).
            - desktop (lg+): sticky under header, ALWAYS visible in LTR & RTL (FIX 1). */}
        <aside
          className={cn(
            // FIX 4 — overscroll-contain: drawer scroll can't leak into the page at its ends.
            // No other class sets overscroll-behavior, so it conflicts with nothing.
            "bg-surface border-e border-border flex flex-col overscroll-contain",
            "fixed top-20 bottom-0 start-0 z-40 w-64 overflow-y-auto transition-transform duration-200 ease-in-out",
            // FIX 2 — exactly one of these exists at a time → no rule can ever fight another.
            sidebarOpen
              ? "max-lg:translate-x-0"
              : "max-lg:-translate-x-full max-lg:rtl:translate-x-full",
            // FIX 1 — sticky (not static) so it no longer scrolls away; lg:translate-x-0
            // keeps it visible in both languages; self-start + height make sticky work.
            "lg:sticky lg:top-20 lg:bottom-auto lg:h-[calc(100vh-5rem)] lg:shrink-0 lg:translate-x-0 lg:self-start"
          )}
        >
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-green-50 dark:bg-green-900/30 text-nav-active"
                      : "text-text-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-primary"
                  )}
                >
                  <item.icon
                    className={cn(
                      "me-3 h-5 w-5 flex-shrink-0",
                      isActive ? "text-nav-active" : "text-gray-400 group-hover:text-primary"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border p-4">
            <button
              onClick={logout}
              className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="me-3 h-5 w-5 flex-shrink-0 text-red-500 group-hover:text-red-600" />
              {t("mainLayout.sign_out")}
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      <Chatbot />

      {/* CHATBOT RTL FIX: bottom-left in Urdu so it never covers Sign Out.
          Scoped to [dir="rtl"] only — English untouched. Does NOT modify Chatbot.jsx. */}
      <style>{`
        [dir="rtl"] div.fixed[class*="bottom-"][class*="right-"] {
          right: auto !important;
          left: 1.5rem !important;
        }
      `}</style>
    </div>
  );
}

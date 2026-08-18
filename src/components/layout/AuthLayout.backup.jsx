import React from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageToggle from "../LanguageToggle";

export default function AuthLayout() {
  const { t, i18n } = useTranslation();

  return (
    <div dir={i18n.language === "ur" ? "rtl" : "ltr"} className="min-h-screen bg-bg flex">
      {/* Left side - Decorative branding */}
      <div
        className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-between lg:p-12"
        style={{
          background:
            "linear-gradient(135deg, var(--color-green-100) 0%, var(--color-surface) 100%)"
        }}
      >
        <div className="flex items-center gap-4">
          <img src="/LMS-logo.png" alt="LMS Logo" className="w-[280px] h-auto object-contain"/>
          <span className="font-display font-bold text-3xl text-primary tracking-tight border-l-2 pl-4 border-primary rtl:border-l-0 rtl:border-r-2 rtl:pl-0 rtl:pr-4">
            {t("authLayout.digital_learning")}
          </span>
        </div>

        <div className="max-w-lg">
          <h2 className="font-display text-4xl font-bold text-green-900 mb-6 leading-tight">
            {t("authLayout.quote")}
          </h2>
          <p className="text-lg text-green-700">{t("authLayout.portal_name")}</p>
        </div>

        <div className="text-sm text-green-600 font-medium">
          {t("authLayout.copyright", { year: new Date().getFullYear() })}
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="relative flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-surface shadow-[0_0_40px_rgba(0,0,0,0.05)]">
        <div className="absolute top-6 right-6 rtl:right-auto rtl:left-6">
          <LanguageToggle />
        </div>

        <div className="mx-auto w-full max-w-sm lg:w-[360px]">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <img src="/LMS-logo.png" alt="LMS Logo" className="h-20 object-contain" />
            <span className="font-display font-bold text-2xl text-primary border-l-2 pl-3 border-primary rtl:border-l-0 rtl:border-r-2 rtl:pl-0 rtl:pr-3">
              LMS
            </span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
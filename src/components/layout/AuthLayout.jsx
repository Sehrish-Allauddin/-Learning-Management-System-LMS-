import React from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageToggle from "../LanguageToggle";

export default function AuthLayout() {
  const { t, i18n } = useTranslation();

  const isUrdu = i18n.language === "ur";

  return (
    <div
      dir={isUrdu ? "rtl" : "ltr"}
      className="min-h-screen bg-surface flex flex-col lg:flex-row"
    >
      {/* =====================================================
          LEFT SIDE - LMS BRANDING
      ====================================================== */}
      <div
        className="
          hidden lg:flex
          lg:w-[64%]
          lg:min-h-screen
          flex-col
          justify-between
          p-10
          xl:p-14
          relative
          overflow-hidden
        "
        style={{
          background:
            "linear-gradient(145deg, var(--color-green-100) 0%, #d8e9e4 38%, #263b45 100%)",
        }}
      >
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -bottom-32 -left-20 w-[500px] h-[500px] rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(circle, #4ade80 0%, transparent 65%)",
            }}
          />

          <div
            className="absolute top-1/3 right-[-180px] w-[450px] h-[450px] rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, #0f766e 0%, transparent 65%)",
            }}
          />
        </div>

        {/* =================================================
            LOGO / BRAND
        ================================================== */}
        <div className="relative z-10">
          <div
            className={`flex items-center ${
              isUrdu ? "flex-row-reverse" : ""
            }`}
          >
            <img
              src="/LMS-logo.png"
              alt="LMS Logo"
              className="
                w-[220px]
                xl:w-[260px]
                h-auto
                max-h-[90px]
                object-contain
                object-left
              "
            />

            <div
              className={`
                mx-5
                h-12
                w-px
                bg-primary/60
                ${isUrdu ? "order-1" : ""}
              `}
            />

            <span
              className="
                font-display
                font-semibold
                text-2xl
                xl:text-3xl
                text-primary
                whitespace-nowrap
              "
            >
              {t("authLayout.digital_learning")}
            </span>
          </div>
        </div>

        {/* =================================================
            MAIN MESSAGE
        ================================================== */}
        <div className="relative z-10 max-w-2xl -mt-10">
          <div className="w-16 h-1 bg-primary rounded-full mb-6" />

          <h2
            className="
              font-display
              text-3xl
              xl:text-5xl
              font-bold
              text-green-900
              leading-[1.15]
              tracking-tight
              max-w-xl
            "
          >
            {t("authLayout.quote")}
          </h2>

          <p
            className="
              mt-6
              text-lg
              xl:text-xl
              text-green-800
              font-medium
              leading-relaxed
              max-w-md
            "
          >
            {t("authLayout.portal_name")}
          </p>
        </div>

        {/* =================================================
            COPYRIGHT
        ================================================== */}
        <div
          className="
            relative
            z-10
            text-sm
            text-green-700
            font-medium
          "
        >
          {t("authLayout.copyright", {
            year: new Date().getFullYear(),
          })}
        </div>
      </div>

      {/* =====================================================
          RIGHT SIDE - LOGIN AREA
      ====================================================== */}
      <div
        className="
          relative
          lg:w-[36%]
          min-h-screen
          flex
          flex-col
          justify-center
          bg-surface
          px-5
          py-10
          sm:px-8
          lg:px-8
          xl:px-10
        "
      >
        {/* Language */}
        <div
          className="
            absolute
            top-6
            right-6
            sm:top-8
            sm:right-8
            rtl:right-auto
            rtl:left-6
            sm:rtl:left-8
          "
        >
          <LanguageToggle />
        </div>

        {/* Login content */}
        <div className="mx-auto w-full max-w-[380px]">

          {/* MOBILE LOGO */}
          <div className="lg:hidden flex items-center justify-center mb-10">
            <img
              src="/LMS-logo.png"
              alt="LMS Logo"
              className="
                h-20
                w-auto
                max-w-[250px]
                object-contain
              "
            />
          </div>

          {/* AUTH OUTLET */}
          <div className="w-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
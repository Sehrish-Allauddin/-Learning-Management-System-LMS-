// src/components/LanguageToggle.jsx
import { useTranslation } from "react-i18next";
import { changeLanguage } from "../i18n";

function LanguageToggle() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === "ur";

  return (
    <div
      role="radiogroup"
      aria-label="Select language"
      className="relative inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1 shadow-inner"
    >
      {/* Sliding active pill — positioned with left/right offsets, NO transforms */}
      <span
        aria-hidden="true"
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-primary shadow-sm transition-all duration-200 ease-out ${
          isUrdu
            ? "left-[calc(50%+4px)] rtl:left-1"
            : "left-1 rtl:left-[calc(50%+4px)]"
        }`}
      />

      <button
        type="button"
        role="radio"
        aria-checked={!isUrdu}
        onClick={() => changeLanguage("en")}
        className={`relative z-10 w-[calc(50%-4px)] text-center px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 ${
          !isUrdu
            ? "text-white"
            : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        }`}
      >
        EN
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={isUrdu}
        onClick={() => changeLanguage("ur")}
        className={`relative z-10 w-[calc(50%-4px)] text-center px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 ${
          isUrdu
            ? "text-white"
            : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        }`}
      >
        اردو
      </button>
    </div>
  );
}

export default LanguageToggle;
import { API_URL } from "../../lib/api";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export default function ForgotPassword() {
  const { t, i18n } = useTranslation();
  const [erpId, setErpId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [resetLink, setResetLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (/^\d{6}$/.test(erpId)) {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ erpId })
        });
        const data = await response.json();
        if (response.ok) {
          setSubmitted(true);
          if (data.resetLink) setResetLink(data.resetLink);
        } else {
          setError(data.error || t("forgotPassword.error_generic"));
        }
      } catch (err) {
        setError(t("forgotPassword.error_network"));
      } finally {
        setLoading(false);
      }
    } else {
      setError(t("forgotPassword.error_invalid_erp"));
    }
  };

  return (
    <div dir={i18n.language === "ur" ? "rtl" : "ltr"}>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">{t("forgotPassword.heading")}</h1>
        <p className="text-gray-600">{t("forgotPassword.subtitle")}</p>
      </div>

      {submitted ? (
        <div className="bg-green-50 text-green-800 p-4 rounded-md border border-green-200">
          <p className="font-semibold mb-2">{t("forgotPassword.reset_processed_title")}</p>
          <p className="mb-4 text-sm">{t("forgotPassword.reset_processed_text")}</p>
          {resetLink && (
            <div className="p-3 bg-white border border-green-300 rounded mb-4 break-all text-sm font-medium">
              <a href={resetLink} className="text-primary hover:underline">
                {resetLink}
              </a>
            </div>
          )}
          <div className="mt-2 text-sm text-gray-600 italic">{t("forgotPassword.reset_link_note")}</div>
          <div className="mt-6">
            <Link to="/login" className="text-primary font-medium hover:underline">
              {t("forgotPassword.return_to_login")}
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("forgotPassword.employee_id_erp_label")}</label>
            <Input
              type="text"
              placeholder={t("forgotPassword.employee_id_placeholder")}
              value={erpId}
              onChange={(e) => setErpId(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("forgotPassword.processing") : t("forgotPassword.send_reset_link_button")}
          </Button>
          <div className="mt-4 text-center text-sm">
            <Link to="/login" className="text-primary font-medium hover:underline">
              {t("forgotPassword.back_to_login")}
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
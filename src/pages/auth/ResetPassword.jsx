import { API_URL } from "../../lib/api";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError(t("resetPassword.invalid_token_text"));
    }
  }, [token, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    if (password !== confirmPassword) {
      setError(t("resetPassword.error_passwords_mismatch"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || t("resetPassword.error_failed_to_reset"));
      }
    } catch (err) {
      setError(t("resetPassword.error_network"));
    } finally {
      setLoading(false);
    }
  };

  if (!token && !error) {
    return null;
  }

  if (error && !token) {
    return (
      <div dir={i18n.language === "ur" ? "rtl" : "ltr"}>
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">{t("resetPassword.invalid_token_title")}</h1>
          <p className="text-gray-600">{t("resetPassword.invalid_token_text")}</p>
        </div>
        <div className="mt-6">
          <Link to="/forgot-password" className="text-primary font-medium hover:underline">
            {t("resetPassword.request_new_link")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div dir={i18n.language === "ur" ? "rtl" : "ltr"}>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">{t("resetPassword.heading")}</h1>
        <p className="text-gray-600">{t("resetPassword.subtitle")}</p>
      </div>

      {success ? (
        <div className="bg-green-50 text-green-800 p-4 rounded-md border border-green-200">
          <p className="font-semibold mb-2">{t("resetPassword.success_title")}</p>
          <p className="mb-4 text-sm">{t("resetPassword.success_text")}</p>
          <div className="mt-4">
            <Link to="/login" className="text-primary font-medium hover:underline">
              {t("resetPassword.go_to_login")}
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("resetPassword.new_password_label")}</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={t("resetPassword.password_placeholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10 rtl:pr-3 rtl:pl-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-3 rtl:pr-0 rtl:pl-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">{t("resetPassword.password_requirements_hint")}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("resetPassword.confirm_new_password_label")}</label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t("resetPassword.password_placeholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pr-10 rtl:pr-3 rtl:pl-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-3 rtl:pr-0 rtl:pl-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("resetPassword.resetting") : t("resetPassword.reset_password_button")}
          </Button>
        </form>
      )}
    </div>
  );
}
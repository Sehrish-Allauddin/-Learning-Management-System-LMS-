import { API_URL } from "../../lib/api";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { t, i18n } = useTranslation();
  const [erpId, setErpId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [is2FAStep, setIs2FAStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
   if (!/^\d{6}$/.test(erpId)) {
  setError(t("login.error_erp_format"));
  return;
}

if (erpId === "000000") {
  setError("ERP ID must be 000001 or higher.");
  return;
}
    if (!password) {
      setError(t("login.error_password_required"));
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ erpId, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t("login.error_login_failed"));
      }
      if (data.requires2FA) {
        setIs2FAStep(true);
        return;
      }
      // Save to context & local storage
      login(data.user, data.token);
      // Redirect based on role
      if (data.user.role === "ADMIN" || data.user.role === "MODERATOR") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!otpCode || otpCode.length !== 6) {
      setError(t("login.error_otp_length"));
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ erpId, otpCode })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t("login.error_verification_failed"));
      }
      login(data.user, data.token);
      if (data.user.role === "ADMIN" || data.user.role === "MODERATOR") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={i18n.language === "ur" ? "rtl" : "ltr"}>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
          {is2FAStep ? t("login.security_check") : t("login.welcome_back")}
        </h1>
        <p className="text-gray-600">
          {is2FAStep ? t("login.otp_subtitle") : t("login.sign_in_subtitle")}
        </p>
      </div>

      {is2FAStep ? (
        <form onSubmit={handleOTPSubmit} className="space-y-6">
          <div className="p-4 bg-green-50 rounded-lg text-green-800 text-sm mb-4 border border-green-100">
            {t("login.otp_sent_notice")}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("login.twofa_code_label")}</label>
            <Input
              type="text"
              placeholder={t("login.otp_placeholder")}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="text-center text-2xl tracking-widest font-mono"
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("login.verifying") : t("login.verify_code")}
          </Button>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIs2FAStep(false);
                setOtpCode("");
                setError("");
              }}
              className="text-sm text-gray-500 hover:text-primary transition-colors"
            >
              {t("login.back_to_password_login")}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("login.employee_id_erp_label")}</label>
            <Input
              type="text"
              placeholder={t("login.employee_id_placeholder")}
              value={erpId}
              onChange={(e) => setErpId(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("login.password_label")}</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={t("login.password_placeholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("login.signing_in") : t("login.sign_in_button")}
          </Button>
          <div className="mt-6 flex flex-col items-center space-y-3 text-sm">
            <Link to="/forgot-password" className="text-primary font-medium hover:underline">
              {t("login.forgot_password_link")}
            </Link>
            <div className="text-gray-500">
              {t("login.new_employee_text")}{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                {t("login.create_account_link")}
              </Link>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
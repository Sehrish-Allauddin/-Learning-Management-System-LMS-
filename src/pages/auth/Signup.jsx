import { API_URL } from "../../lib/api";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Eye, EyeOff } from "lucide-react";

export default function Signup() {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    erpId: "",
    designation: "",
    region: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    // 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special  (logic unchanged)
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.name || !formData.erpId || !formData.designation || !formData.password || !formData.region) {
      setError(t("signup.error_fill_all"));
      return;
    }
    if (!/^\d{6}$/.test(formData.erpId)) {
      setError(t("signup.error_erp_format"));
      return;
    }
    if (!validatePassword(formData.password)) {
      setError(t("signup.error_password_complexity"));
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t("signup.error_registration_failed"));
      }
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={i18n.language === "ur" ? "rtl" : "ltr"}>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">{t("signup.create_account_heading")}</h1>
        <p className="text-gray-600">{t("signup.register_subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("signup.full_name_label")}</label>
          <Input
            type="text"
            placeholder={t("signup.full_name_placeholder")}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("signup.erp_id_label")}</label>
            <Input
              type="text"
              placeholder={t("signup.erp_id_placeholder")}
              value={formData.erpId}
              onChange={(e) => setFormData({ ...formData, erpId: e.target.value.replace(/\D/g, "").slice(0, 6) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("signup.region_label")}</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors focus-visible:border-primary"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            >
              <option value="" disabled>{t("signup.select_region_placeholder")}</option>
              <option value="RHO Islamabad">RHO Islamabad</option>
              <option value="RHO Lahore">RHO Lahore</option>
              <option value="RHO Karachi">RHO Karachi</option>
              <option value="RHO Peshawar">RHO Peshawar</option>
              <option value="RHO Quetta">RHO Quetta</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("signup.designation_label")}</label>
          <Input
            type="text"
            placeholder={t("signup.designation_placeholder")}
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("signup.password_label")}</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder={t("signup.password_placeholder")}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="pr-10 rtl:pr-3 rtl:pl-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 rtl:right-auto rtl:left-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
            {error}
          </div>
        )}
        <Button type="submit" className="w-full mt-2" disabled={loading}>
          {loading ? t("signup.registering") : t("signup.register_button")}
        </Button>
        <div className="mt-4 text-center text-sm text-gray-500">
          {t("signup.already_have_account")}{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            {t("signup.sign_in_link")}
          </Link>
        </div>
      </form>
    </div>
  );
}
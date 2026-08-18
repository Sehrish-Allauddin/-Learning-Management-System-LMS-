import { API_URL } from "../../lib/api";
import React, { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { User, Camera, Mail, Shield, Briefcase, Award } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function Profile() {
  const { t, i18n } = useTranslation();
  const { user, token, profilePic, updateProfilePic, login } = useAuth();
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    designation: user?.designation || ""
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!isEditing) {
      setIsEditing(true);
      setUpdateMessage("");
      return;
    }
    setUpdateLoading(true);
    setUpdateMessage("");
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        login(data.user, token);
        setIsEditing(false);
        setUpdateMessage(t("profile.update_success"));
        setTimeout(() => setUpdateMessage(""), 3000);
      } else {
        setError(data.error || t("profile.update_failed"));
      }
    } catch (err) {
      setError(t("profile.update_network_error"));
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setError(t("profile.error_image_type"));
      return;
    }
    const maxSize = 4 * 1024 * 1024; // 4MB
    if (file.size > maxSize) {
      setError(t("profile.error_image_size"));
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      updateProfilePic(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div dir={i18n.language === "ur" ? "rtl" : "ltr"} className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t("profile.heading")}</h1>
        <p className="text-gray-500">{t("profile.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-primary/20 bg-green-50/30">
          <CardContent className="p-6 flex flex-col items-center">
            <div className="relative mb-6 mt-4">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100 flex items-center justify-center relative group">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-gray-300" />
                )}
                <div
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/jpeg, image/png"
              />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded mb-4 text-center">{error}</p>}
            <h2 className="text-xl font-bold text-gray-900 mb-1">{user?.name || "User"}</h2>
            <p className="text-primary font-medium mb-4">{user?.designation || "Employee"}</p>
            <Badge variant="secondary" className="mb-2">{user?.region || "N/A"}</Badge>
            <div className="w-full h-px bg-border my-4" />
            <div className="w-full space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="w-4 h-4 me-3 text-gray-400" />
                <span>ERP: {user?.erpId || "N/A"}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 me-3 text-gray-400" />
                <span>{user?.name?.toLowerCase().replace(/\s+/g, '.')}@LMS.gov.pk</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.personal_information")}</CardTitle>
            </CardHeader>
            <CardContent>
              {updateMessage && <p className="text-sm text-green-600 bg-green-50 p-2 rounded mb-4 text-center font-medium">{updateMessage}</p>}
              <form className="space-y-4" onSubmit={handleUpdate}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("profile.full_name_label")}</label>
                    <Input
                      value={isEditing ? formData.name : user?.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("profile.employee_id_label")}</label>
                    <Input value={user?.erpId || ""} disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("profile.designation_label")}</label>
                    <Input
                      value={isEditing ? formData.designation : user?.designation || ""}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("profile.email_label")}</label>
                    <Input value={`${user?.name?.toLowerCase().replace(/\s+/g, '.')}@LMS.gov.pk`} disabled />
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-2">
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({ name: user?.name || "", designation: user?.designation || "" });
                        setError("");
                      }}
                      disabled={updateLoading}
                    >
                      {t("profile.cancel")}
                    </Button>
                  )}
                  <Button type="submit" disabled={updateLoading}>
                    {updateLoading ? t("profile.saving") : (isEditing ? t("profile.save_changes") : t("profile.update_info_button"))}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                {t("profile.earned_badges_title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-center text-gray-900">Cybersecurity Pro</span>
                  <span className="text-xs text-gray-500 mt-1">Jul 2026</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
                    <Briefcase className="w-8 h-8 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-center text-gray-900">Data Protection</span>
                  <span className="text-xs text-gray-500 mt-1">Jun 2026</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 opacity-50">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                  </div>
                  <span className="text-sm font-medium text-center text-gray-400">Locked Badge</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
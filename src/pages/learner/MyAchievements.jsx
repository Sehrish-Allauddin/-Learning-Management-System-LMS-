import React, { useState, useEffect, useRef } from "react";
import { fetchApi } from "../../lib/api";
import { Award, Shield, FileBadge2, Download, Printer } from "lucide-react";
import { Button } from "../../components/ui/Button";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import CertificateTemplate from "../../components/ui/CertificateTemplate";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function MyAchievements() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const certRefs = useRef({});
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const data = await fetchApi('/api/auth/me/rewards');
      setRewards(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const certificates = rewards.filter(r => r.rewardType === 'CERTIFICATE');
  const badges = rewards.filter(r => r.rewardType === 'BADGE');

  // PDF generation — UNCHANGED (per scope)
  const downloadPDF = async (cert) => {
    const element = certRefs.current[cert.id];
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1122, 794]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, 1122, 794);
      pdf.save(`${cert.course.title.replace(/\s+/g, '_')}_Certificate.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(t("myAchievements.pdf_error"));
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">{t("myAchievements.loading")}</div>;

  return (
    <div dir={i18n.language === "ur" ? "rtl" : "ltr"} className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="h-8 w-8 text-primary" />
          {t("myAchievements.title")}
        </h1>
        <p className="text-gray-500 mt-2">{t("myAchievements.subtitle")}</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">{t("myAchievements.certificates_heading", { count: certificates.length })}</h2>
        {certificates.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-12 text-center text-gray-500 border border-dashed">
            <FileBadge2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p>{t("myAchievements.no_certificates_yet")}</p>
            <p className="text-sm mt-1">{t("myAchievements.complete_course_hint")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map(cert => (
              <div key={cert.id} className="bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative">
                <div className="h-48 bg-gradient-to-br from-green-50 to-emerald-100 p-6 flex flex-col items-center justify-center text-center border-b relative">
                  <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
                  <Award className="h-16 w-16 text-primary mb-3" />
                  <h3 className="font-serif font-bold text-xl text-gray-900 leading-tight">{t("myAchievements.certificate_of_completion")}</h3>
                  <p className="text-sm text-gray-600 mt-1 font-medium">{cert.course.title}</p>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-4">{t("myAchievements.earned_on", { date: new Date(cert.earnedDate).toLocaleDateString() })}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 flex items-center justify-center gap-2 text-primary border-primary hover:bg-green-50" onClick={() => window.print()}>
                      <Printer className="h-4 w-4" /> {t("myAchievements.print_button")}
                    </Button>
                    <Button
                      className="flex-1 flex items-center justify-center gap-2"
                      onClick={() => downloadPDF(cert)}
                    >
                      <Download className="h-4 w-4" /> {t("myAchievements.pdf_button")}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6 pt-8">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">{t("myAchievements.module_badges_heading", { count: badges.length })}</h2>
        {badges.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500 border border-dashed">
            <Shield className="h-8 w-8 mx-auto text-gray-300 mb-2" />
            <p>{t("myAchievements.no_badges_yet")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {badges.map(badge => (
              <div key={badge.id} className="bg-white rounded-xl border p-4 flex flex-col items-center text-center hover:bg-gray-50 transition-colors">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                  <Shield className="h-8 w-8 text-amber-600" />
                </div>
                <h4 className="font-bold text-sm text-gray-900 leading-tight mb-1">
                  {badge.module?.title || badge.course.title}
                </h4>
                <p className="text-xs text-gray-500">{new Date(badge.earnedDate).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden Certificate Templates for PDF Generation — UNCHANGED */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0, zIndex: -1 }}>
        {certificates.map(cert => (
          <CertificateTemplate
            key={`template-${cert.id}`}
            ref={el => certRefs.current[cert.id] = el}
            studentName={user?.name || "Student"}
            courseName={cert.course.title}
            date={cert.earnedDate}
            erpId={user?.erpId || "N/A"}
          />
        ))}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Download, AlertCircle, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AdminReports() {
  const { t, i18n } = useTranslation();
  const [missingAssessments, setMissingAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await fetchApi("/api/admin/reports/missing-assessments");
        setMissingAssessments(Array.isArray(data) ? data : data.missingAssessments || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  return (
    <div dir={i18n.language === "ur" ? "rtl" : "ltr"} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t("adminReports.title")}</h1>
          <p className="text-gray-500">{t("adminReports.subtitle")}</p>
        </div>
        <Button>
          <Download className="me-2 h-4 w-4" />
          {t("adminReports.export_all_button")}
        </Button>
      </div>

      <Card className="border-amber-200 shadow-sm bg-white">
        <CardHeader className="bg-amber-50/50 border-b border-amber-100 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertCircle className="h-5 w-5" />
            {t("adminReports.missing_assessments_title")}
          </CardTitle>
          <p className="text-sm text-amber-700 mt-1">{t("adminReports.missing_assessments_subtitle")}</p>
        </CardHeader>
        <CardContent className="p-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t("adminReports.employee_col")}</th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t("adminReports.course_col")}</th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t("adminReports.completed_on_col")}</th>
                <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase tracking-wider">{t("adminReports.action_col")}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">{t("adminReports.loading")}</td></tr>
              )}
              {!loading && missingAssessments.length === 0 && (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">{t("adminReports.no_missing_assessments")}</td></tr>
              )}
              {!loading && missingAssessments.map((record, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{record.user?.name || t("adminReports.unknown")}</div>
                    <div className="text-sm text-gray-500">ERP: {record.user?.erpId || t("adminReports.unknown")}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.course?.title || t("adminReports.unknown_course")}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">-</div></td>
                  <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                    <Button variant="outline" size="sm">{t("adminReports.remind_user_button")}</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {t("adminReports.completion_rates_title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center bg-gray-50 border border-dashed rounded-lg text-gray-400">
              {t("adminReports.chart_placeholder_completion")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {t("adminReports.regional_performance_title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center bg-gray-50 border border-dashed rounded-lg text-gray-400">
              {t("adminReports.chart_placeholder_regional")}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Download, AlertCircle, FileText, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AdminReports() {
  const { t, i18n } = useTranslation();

  const [missingAssessments, setMissingAssessments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadMissingAssessments = async () => {
    try {
      const data = await fetchApi("/api/admin/reports/missing-assessments");
      setMissingAssessments(
        Array.isArray(data) ? data : data?.missingAssessments || []
      );
      setError(null);
    } catch (err) {
      console.error("Missing assessments error:", err);
      setError(err.message || "Failed to load reports");
      setMissingAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await fetchApi("/api/admin/analytics");
      console.log("Admin analytics:", data);
      setAnalytics(data);
      setAnalyticsError(null);
    } catch (err) {
      // Keep the error in state/logs for debugging, but do NOT show a red
      // error banner to admins. The report page should remain clean.
      console.error("Analytics error:", err);
      setAnalyticsError(err.message || "Failed to load analytics");
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    loadMissingAssessments();
    loadAnalytics();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setLoading(true);
    setAnalyticsLoading(true);

    try {
      await Promise.all([loadMissingAssessments(), loadAnalytics()]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = () => {
    const rows = [["Employee", "ERP ID", "Course", "Completed On"]];

    missingAssessments.forEach((record) => {
      rows.push([
        record.user?.name || "",
        record.user?.erpId || "",
        record.module?.course?.title || record.course?.title || "",
        record.completedOn || ""
      ]);
    });

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "lms-report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const progressStats = analytics?.charts?.progressStats || [];
  const usersByRegion = analytics?.charts?.usersByRegion || [];

  const totalProgress = progressStats.reduce(
    (sum, item) => sum + Number(item.count || 0),
    0
  );

  const completedProgress =
    progressStats.find(
      (item) => String(item.name).toLowerCase() === "completed"
    )?.count || 0;

  const completionRate =
    analytics?.overview?.completionRate ??
    (totalProgress > 0
      ? Math.round((Number(completedProgress) / totalProgress) * 100)
      : 0);

  const maxProgress = Math.max(
    ...progressStats.map((item) => Number(item.count || 0)),
    1
  );

  const maxRegionUsers = Math.max(
    ...usersByRegion.map((item) => Number(item.value || 0)),
    1
  );

  return (
    <div
      dir={i18n.language === "ur" ? "rtl" : "ltr"}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {t("adminReports.title")}
          </h1>
          <p className="text-gray-400">{t("adminReports.subtitle")}</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`me-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>

          <Button onClick={handleExport}>
            <Download className="me-2 h-4 w-4" />
            {t("adminReports.export_all_button")}
          </Button>
        </div>
      </div>

      {/* Missing Assessments
          Neutral styling: this is a report section, NOT an error alert. */}
      <Card className="bg-[#111827] border-gray-700 shadow-sm overflow-hidden">
        <CardHeader className="bg-[#172033] border-b border-gray-700 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-white">
            <AlertCircle className="h-5 w-5 text-gray-300" />
            {t("adminReports.missing_assessments_title")}
          </CardTitle>

          <p className="text-sm text-gray-400 mt-1">
            {t("adminReports.missing_assessments_subtitle")}
          </p>
        </CardHeader>

        <CardContent className="p-0">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-[#0f172a]">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t("adminReports.employee_col")}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t("adminReports.course_col")}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t("adminReports.completed_on_col")}
                </th>
                <th className="px-6 py-3 text-end text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t("adminReports.action_col")}
                </th>
              </tr>
            </thead>

            <tbody className="bg-[#111827] divide-y divide-gray-700">
              {loading && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                    {t("adminReports.loading")}
                  </td>
                </tr>
              )}

              {!loading && missingAssessments.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                    {t("adminReports.no_missing_assessments")}
                  </td>
                </tr>
              )}

              {!loading &&
                missingAssessments.map((record, idx) => (
                  <tr key={record.id || idx} className="hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {record.user?.name || t("adminReports.unknown")}
                      </div>
                      <div className="text-sm text-gray-500">
                        ERP: {record.user?.erpId || t("adminReports.unknown")}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-200">
                        {record.module?.course?.title ||
                          record.course?.title ||
                          t("adminReports.unknown_course")}
                      </div>
                      {record.assessmentStatus && (
                        <div className="text-xs text-gray-400 mt-1">
                          Assessment: {record.assessmentStatus}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-200">
                        {record.completedOn
                          ? new Date(record.completedOn).toLocaleDateString()
                          : "-"}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                      <Button variant="outline" size="sm">
                        {t("adminReports.remind_user_button")}
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Analytics
          Analytics failures are logged, but no red error banner is rendered. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#111827] border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <FileText className="h-5 w-5 text-green-400" />
              {t("adminReports.completion_rates_title")}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {analyticsLoading ? (
              <div className="h-64 flex items-center justify-center text-gray-400">
                Loading analytics...
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-green-400">
                    {completionRate}%
                  </div>
                  <div className="text-gray-400 mt-2">
                    Overall Completion Rate
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Completed</span>
                      <span>
                        {completedProgress} / {totalProgress}
                      </span>
                    </div>

                    <div className="h-5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all duration-500"
                        style={{
                          width: `${
                            totalProgress > 0
                              ? (Number(completedProgress) /
                                  Number(totalProgress)) *
                                100
                              : 0
                          }%`
                        }}
                      />
                    </div>
                  </div>

                  {progressStats
                    .filter(
                      (item) =>
                        String(item.name).toLowerCase() !== "completed"
                    )
                    .map((item, index) => {
                      const value = Number(item.count || 0);
                      const width = (value / maxProgress) * 100;

                      return (
                        <div key={index}>
                          <div className="flex justify-between text-sm text-gray-400 mb-2">
                            <span>{item.name}</span>
                            <span>{value}</span>
                          </div>

                          <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gray-500 transition-all duration-500"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}

                  {progressStats.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      No progress data available.
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <FileText className="h-5 w-5 text-green-400" />
              {t("adminReports.regional_performance_title")}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {analyticsLoading ? (
              <div className="h-64 flex items-center justify-center text-gray-400">
                Loading analytics...
              </div>
            ) : (
              <div className="space-y-5">
                {usersByRegion.map((region, index) => {
                  const value = Number(region.value || 0);
                  const width = (value / maxRegionUsers) * 100;

                  return (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300">{region.name}</span>
                        <span className="text-gray-400">{value} users</span>
                      </div>

                      <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all duration-500"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                {usersByRegion.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No regional data available.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Overview Cards */}
      {analytics?.overview && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="bg-[#111827] border-gray-700">
            <CardContent className="p-6">
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-white mt-2">
                {analytics.overview.totalUsers ?? 0}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#111827] border-gray-700">
            <CardContent className="p-6">
              <p className="text-gray-400 text-sm">Total Courses</p>
              <p className="text-3xl font-bold text-white mt-2">
                {analytics.overview.totalCourses ?? 0}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#111827] border-gray-700">
            <CardContent className="p-6">
              <p className="text-gray-400 text-sm">Certificates Issued</p>
              <p className="text-3xl font-bold text-white mt-2">
                {analytics.overview.totalCertificates ?? 0}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
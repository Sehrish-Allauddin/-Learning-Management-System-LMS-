import React, { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";
import { Card, CardContent } from "../../components/ui/Card";
import { Shield, Clock, User, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AdminAuditLogs() {
  const { t, i18n } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await fetchApi("/api/admin/audit-logs");
        setLogs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(new Date(dateString));
  };

  const getActionColor = (action) => {
    if (action.includes("DELETE")) return "bg-red-100 text-red-800";
    if (action.includes("BULK_IMPORT")) return "bg-green-100 text-green-800";
    if (action.includes("UPDATE")) return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div dir={i18n.language === "ur" ? "rtl" : "ltr"} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t("adminAuditLogs.title")}</h1>
          <p className="text-gray-500">{t("adminAuditLogs.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200">
          <Shield className="h-4 w-4 text-primary" />
          {t("adminAuditLogs.system_protected_label")}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-hidden rounded-md border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t("adminAuditLogs.timestamp_col")}</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t("adminAuditLogs.admin_col")}</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t("adminAuditLogs.action_col")}</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t("adminAuditLogs.details_col")}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="me-1.5 h-4 w-4" />
                        {formatDate(log.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center me-3">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{log.user?.name || t("adminAuditLogs.system_user")}</div>
                          <div className="text-xs text-gray-500">{log.user?.erpId || "N/A"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 flex items-start">
                        <FileText className="me-2 h-4 w-4 text-gray-400 mt-0.5" />
                        <span>{log.details || "-"}</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {loading && (
                  <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">{t("adminAuditLogs.loading")}</td></tr>
                )}
                {!loading && logs.length === 0 && (
                  <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">{t("adminAuditLogs.no_logs")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
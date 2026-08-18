import React, { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Users, BookOpen, GraduationCap, TrendingUp, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from "react-i18next";

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const [dashboardData, setDashboardData] = useState({
    summary: { totalUsers: 0, totalCourses: 0, totalCompletions: 0 },
    registrationsData: [],
    popularCourses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchApi("/api/analytics").catch(() => null);
        if (data) setDashboardData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const stats = [
    { name: t("adminDashboard.total_employees"), value: loading ? "..." : dashboardData.summary.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { name: t("adminDashboard.active_courses"), value: loading ? "..." : dashboardData.summary.totalCourses, icon: BookOpen, color: "text-green-600", bg: "bg-green-100" },
    { name: t("adminDashboard.total_completions"), value: loading ? "..." : dashboardData.summary.totalCompletions, icon: GraduationCap, color: "text-amber-600", bg: "bg-amber-100" },
    { name: t("adminDashboard.active_users"), value: loading ? "..." : (dashboardData.registrationsData.length > 0 ? dashboardData.registrationsData[dashboardData.registrationsData.length - 1].users : 0), icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-100" }
  ];

  const recentActivity = [
    { user: "Admin", action: "checked", target: "System Status", time: "Just now" }
  ];

  return (
    <div dir={i18n.language === "ur" ? "rtl" : "ltr"} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t("adminDashboard.title")}</h1>
          <p className="text-gray-500">{t("adminDashboard.subtitle")}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/reports"><Button variant="outline">{t("adminDashboard.generate_report_button")}</Button></Link>
          <Link to="/admin/courses"><Button>{t("adminDashboard.create_course_button")}</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ms-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>{t("adminDashboard.user_registrations_title")}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center">
              {dashboardData.registrationsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.registrationsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-sm">{t("adminDashboard.no_registration_data")}</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("adminDashboard.popular_courses_title")}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center">
              {dashboardData.popularCourses.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.popularCourses} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                    <RechartsTooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="enrollments" fill="#10b981" radius={[0, 4, 4, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-sm">{t("adminDashboard.no_course_data")}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader><CardTitle>{t("adminDashboard.recent_activity_title")}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex gap-4">
                  <div className="relative mt-1">
                    <div className="absolute top-4 start-4 -bottom-6 w-0.5 bg-gray-200" hidden={i === recentActivity.length - 1} />
                    <div className="relative h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white z-10">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                  </div>
                  <div className="flex-1 py-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span> {activity.action}{" "}
                      <span className="font-medium text-primary">{activity.target}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              {t("adminDashboard.action_required_title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <h4 className="font-medium text-amber-800 text-sm mb-1">{t("adminDashboard.missing_assessments_title")}</h4>
                <p className="text-xs text-amber-700 mb-3">
                  {t("adminDashboard.missing_assessments_text", { count: 45 })}
                </p>
                <Link to="/admin/reports">
                  <Button variant="outline" size="sm" className="bg-white text-amber-700 border-amber-200 hover:bg-amber-100 w-full">
                    {t("adminDashboard.view_report_button")}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Link } from "react-router-dom";
import { Plus, BookOpen, Clock, Settings, Edit, Trash2, List } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AdminCourses() {
  const { t, i18n } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCourse, setNewCourse] = useState({
  courseCode: "",
  title: "",
  description: "",
  timeLimit: "",
  stage: "PLANNING"
});
  const [creating, setCreating] = useState(false);

  useEffect(() => { loadCourses(); }, []);

  const loadCourses = async () => {
    try {
      const data = await fetchApi("/api/courses");
      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.title.trim()) return;
    setCreating(true);
    try {
      await fetchApi("/api/courses", {
        method: "POST",
        body: JSON.stringify({
          courseCode: newCourse.courseCode,
          title: newCourse.title,
          description: newCourse.description,
          timeLimitMins: newCourse.timeLimit,
          stage: newCourse.stage
        })
      });
      setShowCreateForm(false);
      setNewCourse({
  courseCode: "",
  title: "",
  description: "",
  timeLimit: "",
  stage: "PLANNING"
});
      loadCourses();
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div dir={i18n.language === "ur" ? "rtl" : "ltr"} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t("adminCourses.title")}</h1>
          <p className="text-gray-500">{t("adminCourses.subtitle")}</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="me-2 h-4 w-4" />
          {t("adminCourses.create_new_course_button")}
        </Button>
      </div>

      {showCreateForm && (
        <Card className="border-primary shadow-sm bg-green-50/50">
          <CardHeader><CardTitle>{t("adminCourses.create_form_title")}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              
              <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Course ID
  </label>
  <Input
    required
    value={newCourse.courseCode}
    onChange={(e) =>
      setNewCourse({ ...newCourse, courseCode: e.target.value })
    }
    placeholder="e.g. 0001"
  />
</div>

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">{t("adminCourses.course_title_label")}</label>
                <Input required value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} placeholder={t("adminCourses.course_title_placeholder")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("adminCourses.description_label")}</label>
                <textarea className="flex w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" rows={3} value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} placeholder={t("adminCourses.description_placeholder")} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("adminCourses.time_limit_mins_label")}</label>
                  <Input
                    type="number"
                    min="1"
                    value={newCourse.timeLimit}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "") return setNewCourse({ ...newCourse, timeLimit: "" });
                      const n = parseInt(v, 10);
                      if (!isNaN(n)) setNewCourse({ ...newCourse, timeLimit: String(Math.max(1, n)) });
                    }}
                    placeholder={t("adminCourses.time_limit_placeholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("adminCourses.course_stage_label")}</label>
                  <select className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" value={newCourse.stage} onChange={(e) => setNewCourse({ ...newCourse, stage: e.target.value })}>
                    <option value="PLANNING">{t("adminCourses.stage_planning")}</option>
                    <option value="EXECUTION">{t("adminCourses.stage_execution")}</option>
                    <option value="MONITORING">{t("adminCourses.stage_monitoring")}</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
                <Button variant="outline" type="button" onClick={() => setShowCreateForm(false)}>{t("adminCourses.cancel")}</Button>
                <Button type="submit" disabled={creating}>{creating ? t("adminCourses.creating") : t("adminCourses.create_blank_course_button")}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-gray-500">{t("adminCourses.loading")}</p>
        ) : courses.length === 0 ? (
          <p className="text-gray-500">{t("adminCourses.no_courses_available")}</p>
        ) : (
          courses.map((course) => (
            <Card key={course.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant={course.stage === "PLANNING" ? "secondary" : course.stage === "EXECUTION" ? "default" : "warning"}>{course.stage}</Badge>
                </div>
                <CardTitle className="text-lg leading-tight line-clamp-2">{course.title}</CardTitle>
              </CardHeader>
              <CardContent className="pb-4 flex-1">
                <div className="flex flex-col gap-2 text-sm text-gray-500 mt-2">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>{t("adminCourses.modules_count", { count: course._count?.modules || 0 })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{course.timeLimitMins ? t("adminCourses.modules_total_limit", { count: course.timeLimitMins }) : t("adminCourses.no_time_limit")}</span>
                  </div>
                </div>
              </CardContent>
              <div className="border-t border-border p-4 bg-gray-50 rounded-b-lg flex justify-between items-center">
                <span className="text-xs text-gray-500 font-medium">{new Date(course.updatedAt).toLocaleDateString()}</span>
                <div className="flex gap-2">
                  <Link to={`/admin/courses/${course.id}`}>
                    <Button variant="outline" size="sm" className="h-8 text-xs font-medium">
                      <List className="h-4 w-4 me-1" /> {t("adminCourses.manage_content_button")}
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
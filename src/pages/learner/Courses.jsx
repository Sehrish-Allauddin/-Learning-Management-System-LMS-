import React, { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Search, BookOpen, Filter } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Courses() {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coursesRes, myCoursesRes] = await Promise.all([
        fetchApi("/api/courses"),
        fetchApi("/api/courses/my-courses").catch(() => [])
      ]);
      setAllCourses(coursesRes);
      setEnrolledIds(new Set(myCoursesRes.map((c) => c.id)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    setEnrolling(courseId);
    try {
      await fetchApi(`/api/courses/${courseId}/enroll`, { method: "POST" });
      setEnrolledIds(new Set([...enrolledIds, courseId]));
    } catch (err) {
      alert(err.message);
    } finally {
      setEnrolling(null);
    }
  };

  const filteredCourses = allCourses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div dir={i18n.language === "ur" ? "rtl" : "ltr"} className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t("courses.heading")}</h1>
        <p className="text-gray-500">{t("courses.subtitle")}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t("courses.search_placeholder")}
            className="pl-9 rtl:pl-3 rtl:pr-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="sm:w-auto w-full flex gap-2">
          <Filter className="h-4 w-4" />
          {t("courses.filter_button")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="flex flex-col hover:shadow-md transition-shadow group overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-green-50 to-amber-50 relative border-b border-border">
              <div className="absolute inset-0 bg-white/40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-primary opacity-50 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="bg-white">{course.stage || "PLANNING"}</Badge>
                {enrolledIds.has(course.id) && <Badge variant="secondary">{t("courses.enrolled_badge")}</Badge>}
              </div>
              <CardTitle className="text-xl leading-tight">{course.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {course.description || t("courses.no_description")}
              </p>
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-border">
                <span className="text-xs font-medium text-gray-500">
                  {course.timeLimitMins ? `${course.timeLimitMins} mins` : t("courses.self_paced")}
                </span>
                {!enrolledIds.has(course.id) ? (
                  <Button size="sm" onClick={() => handleEnroll(course.id)} disabled={enrolling === course.id}>
                    {enrolling === course.id ? t("courses.enrolling") : t("courses.enroll_now")}
                  </Button>
                ) : (
                  <Link to={`/course/${course.id}`}>
                    <Button variant="default" size="sm">{t("courses.continue_button")}</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {loading ? (
          <div className="col-span-full py-12 text-center">
            <p className="text-gray-500">{t("courses.loading")}</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <p className="text-gray-500">{t("courses.no_courses_found")}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
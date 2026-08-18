import React, { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Plus, BookOpen, Layers } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AdminLearningPaths() {
  const { t, i18n } = useTranslation();
  const [paths, setPaths] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [selectedCourses, setSelectedCourses] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pathsData, coursesData] = await Promise.all([
        fetchApi("/api/learning-paths"),
        fetchApi("/api/courses")
      ]);
      setPaths(pathsData);
      setCourses(coursesData);
    } catch (err) {
      alert(t("adminLearningPaths.alert_load_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePath = async (e) => {
    e.preventDefault();
    if (!newTitle || selectedCourses.length === 0) {
      return alert(t("adminLearningPaths.alert_title_course_required"));
    }
    try {
      await fetchApi("/api/learning-paths/admin", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          courseIds: selectedCourses
        })
      });
      setIsCreating(false);
      setNewTitle("");
      setNewDesc("");
      setSelectedCourses([]);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleCourseSelection = (courseId) => {
    if (selectedCourses.includes(courseId)) {
      setSelectedCourses(selectedCourses.filter(id => id !== courseId));
    } else {
      setSelectedCourses([...selectedCourses, courseId]);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">{t("adminLearningPaths.loading")}</div>;

  return (
    <div dir={i18n.language === "ur" ? "rtl" : "ltr"} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t("adminLearningPaths.title")}</h1>
          <p className="text-gray-500">{t("adminLearningPaths.subtitle")}</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? t("adminLearningPaths.cancel") : t("adminLearningPaths.create_new_path_button")}
        </Button>
      </div>

      {isCreating && (
        <Card className="border-primary bg-green-50/30">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-4">{t("adminLearningPaths.create_form_title")}</h2>
            <form onSubmit={handleCreatePath} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("adminLearningPaths.path_title_label")}</label>
                  <Input placeholder={t("adminLearningPaths.path_title_placeholder")} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("adminLearningPaths.description_label")}</label>
                  <Input placeholder={t("adminLearningPaths.path_description_placeholder")} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium mb-2 block">{t("adminLearningPaths.select_courses_label")}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {courses.map(c => {
                    const isSelected = selectedCourses.includes(c.id);
                    const sequenceNumber = selectedCourses.indexOf(c.id) + 1;
                    return (
                      <div key={c.id} onClick={() => toggleCourseSelection(c.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors relative ${isSelected ? 'bg-primary text-white border-primary' : 'bg-white hover:bg-gray-50'}`}>
                        {isSelected && (
                          <div className="absolute -top-2 -end-2 h-6 w-6 bg-yellow-400 text-yellow-900 font-bold rounded-full flex items-center justify-center text-xs shadow-sm">
                            {sequenceNumber}
                          </div>
                        )}
                        <div className={`font-medium ${isSelected ? 'text-white' : 'text-gray-900'}`}>{c.title}</div>
                        <div className={`text-xs mt-1 ${isSelected ? 'text-green-100' : 'text-gray-500'}`}>
                          {t("adminLearningPaths.modules_count", { count: c._count?.modules || 0 })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={selectedCourses.length === 0}>{t("adminLearningPaths.save_path_button")}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {paths.map(path => (
          <Card key={path.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{path.title}</h3>
                  <p className="text-gray-500">{path.description}</p>
                </div>
                <div className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full flex items-center">
                  <Layers className="h-3 w-3 me-1" />
                  {t("adminLearningPaths.courses_count", { count: path.courses.length })}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex flex-nowrap overflow-x-auto gap-4 pb-4">
                {path.courses.map((pc, idx) => (
                  <div key={pc.id} className="min-w-[200px] bg-white p-3 rounded border border-gray-200 shadow-sm flex-shrink-0 relative">
                    <div className="text-xs text-primary font-bold mb-1 border-b pb-1">{t("adminLearningPaths.step_label", { num: idx + 1 })}</div>
                    <div className="font-medium text-gray-900 text-sm line-clamp-2">{pc.course.title}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {paths.length === 0 && !isCreating && (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">{t("adminLearningPaths.no_paths_title")}</h3>
            <p className="text-gray-500 mb-4">{t("adminLearningPaths.no_paths_text")}</p>
            <Button onClick={() => setIsCreating(true)} variant="outline">{t("adminLearningPaths.create_first_path_button")}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
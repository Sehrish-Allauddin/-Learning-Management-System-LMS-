import React, { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { BookOpen, Map, ChevronRight, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function LearningPaths() {
  const { t, i18n } = useTranslation();
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchApi("/api/learning-paths");
        setPaths(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="p-12 text-center text-gray-500">{t("learningPaths.loading")}</div>;

  return (
    <div dir={i18n.language === "ur" ? "rtl" : "ltr"} className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900">{t("learningPaths.title")}</h1>
        <p className="text-gray-500 mt-2 text-lg">{t("learningPaths.subtitle")}</p>
      </div>

      {paths.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border shadow-sm">
          <Map className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700">{t("learningPaths.no_paths_title")}</h2>
          <p className="text-gray-500 mt-2">{t("learningPaths.no_paths_text")}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {paths.map((path) => (
            <div key={path.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col md:flex-row">
              <div className="p-8 md:w-1/3 bg-gray-50 border-e border-gray-100 flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{path.title}</h2>
                <p className="text-gray-600 mb-6 flex-1">{path.description}</p>
                <div className="flex items-center gap-2 text-sm font-bold text-primary bg-green-50 px-3 py-1.5 rounded-full w-fit">
                  <Map className="h-4 w-4" />
                  {t("learningPaths.courses_count", { count: path.courses.length })}
                </div>
              </div>
              <div className="p-6 md:w-2/3">
                <div className="relative">
                  {/* Connecting Line — flips to the right in Urdu */}
                  <div className="absolute left-6 rtl:left-auto rtl:right-6 top-8 bottom-8 w-0.5 bg-gray-200"></div>
                  <div className="space-y-6">
                    {path.courses.map((pc, idx) => (
                      <div key={pc.id} className="relative flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-white border-2 border-primary flex items-center justify-center text-primary font-bold z-10 shadow-sm shrink-0">
                          {idx + 1}
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex-1 hover:border-primary transition-colors group">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{pc.course.title}</h3>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-1">{pc.course.description}</p>
                              <div className="flex gap-4 mt-3 text-xs font-medium text-gray-400">
                                <span>{t("learningPaths.modules_count", { count: pc.course._count?.modules || 0 })}</span>
                                {pc.course.timeLimitMins && <span>• {pc.course.timeLimitMins} mins</span>}
                              </div>
                            </div>
                            <Link to={`/course/${pc.course.id}`}>
                              <Button variant="ghost" size="sm" className="hidden sm:flex group-hover:bg-primary group-hover:text-white transition-all">
                                {t("learningPaths.go_to_course")} <ChevronRight className="h-4 w-4 ms-1 rtl:rotate-180" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
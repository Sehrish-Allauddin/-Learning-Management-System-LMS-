import React, { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { BookOpen, Map, ChevronRight, CheckCircle } from "lucide-react";

// --- Helpers ----------------------------------------------------------

// A course counts as "complete" if either the path-course join record or
// the course itself carries a completed flag from the API. Adjust this
// if your backend uses a different field name (e.g. progress.status).
function isCourseComplete(pc) {
  return Boolean(pc.completed || pc.course?.completed || pc.course?.userProgress?.completed);
}

function getPathProgress(path) {
  const total = path.courses.length;
  if (total === 0) return { completed: 0, total: 0, percent: 0 };
  const completed = path.courses.filter(isCourseComplete).length;
  return { completed, total, percent: Math.round((completed / total) * 100) };
}

// --- Progress bar -------------------------------------------------------
// A single bar whose color sweeps red -> orange -> yellow -> light green
// -> green as it fills. We paint the full gradient underneath and mask
// off the unfilled portion, so the color you see always matches how far
// along the path is.

const PROGRESS_GRADIENT =
  "linear-gradient(to right, #ef4444, #f97316, #eab308, #a3e635, #22c55e)";

function ProgressBar({ percent }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-gray-500">Progress</span>
        <span className="text-xs font-bold text-gray-700">{percent}%</span>
      </div>
      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        {/* Full gradient painted underneath */}
        <div
          className="absolute inset-y-0 left-0 w-full rounded-full"
          style={{ background: PROGRESS_GRADIENT }}
        />
        {/* Gray mask covers whatever isn't complete yet, revealing the
            gradient only up to the current percentage from the left */}
        <div
          className="absolute inset-y-0 right-0 bg-gray-200 transition-all duration-500"
          style={{ width: `${100 - percent}%` }}
        />
      </div>
    </div>
  );
}

export default function LearningPaths() {
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

  if (loading) return <div className="p-12 text-center text-gray-500">Loading learning paths...</div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900">Learning Paths</h1>
        <p className="text-gray-500 mt-2 text-lg">Curated journeys designed to build mastery in specific domains.</p>
      </div>

      {paths.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border shadow-sm">
          <Map className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700">No Paths Available</h2>
          <p className="text-gray-500 mt-2">Check back later for new learning journeys!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {paths.map(path => {
            const { percent } = getPathProgress(path);
            return (
              <div key={path.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col md:flex-row">
                <div className="p-8 md:w-1/3 bg-gray-50 border-r border-gray-100 flex flex-col justify-center gap-5">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{path.title}</h2>
                    <p className="text-gray-600">{path.description}</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-bold text-primary bg-green-50 px-3 py-1.5 rounded-full w-fit">
                    <Map className="h-4 w-4" />
                    {path.courses.length} Courses
                  </div>

                  <ProgressBar percent={percent} />
                </div>

                <div className="p-6 md:w-2/3">
                  <div className="relative">
                    {/* Connecting Line */}
                    <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200"></div>

                    <div className="space-y-6">
                      {path.courses.map((pc, idx) => {
                        const complete = isCourseComplete(pc);
                        return (
                          <Link
                            key={pc.id}
                            to={`/course/${pc.course.id}`}
                            className="relative flex gap-4 group"
                          >
                            <div
                              className={`w-12 h-12 rounded-full bg-white border-2 flex items-center justify-center font-bold z-10 shadow-sm shrink-0 transition-colors ${
                                complete
                                  ? "border-green-600 text-green-600"
                                  : "border-primary text-primary"
                              }`}
                            >
                              {complete ? <CheckCircle className="h-6 w-6" /> : idx + 1}
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex-1 group-hover:border-primary transition-colors">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{pc.course.title}</h3>
                                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{pc.course.description}</p>
                                  <div className="flex gap-4 mt-3 text-xs font-medium text-gray-400">
                                    <span>{pc.course._count?.modules || 0} Modules</span>
                                    {pc.course.timeLimitMins && <span>• {pc.course.timeLimitMins} mins</span>}
                                  </div>
                                </div>
                                <Button
                                  as="span"
                                  variant="ghost"
                                  size="sm"
                                  className="hidden sm:flex group-hover:bg-primary group-hover:text-white transition-all pointer-events-none"
                                >
                                  Go to Course <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

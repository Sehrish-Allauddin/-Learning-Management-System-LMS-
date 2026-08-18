import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchApi } from "../../lib/api";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ChevronLeft, Plus, PlayCircle, FileText, HelpCircle, Save, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AdminCourseBuilder() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newModule, setNewModule] = useState({
    title: "",
    type: "VIDEO",
    contentUrl: "",
    timeLimitMins: "",
    passingScore: 80,
    questions: []
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      const data = await fetchApi(`/api/courses/${id}`);
      setCourse(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const nextSequence = course.modules && course.modules.length > 0
        ? Math.max(...course.modules.map(m => m.sequenceOrder)) + 1
        : 1;
      await fetchApi('/api/modules', {
        method: 'POST',
        body: JSON.stringify({
          courseId: parseInt(id),
          title: newModule.title,
          type: newModule.type,
          contentUrl: newModule.contentUrl || null,
          sequenceOrder: nextSequence,
          timeLimitMins: newModule.timeLimitMins || null,
          passingScore: newModule.type.includes('ASSESSMENT') ? newModule.passingScore : null,
          questions: newModule.type.includes('ASSESSMENT') ? newModule.questions : undefined
        })
      });
      setNewModule({ title: "", type: "VIDEO", contentUrl: "", timeLimitMins: "", passingScore: 80, questions: [] });
      await loadCourse();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm(t("adminCourseBuilder.confirm_delete_module"))) return;
    try {
      await fetchApi(`/api/modules/${moduleId}`, { method: 'DELETE' });
      await loadCourse();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">{t("adminCourseBuilder.loading_course")}</div>;
  if (!course) return <div className="p-8 text-center text-red-500">{t("adminCourseBuilder.course_not_found")}</div>;

  return (
    <div dir={i18n.language === "ur" ? "rtl" : "ltr"} className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center mb-6">
        <Link to="/admin/courses" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors">
          <ChevronLeft className="h-4 w-4 me-1 rtl:rotate-180" />
          {t("adminCourseBuilder.back_to_courses")}
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
        <p className="text-gray-500 mt-2">{t("adminCourseBuilder.manage_modules_subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">{t("adminCourseBuilder.current_modules_title", { count: course.modules?.length || 0 })}</h2>
          {course.modules?.length === 0 ? (
            <Card className="bg-gray-50 border-dashed">
              <CardContent className="p-12 text-center text-gray-500">
                <p>{t("adminCourseBuilder.no_modules_yet")}</p>
                <p className="text-sm mt-2">{t("adminCourseBuilder.use_form_hint")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {course.modules?.map((mod) => (
                <Card key={mod.id} className="hover:shadow-sm transition-shadow">
                  <div className="flex items-center p-4">
                    <div className="h-10 w-10 rounded bg-green-50 flex items-center justify-center me-4 flex-shrink-0">
                      {mod.type === 'VIDEO' ? <PlayCircle className="h-5 w-5 text-primary" /> :
                       mod.type === 'PDF' ? <FileText className="h-5 w-5 text-primary" /> :
                       <HelpCircle className="h-5 w-5 text-amber-500" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{mod.sequenceOrder}. {mod.title}</h3>
                      <div className="text-sm text-gray-500 flex gap-4 mt-1 flex-wrap">
                        <span>{t("adminCourseBuilder.type_label")}: {mod.type}</span>
                        {mod.timeLimitMins && <span>{t("adminCourseBuilder.duration_value", { mins: mod.timeLimitMins })}</span>}
                        {mod.type.includes('ASSESSMENT') && <span>{t("adminCourseBuilder.passing_score_value", { score: mod.passingScore })}</span>}
                        {mod.contentUrl && (
                          <a href={mod.contentUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {t("adminCourseBuilder.view_link")}
                          </a>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteModule(mod.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors ms-4"
                      title={t("adminCourseBuilder.delete_module_title")}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader className="bg-gray-50 border-b border-border">
              <CardTitle className="text-lg">{t("adminCourseBuilder.add_new_module_title")}</CardTitle>
            </CardHeader>
            <form onSubmit={handleAddModule}>
              <CardContent className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("adminCourseBuilder.module_title_label")}</label>
                  <Input required placeholder={t("adminCourseBuilder.module_title_placeholder")} value={newModule.title} onChange={(e) => setNewModule({...newModule, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                  <select 
                    className="w-full border-border rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    value={newModule.type}
                    onChange={(e) => setNewModule({...newModule, type: e.target.value})}
                  >
                    <option value="VIDEO">Video Link</option>
<option value="PDF">PDF Link</option>
<option value="STANDARD_ASSESSMENT">Module Assessment</option>
                  </select>
                </div>
                {(newModule.type === 'VIDEO' || newModule.type === 'PDF') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("adminCourseBuilder.content_url_label")}</label>
                    <Input required type="url" placeholder={t("adminCourseBuilder.content_url_placeholder")} value={newModule.contentUrl} onChange={(e) => setNewModule({...newModule, contentUrl: e.target.value})} />
                    <p className="text-xs text-gray-500 mt-1">{t("adminCourseBuilder.content_url_hint")}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("adminCourseBuilder.duration_label")}</label>
                  <Input
                    type="number"
                    min="1"
                    placeholder={t("adminCourseBuilder.duration_placeholder")}
                    value={newModule.timeLimitMins}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "") return setNewModule({ ...newModule, timeLimitMins: "" });
                      const n = parseInt(v, 10);
                      if (!isNaN(n)) setNewModule({ ...newModule, timeLimitMins: String(Math.max(1, n)) });
                    }}
                  />
                </div>
                {newModule.type.includes('ASSESSMENT') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t("adminCourseBuilder.passing_score_label")}</label>
                      <Input type="number" min="0" max="100" value={newModule.passingScore} onChange={(e) => setNewModule({...newModule, passingScore: e.target.value})} />
                    </div>
                    <div className="pt-4 border-t border-border mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-bold text-gray-700">{t("adminCourseBuilder.quiz_questions_label", { count: newModule.questions.length })}</label>
                        <Button type="button" variant="outline" size="sm"
                          onClick={() => setNewModule({ ...newModule, questions: [...newModule.questions, { questionText: "", options: ["", "", "", ""], correctOption: "" }] })}>
                          <Plus className="h-4 w-4 me-1" /> {t("adminCourseBuilder.add_question_button")}
                        </Button>
                      </div>
                      <div className="space-y-4 max-h-96 overflow-y-auto pe-2">
                        {newModule.questions.map((q, qIndex) => (
                          <div key={qIndex} className="p-3 bg-white border border-gray-200 rounded-lg relative">
                            <button type="button"
                              onClick={() => {
                                const newQs = [...newModule.questions];
                                newQs.splice(qIndex, 1);
                                setNewModule({...newModule, questions: newQs});
                              }}
                              className="absolute top-2 end-2 text-red-400 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">{t("adminCourseBuilder.question_label", { num: qIndex + 1 })}</label>
                            <Input placeholder={t("adminCourseBuilder.question_placeholder")} value={q.questionText}
                              onChange={(e) => {
                                const newQs = [...newModule.questions];
                                newQs[qIndex].questionText = e.target.value;
                                setNewModule({...newModule, questions: newQs});
                              }}
                              className="mb-2" required />
                            <div className="space-y-2 ps-4 border-s-2 border-gray-200">
                              {q.options.map((opt, oIndex) => (
                                <div key={oIndex} className="flex items-center gap-2">
                                  <input type="radio" name={`correct_${qIndex}`} required
                                    checked={q.correctOption !== "" && q.correctOption === opt}
                                    onChange={() => {
                                      const newQs = [...newModule.questions];
                                      newQs[qIndex].correctOption = opt;
                                      setNewModule({...newModule, questions: newQs});
                                    }}
                                    className="h-4 w-4 text-primary" />
                                  <Input size="sm" placeholder={t("adminCourseBuilder.option_placeholder", { num: oIndex + 1 })} value={opt}
                                    onChange={(e) => {
                                      const newQs = [...newModule.questions];
                                      newQs[qIndex].options[oIndex] = e.target.value;
                                      if(q.correctOption === opt) newQs[qIndex].correctOption = e.target.value;
                                      setNewModule({...newModule, questions: newQs});
                                    }}
                                    required />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="p-4 border-t border-border bg-gray-50">
                <Button type="submit" className="w-full flex items-center justify-center gap-2" disabled={saving}>
                  <Save className="h-4 w-4" />
                  {saving ? t("adminCourseBuilder.saving_module") : t("adminCourseBuilder.save_module_button")}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
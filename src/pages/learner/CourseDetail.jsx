import React, { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";
import jsPDF from "jspdf";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Lock, CheckCircle, PlayCircle, FileText, HelpCircle, ChevronLeft, ChevronDown, BarChart2, MessageSquare, UserCircle } from "lucide-react";
import { Input } from "../../components/ui/Input";
import { useTranslation } from "react-i18next";

export default function CourseDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [showGraph, setShowGraph] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussion, setNewDiscussion] = useState({ title: "", content: "" });
  const [newComment, setNewComment] = useState("");
  const [activeDiscussionId, setActiveDiscussionId] = useState(null);
  const [newRating, setNewRating] = useState(0);
  const [newReviewText, setNewReviewText] = useState("");

  useEffect(() => {
    loadCourse();
  }, [id]);

  const currentIndex = course?.modules?.findIndex((m) => m.id === activeModule?.id) ?? -1;
  const previousModule = currentIndex > 0 ? course.modules[currentIndex - 1] : null;
  const nextModule =
    currentIndex >= 0 && currentIndex < (course?.modules?.length || 0) - 1
      ? course.modules[currentIndex + 1]
      : null;

  const navigateToModule = (mod) => {
    if (!mod || mod.status === "locked") return;
    setActiveModule(mod);
    resetQuiz();
    setShowGraph(false);
  };

  const loadCourse = async () => {
    try {
      const data = await fetchApi(`/api/courses/${id}`);
      let previousCompleted = true;
      const processedModules = data.modules.map((mod) => {
        const progress = mod.progress && mod.progress.length > 0 ? mod.progress[0] : null;
        let status = "locked";
        if (progress) {
          status = progress.status.toLowerCase();
          if (status === "in_progress") status = "in-progress";
        } else if (previousCompleted) {
          status = "available";
        }
        previousCompleted = status === "completed";
        return { ...mod, status };
      });
      data.modules = processedModules;
      setCourse(data);
      const discussionData = await fetchApi(`/api/discussions/${id}`);
      setDiscussions(discussionData);
      const firstActive =
        processedModules.find((m) => m.status === "in-progress" || m.status === "available") ||
        processedModules[0];
      if (firstActive) setActiveModule(firstActive);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (moduleId) => {
    setSubmitting(true);
    try {
      await fetchApi(`/api/modules/${moduleId}/complete`, { method: "POST" });
      await loadCourse();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

const handleSubmitAssessment = async (moduleId) => {
  setSubmitting(true);

  try {
    const response = await fetchApi(
      `/api/assessments/${moduleId}/submit`,
      {
        method: "POST",
        body: JSON.stringify({ answers })
      }
    );

    console.log("ASSESSMENT RESULT:", response);

    setQuizResult(response);

    if (response.passed) {
      setShowGraph(true);

      // Reload course so COMPLETED status unlocks next module
      await loadCourse();

      // Find and open next module automatically
      if (response.nextModuleId) {
        const updatedCourse = await fetchApi(
          `/api/courses/${id}`
        );

        const next = updatedCourse.modules?.find(
          (m) => m.id === response.nextModuleId
        );

        if (next) {
          setActiveModule(next);
          setQuizStarted(false);
          setAnswers({});
          setQuizResult(null);
        }
      }
    } else {
      // Keep result visible if failed
      await loadCourse();
    }

  } catch (err) {
    console.error("Assessment submit error:", err);
    alert(err.message);
  } finally {
    setSubmitting(false);
  }
};

  const resetQuiz = () => {
    setQuizStarted(false);
    setAnswers({});
    setQuizResult(null);
  };

  // Certificate generation — UNCHANGED (per scope)
  const downloadCertificate = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "in", format: "letter" });
    doc.setFillColor(245, 250, 245);
    doc.rect(0, 0, 11, 8.5, "F");
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.1);
    doc.rect(0.5, 0.5, 10, 7.5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(40);
    doc.setTextColor(17, 24, 39);
    doc.text("Certificate of Completion", 5.5, 2.5, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text("This is to certify that", 5.5, 3.5, { align: "center" });
    const userName = (JSON.parse(localStorage.getItem("LMS_user")) || {}).name || "Learner";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(34, 197, 94);
    doc.text(userName, 5.5, 4.2, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.setTextColor(17, 24, 39);
    doc.text("has successfully completed the course", 5.5, 5, { align: "center" });
    doc.setFont("helvetica", "italic");
    doc.setFontSize(22);
    doc.text(course?.title || "Course", 5.5, 5.8, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    const date = new Date().toLocaleDateString();
    doc.text(`Awarded on: ${date}`, 5.5, 6.8, { align: "center" });
    doc.setFontSize(10);
    doc.text("LMS Digital Learning Management System", 5.5, 7.5, { align: "center" });
    doc.save(`${(course?.title || "Course").replace(/\s+/g, "_")}_Certificate.pdf`);
  };

  const handlePostDiscussion = async (e) => {
    e.preventDefault();
    if (!newDiscussion.title || !newDiscussion.content) return;
    try {
      await fetchApi(`/api/discussions/${id}`, { method: "POST", body: JSON.stringify(newDiscussion) });
      setNewDiscussion({ title: "", content: "" });
      const discussionData = await fetchApi(`/api/discussions/${id}`);
      setDiscussions(discussionData);
    } catch (err) {
      alert(t("courseDetail.alert_post_discussion_failed"));
    }
  };

  const handlePostComment = async (discussionId, e) => {
    e.preventDefault();
    if (!newComment) return;
    try {
      await fetchApi(`/api/discussions/${discussionId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: newComment })
      });
      setNewComment("");
      const discussionData = await fetchApi(`/api/discussions/${id}`);
      setDiscussions(discussionData);
    } catch (err) {
      alert(t("courseDetail.alert_post_comment_failed"));
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (newRating === 0) return alert(t("courseDetail.alert_select_rating"));
    setSubmitting(true);
    try {
      await fetchApi(`/api/courses/${id}/feedback`, {
        method: "POST",
        body: JSON.stringify({ rating: newRating, feedbackText: newReviewText })
      });
      setNewRating(0);
      setNewReviewText("");
      await loadCourse();
      alert(t("courseDetail.alert_review_thanks"));
    } catch (err) {
      alert(t("courseDetail.alert_submit_review_failed"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-12 text-center">{t("courseDetail.loading_course")}</div>;
  if (!course) return <div className="p-12 text-center text-red-500">{t("courseDetail.course_not_found")}</div>;

  return (
    <div dir={i18n.language === "ur" ? "rtl" : "ltr"} className="min-h-screen bg-bg">
      <div className="bg-gradient-to-r from-primary to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-4 sm:pt-6 sm:pb-6">
          <Link to="/dashboard" className="inline-flex items-center text-green-100 hover:text-white text-xs sm:text-sm font-medium transition-colors mb-2">
            <ChevronLeft className="h-3.5 w-3.5 me-1 rtl:rotate-180" />
            {t("courseDetail.back_to_dashboard")}
          </Link>
          <h1 className="text-xl sm:text-3xl md:text-4xl font-display font-bold mb-2 leading-snug max-w-3xl">{course.title}</h1>

          <div className="hidden sm:flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm font-medium">
            <div className="flex items-center gap-1.5">
              <span className="text-yellow-400">★</span>
              <span>{course.avgRating || 0}</span>
              <span className="text-green-200 font-normal">
                {t("courseDetail.reviews_count", { count: course.feedback?.filter((f) => f.rating)?.length || 0 })}
              </span>
            </div>
            <div className="text-green-100">{course.level}</div>
            <div className="text-green-100">{course.time}</div>
            <span className="px-2.5 py-0.5 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-sm">{course.stage}</span>
          </div>

          <div className="sm:hidden">
            <button onClick={() => setShowDetails(!showDetails)} className="flex items-center gap-1.5 text-sm font-medium text-green-100 hover:text-white transition-colors">
              <span className="text-yellow-400">★</span>
              <span>{course.avgRating || 0}</span>
              <span>· {t("courseDetail.details_toggle")}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showDetails ? "rotate-180" : ""}`} />
            </button>
            {showDetails && (
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium border-t border-white/20 pt-3">
                <div className="text-green-100">
                  {t("courseDetail.reviews_count", { count: course.feedback?.filter((f) => f.rating)?.length || 0 })}
                </div>
                <div className="text-green-100">{course.level}</div>
                <div className="text-green-100">{course.time}</div>
                <span className="px-2.5 py-0.5 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-sm">{course.stage}</span>
                <p className="w-full text-green-50 text-xs mt-1">{course.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            {[
              { key: "content", label: t("courseDetail.tab_content") },
              { key: "discussions", label: t("courseDetail.tab_discussions") },
              { key: "reviews", label: t("courseDetail.tab_reviews") }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 pt-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "content" ? (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/3 order-2 lg:order-1">
              <div className="bg-surface rounded-xl border border-border overflow-hidden sticky top-24 shadow-sm">
                <div className="p-4 border-b border-border bg-gray-50">
                  <h2 className="font-bold text-gray-900">{t("courseDetail.tab_content")}</h2>
                  <div className="text-sm text-gray-500 mt-1">
                    {t("courseDetail.items_completed", {
                      completed: course.modules?.filter((m) => m.status === "completed").length || 0,
                      total: course.modules?.length || 0
                    })}
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {course.modules?.map((mod) => (
                    <button
                      key={mod.id}
                      disabled={mod.status === "locked"}
                      onClick={() => { setActiveModule(mod); resetQuiz(); setShowGraph(false); }}
                      className={`w-full text-start p-4 flex gap-3 transition-colors ${
                        activeModule.id === mod.id
                          ? "bg-green-50 border-s-4 border-primary"
                          : mod.status === "locked"
                          ? "opacity-60 cursor-not-allowed"
                          : "hover:bg-gray-50 border-s-4 border-transparent"
                      }`}
                    >
                      <div className="mt-0.5">
                        {mod.status === "completed" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : mod.status === "locked" ? (
                          <Lock className="h-5 w-5 text-gray-400" />
                        ) : mod.type.toLowerCase().includes("video") ? (
                          <PlayCircle className="h-5 w-5 text-primary" />
                        ) : mod.type.toLowerCase().includes("pdf") ? (
                          <FileText className="h-5 w-5 text-primary" />
                        ) : (
                          <HelpCircle className="h-5 w-5 text-amber-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${activeModule.id === mod.id ? "text-primary" : "text-gray-900"}`}>{mod.title}</div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                          <span>{mod.type.replace("_", " ")}</span>
                          {mod.timeLimitMins && (<><span>•</span><span>{mod.timeLimitMins} mins</span></>)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-2/3 order-1 lg:order-2">
              <div className="bg-surface rounded-xl border border-border shadow-sm min-h-[500px] flex flex-col">
                <div className="p-4 sm:p-6 border-b border-border flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">{activeModule.title}</h2>
                  <Badge variant={activeModule?.status === "completed" ? "success" : activeModule?.type?.includes("ASSESSMENT") ? "warning" : "default"}>
                    {activeModule?.type?.replace("_", " ")}
                  </Badge>
                </div>

                <div className="flex-1 p-6 bg-gray-50 flex items-center justify-center">
                  {activeModule?.type === "VIDEO" && (
                    <div className="w-full max-w-2xl aspect-video bg-black rounded-lg flex flex-col items-center justify-center text-gray-400 relative overflow-hidden group">
                      <PlayCircle className="h-16 w-16 text-white opacity-80 transition-opacity mb-4" />
                      {activeModule?.contentUrl ? (
                        <a href={activeModule.contentUrl} target="_blank" rel="noopener noreferrer" className="text-white underline hover:text-primary transition-colors">
                          {t("courseDetail.watch_video_link")}
                        </a>
                      ) : (
                        <div className="text-white text-sm">{t("courseDetail.video_placeholder")}</div>
                      )}
                    </div>
                  )}

                  {activeModule?.type === "PDF" && (
                    <div className="w-full h-full min-h-[400px] bg-white rounded-lg border flex flex-col items-center justify-center text-gray-400">
                      <FileText className="h-16 w-16 mb-4 text-primary opacity-50" />
                      <p>{t("courseDetail.pdf_viewer_label")}</p>
                      {activeModule?.contentUrl ? (
                        <a href={activeModule.contentUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" className="mt-4">{t("courseDetail.open_pdf_button")}</Button>
                        </a>
                      ) : (
                        <Button variant="outline" className="mt-4" disabled>{t("courseDetail.no_pdf_uploaded")}</Button>
                      )}
                    </div>
                  )}

                  {activeModule?.type?.includes("ASSESSMENT") && !quizStarted && activeModule?.status !== "completed" && (
                    <div className="w-full max-w-lg bg-white p-8 rounded-xl border text-center shadow-sm">
                      <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                        <HelpCircle className="h-8 w-8 text-amber-600" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{t("courseDetail.knowledge_check")}</h3>
                      <p className="text-gray-600 mb-6">
                        {activeModule?.type === "PRE_ASSESSMENT" ? t("courseDetail.pre_assessment_intro") : t("courseDetail.post_assessment_intro")}
                      </p>
                      <p className="font-bold text-gray-800 mb-6">{t("courseDetail.passing_score_label", { score: activeModule.passingScore })}</p>
                      <Button className="w-full mb-4" onClick={() => setQuizStarted(true)}>
                        {t("courseDetail.start_assessment_button", { mins: activeModule.timeLimitMins || 15 })}
                      </Button>
                    </div>
                  )}

                  {activeModule?.type?.includes("ASSESSMENT") && quizStarted && activeModule?.status !== "completed" && !quizResult && (
                    <div className="w-full max-w-2xl bg-white p-8 rounded-xl border shadow-sm">
                      <h3 className="text-xl font-bold mb-6 border-b pb-4">{t("courseDetail.assessment_heading", { title: activeModule.title })}</h3>
                      {!activeModule.questions || activeModule.questions.length === 0 ? (
                        <p className="text-gray-500 italic">{t("courseDetail.no_questions_yet")}</p>
                      ) : (
                        <div className="space-y-8">
                          {activeModule.questions.map((q, idx) => {
                            const options = JSON.parse(q.optionsJson);
                            return (
                              <div key={q.id}>
                                <p className="font-semibold text-gray-900 mb-3">{idx + 1}. {q.questionText}</p>
                                <div className="space-y-2">
                                  {options.map((opt, oIdx) => (
                                    <label key={oIdx} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                      <input type="radio" name={`question_${q.id}`} className="h-4 w-4 text-primary" checked={answers[q.id] === opt} onChange={() => setAnswers({ ...answers, [q.id]: opt })} />
                                      <span>{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                          <Button className="w-full mt-6" onClick={() => handleSubmitAssessment(activeModule.id)} disabled={submitting || Object.keys(answers).length < activeModule.questions.length}>
                            {submitting ? t("courseDetail.submitting") : t("courseDetail.submit_answers")}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeModule?.type?.includes("ASSESSMENT") && quizResult && (
                    <div className="w-full max-w-lg bg-white p-8 rounded-xl border text-center shadow-sm">
                      <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${quizResult.passed ? "bg-green-100" : "bg-red-100"}`}>
                        {quizResult.passed ? <CheckCircle className="h-8 w-8 text-green-600" /> : <HelpCircle className="h-8 w-8 text-red-600" />}
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{t("courseDetail.you_scored", { score: quizResult.score })}</h3>
                      <p className="text-gray-600 mb-6">
                        {quizResult.passed ? t("courseDetail.passed_message") : t("courseDetail.failed_message", { score: activeModule.passingScore })}
                      </p>
                      {!quizResult.passed && (
                        <Button className="w-full" onClick={resetQuiz}>{t("courseDetail.retake_assessment")}</Button>
                      )}
                    </div>
                  )}

                  {activeModule?.type?.includes("ASSESSMENT") && activeModule?.status === "completed" && (
                    <div className="w-full max-w-lg bg-white p-8 rounded-xl border text-center shadow-sm">
                      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{t("courseDetail.assessment_completed_title")}</h3>
                      <p className="text-gray-600 mb-6">{t("courseDetail.assessment_completed_text")}</p>
                      {activeModule?.type === "POST_ASSESSMENT" && (
                        <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={() => setShowGraph(!showGraph)}>
                          <BarChart2 className="h-4 w-4" />
                          {t("courseDetail.view_improvement_graph")}
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-6 border-t border-border flex justify-between items-center bg-white rounded-b-xl">
                  <Button variant="outline" disabled={!previousModule} onClick={() => navigateToModule(previousModule)}>{t("courseDetail.previous_button")}</Button>
                  {!activeModule?.type?.includes("ASSESSMENT") && activeModule?.status !== "completed" && (
                    <Button onClick={() => handleMarkComplete(activeModule.id)} disabled={submitting || activeModule.status === "locked"}>
                      {submitting ? t("courseDetail.updating") : t("courseDetail.mark_as_completed")}
                    </Button>
                  )}
                  {activeModule?.status === "completed" && nextModule && (
                    <Button onClick={() => navigateToModule(nextModule)} disabled={nextModule.status === "locked"}>{t("courseDetail.next_module_button")}</Button>
                  )}
                  {activeModule?.status === "completed" && !nextModule && (
                    <Button variant="success" className="bg-green-600 hover:bg-green-700 text-white border-none shadow-lg animate-pulse" onClick={downloadCertificate}>
                      {t("courseDetail.download_certificate_button")}
                    </Button>
                  )}
                </div>
              </div>

              {showGraph && (() => {
                const preAssMod = course?.modules?.find((m) => m.type === "PRE_ASSESSMENT");
                const postAssMod = course?.modules?.find((m) => m.type === "POST_ASSESSMENT");
                const preScore = preAssMod?.progress?.[0]?.score || 0;
                const postScore = postAssMod?.progress?.[0]?.score || 0;
                const improvement = postScore - preScore;
                return (
                  <div className="mt-6 bg-surface rounded-xl border border-border p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-4">{t("courseDetail.learning_journey_title")}</h3>
                    <div className="h-64 flex items-end justify-around pb-6 pt-10 border-b border-s border-gray-200 relative px-4">
                      <div className="absolute start-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 -ms-6 py-6">
                        <span>100</span><span>50</span><span>0</span>
                      </div>
                      <div className="flex flex-col items-center w-1/3">
                        <div className="w-16 bg-blue-400 rounded-t-md relative group transition-all" style={{ height: `${Math.max(preScore, 5)}%` }}>
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">{preScore}%</div>
                        </div>
                        <span className="mt-3 text-sm font-medium text-gray-600">{t("courseDetail.pre_assessment_label")}</span>
                      </div>
                      <div className="flex flex-col items-center w-1/3">
                        <div className="w-16 bg-green-500 rounded-t-md relative group transition-all" style={{ height: `${Math.max(postScore, 5)}%` }}>
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">{postScore}%</div>
                        </div>
                        <span className="mt-3 text-sm font-medium text-gray-600">{t("courseDetail.post_assessment_label")}</span>
                      </div>
                    </div>
                    <p className="text-center mt-4 text-green-600 font-medium bg-green-50 p-2 rounded">
                      {improvement > 0 ? t("courseDetail.improvement_positive", { percent: improvement }) : t("courseDetail.improvement_neutral", { percent: improvement })}
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        ) : activeTab === "discussions" ? (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">{t("courseDetail.start_discussion_title")}</h2>
              <form onSubmit={handlePostDiscussion} className="space-y-4">
                <Input placeholder={t("courseDetail.discussion_title_placeholder")} value={newDiscussion.title} onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })} />
                <textarea className="w-full flex min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder={t("courseDetail.discussion_content_placeholder")} value={newDiscussion.content} onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })} />
                <div className="flex justify-end">
                  <Button type="submit">{t("courseDetail.post_discussion_button")}</Button>
                </div>
              </form>
            </div>
            <div className="space-y-4">
              {discussions.map((d) => (
                <div key={d.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><UserCircle className="h-6 w-6" /></div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{d.title}</h3>
                        <p className="text-sm text-gray-500 mb-2">{d.user.name} ({d.user.designation}) • {new Date(d.createdAt).toLocaleDateString()}</p>
                        <p className="text-gray-700 whitespace-pre-wrap">{d.content}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 border-t px-6 py-4">
                    <button onClick={() => setActiveDiscussionId(activeDiscussionId === d.id ? null : d.id)} className="text-sm font-medium text-primary flex items-center gap-2 hover:underline">
                      <MessageSquare className="h-4 w-4" />
                      {t("courseDetail.replies_count", { count: d.comments.length })}
                    </button>
                    {activeDiscussionId === d.id && (
                      <div className="mt-4 space-y-4">
                        {d.comments.map((c) => (
                          <div key={c.id} className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0"><UserCircle className="h-5 w-5" /></div>
                            <div className="flex-1 bg-white border rounded-lg p-3">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-sm text-gray-900">
                                  {c.user.name}
                                  {(c.user.role === "MODERATOR" || c.user.role === "ADMIN") && (
                                    <span className="ms-2 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">{t("courseDetail.instructor_tag")}</span>
                                  )}
                                </span>
                                <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-gray-700">{c.content}</p>
                            </div>
                          </div>
                        ))}
                        <form onSubmit={(e) => handlePostComment(d.id, e)} className="flex gap-2 mt-4 pt-4 border-t">
                          <Input placeholder={t("courseDetail.write_reply_placeholder")} className="flex-1" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                          <Button type="submit" variant="secondary">{t("courseDetail.reply_button")}</Button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {discussions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p>{t("courseDetail.no_discussions_yet")}</p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "reviews" ? (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">{t("courseDetail.leave_review_title")}</h2>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button type="button" key={star} onClick={() => setNewRating(star)} className={`text-3xl transition-colors hover:scale-110 ${newRating >= star ? "text-yellow-400" : "text-gray-300"}`}>★</button>
                  ))}
                </div>
                <textarea className="w-full flex min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" placeholder={t("courseDetail.review_placeholder")} value={newReviewText} onChange={(e) => setNewReviewText(e.target.value)} />
                <div className="flex justify-end">
                  <Button type="submit" disabled={submitting}>{t("courseDetail.submit_review_button")}</Button>
                </div>
              </form>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">{t("courseDetail.student_reviews_title")}</h3>
              {course?.feedback?.filter((f) => f.rating)?.length > 0 ? (
                course.feedback.filter((f) => f.rating).map((f) => (
                  <div key={f.id} className="bg-white rounded-xl border p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-primary font-bold">{f.user.name.charAt(0)}</div>
                      <div>
                        <div className="font-bold text-gray-900">{f.user.name}</div>
                        <div className="text-sm text-gray-500">{new Date(f.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="ms-auto text-yellow-400 text-lg">{"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}</div>
                    </div>
                    {f.feedbackText && <p className="text-gray-700">{f.feedbackText}</p>}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-4xl text-gray-300 block mb-2">⭐</span>
                  <p>{t("courseDetail.no_reviews_yet")}</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
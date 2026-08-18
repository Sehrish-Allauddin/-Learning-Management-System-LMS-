import React, { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { BookOpen, Clock, Award, PlayCircle ,TrendingUp} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [performance, setPerformance] = useState(null);
  const [performanceLoading, setPerformanceLoading] = useState(true);

  const [skillGaps, setSkillGaps] = useState([]);
  const [skillGapLoading, setSkillGapLoading] = useState(true);

  const [recommendations, setRecommendations] = useState([]);
  const [recommendationLoading, setRecommendationLoading] = useState(true);

  const currentLanguage = i18n.resolvedLanguage || i18n.language || "en";
  const isUrdu = currentLanguage.toLowerCase().startsWith("ur");

  // Keep dashboard UI language independent from API data.
  // Course titles/descriptions still come from the LMS API.
  const ui = (en, ur) => (isUrdu ? ur : en);

  const formatPercent = (value) => (
    <span dir="ltr" className="inline-block">{value}%</span>
  );

  const translateLevel = (level) => {
    if (!isUrdu) return level;
    const levels = {
      Good: "اچھا",
      Excellent: "بہترین",
      Average: "اوسط",
      Poor: "کمزور",
      "Needs Improvement": "مزید بہتری درکار ہے",
    };
    return levels[level] || level;
  };

  const translatePriority = (priority) => {
    if (!isUrdu) return priority;
    const priorities = {
      Recommended: "تجویز کردہ",
      High: "زیادہ ترجیح",
      Medium: "درمیانی ترجیح",
      Low: "کم ترجیح",
    };
    return priorities[priority] || priority;
  };

  const translateFactor = (factor) => {
    if (!isUrdu) return factor;
    const factors = {
      "strong assessment performance": "اسیسمنٹ میں مضبوط کارکردگی",
      "good module completion": "ماڈیولز کی اچھی تکمیل",
      "active learning progress": "فعال تعلیمی پیش رفت",
    };
    return factors[factor] || factor;
  };


  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await fetchApi("/api/courses/my-courses");
        setEnrolledCourses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);
  
  useEffect(() => {
    const loadPerformance = async () => {
     try {
       const data = await fetchApi("/api/recommendations/performance");
       setPerformance(data);
       } catch (err) {
         console.error(
          "Performance prediction error:",
           err
       );
      } finally {
        setPerformanceLoading(false);
      }
    };

     loadPerformance();
  }, []);

  useEffect(() => {
    const loadSkillGaps = async () => {
      try {
       const data = await fetchApi("/api/recommendations/skill-gaps");
       setSkillGaps(data.skillGaps || []);
       } catch (err) {
      console.error(
        "Skill gap detection error:",
         err
      );
    } finally {
      setSkillGapLoading(false);
    }
  };

   loadSkillGaps();
  }, []);
  
  useEffect(() => {
    const loadRecommendations = async () => {
      try {
      const data = await fetchApi( "/api/recommendations/courses?limit=3");
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error(
        "Course recommendation error:",
        err
      );
    } finally {
      setRecommendationLoading(false);
    }
  };

  loadRecommendations();
}, []);

  const getDeadlineColor = (status) => {
    if (status === "near") return "text-yellow-600 bg-yellow-100";
    if (status === "expired") return "text-red-600 bg-red-100";
    return "text-green-600 bg-green-100";
  };

  return (
    <div dir={isUrdu ? "rtl" : "ltr"} className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {ui(`Welcome, ${user?.name || "User"}!`, `خوش آمدید، ${user?.name || "صارف"}!`)}
        </h1>
        <p className="text-slate-400">{ui("Resume where you left off and complete your tasks.", "جہاں سے آپ نے چھوڑا تھا وہاں سے دوبارہ شروع کریں اور اپنے کام مکمل کریں۔")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary to-green-800 text-white border-transparent">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-green-100 mb-1">{ui("Ongoing courses", "جاری کورسز")}</p>
                <h3 className="text-3xl font-bold">{loading ? "..." : enrolledCourses.length}</h3>
              </div>
              <div className="p-3 bg-white/20 rounded-lg border border-slate-700/60 bg-slate-900/50">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 mb-1">{ui("Completed courses", "مکمل شدہ کورسز")}</p>
                <h3 className="text-3xl font-bold text-white">0</h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-slate-700/60 bg-slate-900/50">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 mb-1">{ui("Learning hours", "سیکھنے کے اوقات")}</p>
                <h3 className="text-3xl font-bold text-white">0</h3>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-slate-700/60 bg-slate-900/50">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-lg font-bold text-white mb-4 mt-2">{ui("Your enrolled courses", "آپ کے داخل شدہ کورسز")}</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
      {/* ==================================================
          STUDENT PERFORMANCE PREDICTION
          ================================================== */}

      <Card className="border-primary/20 bg-slate-950/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {ui("Your Learning Performance", "آپ کی تعلیمی کارکردگی")}
              </CardTitle>

              <p className="text-sm text-slate-400 mt-1">
                {ui("AI-based prediction from your LMS learning activity", "آپ کی LMS تعلیمی سرگرمی کی بنیاد پر AI پیش گوئی")}
              </p>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-slate-700/60 bg-slate-900/50">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {performanceLoading ? (
            <p className="text-slate-400">
              {ui("Analyzing your learning performance...", "آپ کی تعلیمی کارکردگی کا تجزیہ کیا جا رہا ہے...")}
            </p>
          ) : !performance?.available ? (
            <p className="text-slate-400">
              {ui("Not enough learning data available yet.", "ابھی کافی تعلیمی ڈیٹا دستیاب نہیں ہے۔")}
            </p>
          ) : (
            <div className="space-y-4">

              {/* Prediction */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">
                    {ui("Predicted Performance", "متوقع کارکردگی")}
                  </p>

                  <p className="text-3xl font-bold text-white">
                    {formatPercent(performance.prediction.predictedScore)}
                  </p>
                </div>

                <Badge
                  variant="secondary"
                  className="!bg-slate-900 !text-green-400 !border !border-slate-700"
                >
                  {translateLevel(performance.prediction.performanceLevel)}
                </Badge>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/60 bg-slate-900/50">
                  <p className="text-xs text-slate-400">
                    {ui("Average Score", "اوسط اسکور")}
                  </p>

                  <p className="text-xl font-bold">
                    {formatPercent(performance.statistics.averageScore)}
                  </p>
                </div>

                <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/60 bg-slate-900/50">
                  <p className="text-xs text-slate-400">
                    {ui("Completion Rate", "تکمیل کی شرح")}
                  </p>

                  <p className="text-xl font-bold">
                    {formatPercent(performance.statistics.completionRate)}
                  </p>
                </div>

                <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/60 bg-slate-900/50">
                  <p className="text-xs text-slate-400">
                    {ui("Completed", "مکمل شدہ")}
                  </p>

                  <p className="text-xl font-bold">
                    {performance.statistics.completedModules}
                  </p>
                </div>

                <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/60 bg-slate-900/50">
                  <p className="text-xs text-slate-400">
                    {ui("In Progress", "جاری ہے")}
                  </p>

                  <p className="text-xl font-bold">
                    {performance.statistics.inProgressModules}
                  </p>
                </div>

              </div>

              {/* Factors */}
              {performance.factors?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-white mb-2">
                    {ui("Performance Factors", "کارکردگی کے عوامل")}
                  </p>

                  <ul className="space-y-1">
                    {performance.factors.map(
                      (factor, index) => (
                        <li
                          key={index}
                          className="text-sm text-slate-300"
                        >
                          • {translateFactor(factor)}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

            </div>
          )}
        </CardContent>
      </Card>
      {/* ==================================================
    SKILL GAP DETECTION
    ================================================== */}

<Card className="border-primary/20 bg-slate-950/30">
  <CardHeader className="pb-3">
    <div className="flex items-center justify-between">
      <div>
        <CardTitle>
          {ui("Your Skill Gaps", "آپ کی مہارتوں میں خلا")}
        </CardTitle>

        <p className="text-sm text-slate-400 mt-1">
          {ui("Skills recommended based on your learning progress", "آپ کی تعلیمی پیش رفت کی بنیاد پر تجویز کردہ مہارتیں")}
        </p>
      </div>

      <div className="p-3 bg-amber-50 rounded-lg border border-slate-700/60 bg-slate-900/50">
        <BookOpen className="h-6 w-6 text-amber-600" />
      </div>
    </div>
  </CardHeader>

  <CardContent className="pt-0">
    {skillGapLoading ? (
      <p className="text-slate-400">
        {ui("Analyzing your skills...", "آپ کی مہارتوں کا تجزیہ کیا جا رہا ہے...")}
      </p>
    ) : skillGaps.length === 0 ? (
      <p className="text-slate-400">
        {ui("No skill gaps detected at the moment.", "اس وقت کسی مہارت میں خلا کی نشاندہی نہیں ہوئی۔")}
      </p>
    ) : (
      <div className="space-y-3">
        {skillGaps.map((gap, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 p-3 rounded-xl border border-slate-700/60 bg-slate-900/50"
          >
            <div>
              <p className="font-semibold text-white">
                {gap.skill}
              </p>

              <p className="text-sm text-slate-400">
                {ui("Recommended for your learning profile", "آپ کے تعلیمی پروفائل کے لیے تجویز کردہ")}
              </p>
            </div>

            <Badge
              variant="secondary"
              className="!bg-slate-900 !text-green-400 !border !border-slate-700"
            >
              {translatePriority(gap.priority)}
            </Badge>
          </div>
        ))}
      </div>
    )}
  </CardContent>
</Card>
{/* ==================================================
    COURSE RECOMMENDATIONS
    ================================================== */}

<Card className="border-primary/20 bg-slate-950/30">
  <CardHeader className="pb-3">
    <div className="flex items-center justify-between">
      <div>
        <CardTitle>
          {ui("Recommended For You", "آپ کے لیے تجویز کردہ")}
        </CardTitle>

        <p className="text-sm text-slate-400 mt-1">
          {ui("Courses selected based on your learning profile", "آپ کے تعلیمی پروفائل کی بنیاد پر منتخب کیے گئے کورسز")}
        </p>
      </div>

      <div className="p-3 bg-blue-50 rounded-lg border border-slate-700/60 bg-slate-900/50">
        <BookOpen className="h-6 w-6 text-blue-600" />
      </div>
    </div>
  </CardHeader>

  <CardContent className="pt-0">
    {recommendationLoading ? (
      <p className="text-slate-400">
        {ui("Finding courses for you...", "آپ کے لیے کورسز تلاش کیے جا رہے ہیں...")}
      </p>
    ) : recommendations.length === 0 ? (
      <p className="text-slate-400">
        {ui("No course recommendations available yet.", "ابھی کوئی کورس تجویز دستیاب نہیں ہے۔")}
      </p>
    ) : (
      <div className="space-y-3">
        {recommendations.map((course) => (
          <div
            key={course.courseId}
            className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/50 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white">
                  {course.title}
                </h3>

                <p className="text-sm text-slate-400 mt-1">
                  {course.description}
                </p>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                  {course.reason}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-xs text-slate-400 mb-1">{ui("Match", "مطابقت")}</div>
                <div className="inline-flex items-center rounded-full !bg-slate-900 border border-slate-700 px-3 py-1 text-sm font-bold !text-green-400">
                  {formatPercent(course.score)}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Link to={`/course/${course.courseId}`}>
                <Button
                  variant="default"
                  size="sm"
                >
                  {ui("View Course", "کورس دیکھیں")}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    )}
  </CardContent>
</Card>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-slate-400 col-span-2">
            {ui("Loading courses...", "کورسز لوڈ کیے جا رہے ہیں...")}
          </p>
        ) : enrolledCourses.length === 0 ? (
          <p className="text-slate-400 col-span-2">
            {ui("You are not enrolled in any courses. ", "آپ نے ابھی کسی کورس میں داخلہ نہیں لیا۔ ")}{" "}
            <Link
              to="/courses"
              className="text-primary hover:underline"
            >
              {ui("Course Catalog", "کورس کیٹلاگ")}
            </Link>
            .
          </p>
        ) : (
          enrolledCourses.map((course) => (
            <Card
              key={course.id}
              className="overflow-hidden border border-slate-700/60 hover:border-primary/40 hover:shadow-md transition-all duration-200"
            >
              <div className="flex min-h-[190px]">
                {/* Course Icon */}
                <div className="w-[125px] shrink-0 bg-green-50 dark:bg-green-950/20 border-e border-slate-700/60 flex flex-col items-center justify-center gap-4">
                  <div className="flex items-center justify-center h-14 w-14 rounded-full bg-white dark:bg-slate-900 shadow-sm">
                    <BookOpen className="h-7 w-7 text-primary" />
                  </div>

                  <span className="text-xs font-semibold px-3 py-1 rounded-full !bg-slate-900 !text-green-400 border border-slate-700">
                    {ui("No Deadline", "کوئی آخری تاریخ نہیں")}
                  </span>
                </div>

                {/* Course Content */}
                <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                  <div>
                    {/* Title + Status */}
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-lg text-white leading-tight">
                        {course.title}
                      </h3>

                      <Badge
                        variant="secondary"
                        className="shrink-0 !bg-slate-900 !text-green-400 !border !border-slate-700"
                      >
                        {ui("In Progress", "جاری ہے")}
                      </Badge>
                    </div>

                    {/* Progress */}
                    <div className="mt-5">
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-slate-400">
                          {ui("Progress", "پیش رفت")}
                        </span>

                        <span className="font-semibold text-white">
                          50%
                        </span>
                      </div>

                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: "50%" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Continue Button */}
                  <div className="mt-5 flex justify-end">
                    <Link to={`/course/${course.id}`}>
                      <Button
                        variant="default"
                        size="sm"
                        className="px-5"
                      >
                        <PlayCircle className="h-4 w-4 me-2" />
                        {ui("Continue", "جاری رکھیں")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
  
}
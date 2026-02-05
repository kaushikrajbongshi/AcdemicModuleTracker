"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import SummaryCards from "@/components/faculty/TopicTree/dashboard/SummaryCard";
import CourseWiseProgress from "@/components/faculty/TopicTree/dashboard/CourseProgress";
import TopicWiseTable from "@/components/faculty/TopicTree/dashboard/TopicTable";
import DashboardSkeleton from "@/components/faculty/TopicTree/dashboard/DashboardSkeleton";

export default function ProgressDashboard() {
  const [summary, setSummary] = useState(null);
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);

  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* =========================
     FETCH SUMMARY
  ========================= */
  const fetchSummary = async () => {
    try {
      const res = await fetch("/api/faculty/progress/dashboard/summary", {
        cache: "no-store",
      });
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error("Failed to fetch summary", err);
    }
  };

  /* =========================
     FETCH COURSES
  ========================= */
  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const res = await fetch("/api/faculty/progress/dashboard/course_wise", {
        cache: "no-store",
      });
      const data = await res.json();
      setCourses(data);

      // default course selection
      if (data.length > 0) {
        setSelectedCourseId((prev) => prev ?? data[0].courseId);
      }
    } catch (err) {
      console.error("Failed to fetch courses", err);
    } finally {
      setCoursesLoading(false);
    }
  };

  /* =========================
     FETCH TOPICS (BY COURSE)
  ========================= */
  const fetchTopics = async (courseId) => {
    if (!courseId) return;

    try {
      setTopicsLoading(true);
      const res = await fetch(
        `/api/faculty/progress/dashboard/topics?courseId=${courseId}`,
        { cache: "no-store" },
      );
      const data = await res.json();
      setTopics(data);
    } catch (err) {
      console.error("Failed to fetch topics", err);
    } finally {
      setTopicsLoading(false);
    }
  };

  /* =========================
     INITIAL LOAD
  ========================= */
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchSummary(), fetchCourses()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  /* =========================
     LOAD TOPICS ON COURSE CHANGE
  ========================= */
  useEffect(() => {
    if (selectedCourseId) {
      fetchTopics(selectedCourseId);
    }
  }, [selectedCourseId]);

  /* =========================
     REFRESH HANDLER
  ========================= */
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchSummary(),
      fetchCourses(),
      selectedCourseId && fetchTopics(selectedCourseId),
    ]);
    setRefreshing(false);
  };

  /* =========================
     LOADING STATE
  ========================= */
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Module Progress Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Track your academic module completion status
          </p>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>
            Last updated:{" "}
            {summary?.lastUpdated
              ? new Date(summary.lastUpdated).toLocaleString()
              : "—"}
          </span>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-full hover:bg-gray-200 transition"
            title="Refresh"
          >
            <RefreshCw
              size={18}
              className={refreshing ? "animate-spin text-blue-600" : ""}
            />
          </button>
        </div>
      </div>

      {/* ================= SUMMARY ================= */}
      <SummaryCards summary={summary} />

      {/* ================= COURSE-WISE ================= */}
      {coursesLoading ? (
        <DashboardSkeleton />
      ) : (
        <CourseWiseProgress courses={courses} />
      )}
      {/* ================= TOPIC-WISE ================= */}
      {topicsLoading ? (
        <DashboardSkeleton />
      ) : (
        <TopicWiseTable
          topics={topics}
          courses={courses}
          selectedCourseId={selectedCourseId}
          onCourseChange={setSelectedCourseId}
        />
      )}
    </div>
  );
}

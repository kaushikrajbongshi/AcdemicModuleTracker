"use client";
import { useEffect, useState } from "react";

export default function CourseComparisonDashboard() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [summaryMetrics, setSummaryMetrics] = useState(null);
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getStatusBadge = (status) => {
    const styles = {
      "on-track": "bg-green-50 text-green-700 ring-1 ring-green-600/20",
      moderate: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
      lagging: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
    };

    const labels = {
      "on-track": "On Track",
      moderate: "Moderate",
      lagging: "Lagging",
    };

    const icons = {
      "on-track": (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      moderate: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
      lagging: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {icons[status]}
        {labels[status]}
      </span>
    );
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "text-green-600";
    if (progress >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getProgressBarColor = (progress) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const getTrendIcon = (trend) => {
    if (trend === "up") {
      return (
        <svg
          className="w-4 h-4 text-green-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
            clipRule="evenodd"
          />
        </svg>
      );
    } else if (trend === "down") {
      return (
        <svg
          className="w-4 h-4 text-red-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    return (
      <svg
        className="w-4 h-4 text-gray-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
          clipRule="evenodd"
        />
      </svg>
    );
  };

  const fetchCourseComparison = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hod/course-comparison/summary");
      const data = await res.json();

      // courses dropdown
      setCourses(
        data.courses.map((c) => ({
          id: c.courseId,
          name: c.courseName,
        })),
      );

      // auto-select first course
      if (data.courses.length > 0) {
        setSelectedCourse(data.courses[0].courseId);
      }

      // summary cards
      setSummaryMetrics({
        totalFaculties: data.courses.reduce(
          (sum, c) => sum + c.facultyCount,
          0,
        ),
        averageProgress: data.summary.averageProgress,
        onTrack: data.summary.onTrack,
        lagging: data.summary.lagging,
      });
    } catch (err) {
      console.error("Failed to load course comparison", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReload = () => {
    fetchCourseComparison();
  };

  const generateExcelReport = () => {
    // Create CSV content
    const selectedCourseName =
      courses.find((c) => c.id === selectedCourse)?.name || "Course";

    let csvContent = `Course Comparison Report - ${selectedCourseName}\n\n`;

    // Summary Metrics
    csvContent += "Summary Metrics\n";
    csvContent += `Total Faculties,${summaryMetrics?.totalFaculties || 0}\n`;
    csvContent += `Average Progress,${summaryMetrics?.averageProgress || 0}%\n`;
    csvContent += `On Track,${summaryMetrics?.onTrack || 0}\n`;
    csvContent += `Lagging,${summaryMetrics?.lagging || 0}\n\n`;

    // Faculty Details
    csvContent += "Faculty Progress Comparison\n";
    csvContent +=
      "Faculty Name,Department,Completed Topics,Total Topics,Progress (%),Status,Trend,Last Updated\n";

    comparisonData.forEach((faculty) => {
      const statusLabel =
        faculty.status === "on-track"
          ? "On Track"
          : faculty.status === "moderate"
            ? "Moderate"
            : "Lagging";
      const trendLabel =
        faculty.trend === "up"
          ? "Up"
          : faculty.trend === "down"
            ? "Down"
            : "Stable";

      csvContent += `"${faculty.facultyName}","${faculty.department}",${faculty.completedTopics},${faculty.totalTopics},${faculty.progress},"${statusLabel}","${trendLabel}","${faculty.lastUpdated}"\n`;
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Course_Comparison_Report_${selectedCourseName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchCourseComparison();
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;

    const fetchFacultyComparison = async () => {
      try {
        const res = await fetch(
          `/api/hod/course-comparison/course-faculty-progress?courseId=${selectedCourse}`,
        );
        const data = await res.json();

        const mapped = data.faculties.map((f) => {
          let trend = "stable";
          if (f.progress >= 70) trend = "up";
          else if (f.progress < 40) trend = "down";

          return {
            id: f.facultyId,
            facultyName: f.facultyName,
            department: f.department ?? "—",
            completedTopics: Number(f.topicsCovered.split("/")[0]),
            totalTopics: Number(f.topicsCovered.split("/")[1]),
            progress: f.progress,
            status:
              f.status === "ON_TRACK"
                ? "on-track"
                : f.status === "MODERATE"
                  ? "moderate"
                  : "lagging",
            lastUpdated: f.lastUpdated
              ? new Date(f.lastUpdated).toLocaleString()
              : "—",
            trend,
          };
        });

        setComparisonData(mapped);
      } catch (err) {
        console.error("Failed to load faculty comparison", err);
      }
    };

    fetchFacultyComparison();
  }, [selectedCourse]);

  if (loading || !summaryMetrics) {
    return <div className="p-6 text-gray-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header and Filters */}
        <div className="flex items-start justify-between mb-8">
          {/* Header Section */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
              <h1 className="text-3xl font-bold text-gray-900">
                Course Comparison
              </h1>
            </div>
            <p className="text-gray-600 text-sm ml-4 pl-3">
              Compare teaching progress across faculties for a selected course
            </p>
          </div>

          {/* Filters Section */}
          <div className="flex items-end gap-3">
            {/* Course Dropdown */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Select Course
              </label>
              <div className="relative">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="appearance-none px-4 py-2.5 pr-10 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[300px] shadow-sm transition-all"
                >
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>

                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Reload Button */}
            <button
              onClick={handleReload}
              className="p-2.5 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              title="Reload Data"
            >
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>

            {/* Generate Report Button */}
            <button
              onClick={generateExcelReport}
              className="p-2.5 border border-gray-300 rounded-xl bg-white hover:bg-blue-50 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              title="Generate Excel Report"
            >
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Faculties */}
          <div className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Total Faculties
                </span>
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {summaryMetrics.totalFaculties}
              </div>
              <p className="text-xs text-gray-500">Teaching this course</p>
            </div>
          </div>

          {/* Average Progress */}
          <div className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Average Progress
                </span>
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-indigo-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {summaryMetrics.averageProgress}%
              </div>
              <p className="text-xs text-gray-500">Overall completion rate</p>
            </div>
          </div>

          {/* On Track */}
          <div className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  On Track
                </span>
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {summaryMetrics.onTrack}
              </div>
              <p className="text-xs text-gray-500">Meeting expectations</p>
            </div>
          </div>

          {/* Lagging */}
          <div className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Lagging
                </span>
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {summaryMetrics.lagging}
              </div>
              <p className="text-xs text-gray-500">Needs attention</p>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Faculty Progress Comparison
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Detailed breakdown of teaching progress by faculty member
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Last updated: 2 hours ago</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Faculty Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Topics Completed
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Trend
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comparisonData.map((faculty, index) => (
                  <tr
                    key={faculty.id}
                    className="hover:bg-blue-50/30 transition-colors duration-150 group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {faculty.facultyName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {faculty.facultyName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {faculty.department}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <div className="text-sm font-semibold text-gray-900">
                          {faculty.completedTopics} / {faculty.totalTopics}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {faculty.totalTopics - faculty.completedTopics}{" "}
                          remaining
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-sm font-bold ${getProgressColor(faculty.progress)} min-w-[45px]`}
                        >
                          {faculty.progress}%
                        </span>
                        <div className="flex-1 max-w-[140px]">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-500 ${getProgressBarColor(faculty.progress)}`}
                              style={{ width: `${faculty.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(faculty.status)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        {getTrendIcon(faculty.trend)}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {faculty.lastUpdated}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {comparisonData.length}
                </span>{" "}
                faculties
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Data refreshes every 30 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

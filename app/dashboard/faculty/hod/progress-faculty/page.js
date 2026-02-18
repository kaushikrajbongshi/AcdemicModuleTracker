"use client";
import { useState, useEffect } from "react";

export default function FacultyProgressDashboard() {
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [summaryMetrics, setSummaryMetrics] = useState({
    overallProgress: 0,
    totalTopics: 0,
    completedTopics: 0,
    pendingTopics: 0,
  });
  const [topicsData, setTopicsData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all faculty on component mount
  useEffect(() => {
    fetchAllFaculty();
  }, []);

  // Fetch courses when faculty is selected
  useEffect(() => {
    if (selectedFaculty) {
      fetchFacultyCourses(selectedFaculty);
    }
  }, [selectedFaculty]);

  // Fetch progress when both faculty and course are selected
  useEffect(() => {
    if (selectedFaculty && selectedCourse) {
      fetchProgress(selectedFaculty, selectedCourse);
    }
  }, [selectedFaculty, selectedCourse]);

  const fetchAllFaculty = async () => {
    try {
      const response = await fetch("/api/hod/faculty-progress/faculties");
      const data = await response.json();
      const facultyList = data.faculties || [];
      setFaculties(facultyList);
      if (facultyList.length > 0) {
        setSelectedFaculty(String(facultyList[0].id));
      }
    } catch (error) {
      console.error("Error fetching faculty:", error);
      setFaculties([]);
    }
  };

  const fetchFacultyCourses = async (facultyId) => {
    try {
      const response = await fetch(
        `/api/hod/faculty-progress/faculty-courses?facultyId=${facultyId}`,
      );
      const data = await response.json();
      const coursesList = data.courses || [];
      setCourses(coursesList);
      if (coursesList.length > 0) {
        setSelectedCourse(coursesList[0].id);
      } else {
        setSelectedCourse("");
        setCourses([]);
        setTopicsData([]);
        setSummaryMetrics({
          overallProgress: 0,
          totalTopics: 0,
          completedTopics: 0,
          pendingTopics: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    }
  };

  const fetchProgress = async (facultyId, courseId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/hod/faculty-progress/progress?facultyId=${facultyId}&courseId=${courseId}`,
      );
      const data = await response.json();
      console.log("facultyId:", facultyId);
      console.log("courseId from query:", courseId);

      const topicsList = data.topics || [];
      const summary = data.summary || {
        overallProgress: 0,
        totalTopics: 0,
        completedTopics: 0,
        pendingTopics: 0,
      };

      setTopicsData(topicsList);
      setSummaryMetrics(summary);
    } catch (error) {
      console.error("Error fetching progress:", error);
      setTopicsData([]);
      setSummaryMetrics({
        overallProgress: 0,
        totalTopics: 0,
        completedTopics: 0,
        pendingTopics: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: "bg-green-50 text-green-700 ring-1 ring-green-600/20",
      "in-progress": "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
      "not-started": "bg-gray-50 text-gray-700 ring-1 ring-gray-600/20",
    };

    const labels = {
      completed: "Completed",
      "in-progress": "In Progress",
      "not-started": "Not Started",
    };

    const icons = {
      completed: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      "in-progress": (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      "not-started": (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
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

  const getProgressPercentage = (completed, total) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getProgressColor = (percentage) => {
    if (percentage === 100) return "text-green-600";
    if (percentage >= 50) return "text-blue-600";
    if (percentage > 0) return "text-amber-600";
    return "text-gray-600";
  };

  const getProgressBarColor = (percentage) => {
    if (percentage === 100) return "bg-green-500";
    if (percentage >= 50) return "bg-blue-500";
    if (percentage > 0) return "bg-amber-500";
    return "bg-gray-300";
  };

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
                Faculty Progress
              </h1>
            </div>
            <p className="text-gray-600 text-sm ml-4 pl-3">
              Detailed teaching progress of an individual faculty member
            </p>
          </div>

          {/* Filter Section */}
          <div className="flex items-end gap-3">
            {/* Faculty Dropdown */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Select Faculty
              </label>
              <div className="relative">
                <select
                  className="appearance-none px-4 py-2.5 pr-10 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[220px] shadow-sm transition-all"
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                >
                  {faculties.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name}
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

            {/* Course Dropdown */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Select Course
              </label>
              <div className="relative">
                <select
                  className="appearance-none px-4 py-2.5 pr-10 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[280px] shadow-sm transition-all"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  disabled={courses.length === 0}
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
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Overall Progress */}
          <div className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Overall Progress
                </span>
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
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
                {summaryMetrics.overallProgress}%
              </div>
              <p className="text-xs text-gray-500">Course completion rate</p>
            </div>
          </div>

          {/* Total Topics */}
          <div className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Total Topics
                </span>
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-indigo-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {summaryMetrics.totalTopics}
              </div>
              <p className="text-xs text-gray-500">Topics in syllabus</p>
            </div>
          </div>

          {/* Completed Topics */}
          <div className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Completed Topics
                </span>
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {summaryMetrics.completedTopics}
              </div>
              <p className="text-xs text-gray-500">Topics finished</p>
            </div>
          </div>

          {/* Pending Topics */}
          <div className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Pending Topics
                </span>
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-amber-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {summaryMetrics.pendingTopics}
              </div>
              <p className="text-xs text-gray-500">Topics remaining</p>
            </div>
          </div>
        </div>

        {/* Topic-wise Progress Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Topic-wise Progress
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Breakdown of teaching progress by topic and subtopic
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-600">
                  Live Data
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Topic Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Subtopics Progress
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Completion
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : topicsData.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No data available
                    </td>
                  </tr>
                ) : (
                  topicsData.map((topic, index) => {
                    const percentage = getProgressPercentage(
                      topic.completedSubtopics,
                      topic.totalSubtopics,
                    );
                    return (
                      <tr
                        key={topic.topicId}
                        className="hover:bg-blue-50/30 transition-colors duration-150 group"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-xs">
                              {index + 1}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {topic.topicName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {topic.completedSubtopics}
                            </span>
                            <span className="text-sm text-gray-500">
                              / {topic.totalSubtopics}
                            </span>
                            <span className="text-xs text-gray-400">
                              subtopics
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-sm font-bold ${getProgressColor(percentage)} min-w-[45px]`}
                            >
                              {percentage}%
                            </span>
                            <div className="flex-1 max-w-[160px]">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className={`h-2.5 rounded-full transition-all duration-500 ${getProgressBarColor(percentage)}`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {getStatusBadge(topic.status)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {topicsData.length}
                </span>{" "}
                topics
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-xs text-gray-600">Not Started</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

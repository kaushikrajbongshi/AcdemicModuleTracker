"use client";

import { useEffect, useRef, useState } from "react";

export default function FacultyHistoryTable() {
  const tableRef = useRef(null);
  const dataTableRef = useRef(null);

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [activity, setActivity] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // ============================================
  // FETCH ASSIGNED COURSES (ACTIVE YEAR)
  // ============================================
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/faculty/assigned-courses");
        const json = await res.json();
        setCourses(json.result || []);
      } catch (err) {
        console.error("Course fetch error:", err);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  // ============================================
  // FETCH ACTIVITY AFTER COURSE SELECT
  // ============================================
  useEffect(() => {
    if (!selectedCourse) return;

    const fetchActivity = async () => {
      setLoadingActivity(true);
      try {
        const res = await fetch(
          `/api/faculty/history?courseId=${selectedCourse}`,
        );
        const json = await res.json();
        setActivity(json.result || []);
      } catch (err) {
        console.error("Activity fetch error:", err);
      } finally {
        setLoadingActivity(false);
      }
    };

    fetchActivity();
  }, [selectedCourse]);

  // ============================================
  // INIT DATATABLE
  // ============================================
  useEffect(() => {
    if (!activity.length || !tableRef.current) return;

    let mounted = true;

    const initTable = async () => {
      const $ = (await import("jquery")).default;
      window.$ = window.jQuery = $;
      await import("datatables.net-dt");

      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }

      if (!mounted) return;

      dataTableRef.current = $(tableRef.current).DataTable({
        data: activity,
        columns: [
          { data: "date", title: "Date" },
          { data: "course", title: "Course" },
          { data: "semester", title: "Semester" },
          { data: "topic", title: "Topic" },
          { data: "subtopic", title: "SubTopic" },
          { data: "remark", title: "Remark" },
        ],
        pageLength: 10,
        ordering: true,
        searching: true,
        paging: true,
        destroy: true,
        order: [[0, "desc"]],
      });
    };

    initTable();

    return () => {
      mounted = false;
      dataTableRef.current?.destroy();
    };
  }, [activity]);

  return (
    <div className="p-6 text-black">
      <h2 className="text-2xl mb-4 font-semibold">
        My Teaching History (Active Year)
      </h2>

      {/* COURSE DROPDOWN */}
      {loadingCourses ? (
        <p>Loading courses...</p>
      ) : (
        <div className="mb-4">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course.course_id} value={course.course_id}>
                {course.course_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* TABLE */}
      {loadingActivity && <p>Loading history...</p>}

      {selectedCourse && (
        <table
          ref={tableRef}
          className="display stripe hover"
          style={{ width: "100%" }}
        >
          <thead>
            <tr>
              <th>Date</th>
              <th>Course</th>
              <th>Semester</th>
              <th>Topic</th>
              <th>SubTopic</th>
              <th>Remark</th>
            </tr>
          </thead>
        </table>
      )}
    </div>
  );
}

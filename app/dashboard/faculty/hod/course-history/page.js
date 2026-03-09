"use client";

import { useEffect, useRef, useState } from "react";

export default function HodHistoryTable() {
  const tableRef = useRef(null);
  const dataTableRef = useRef(null);

  const [years, setYears] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(false);

  // FETCH ACADEMIC YEARS
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await fetch("/api/academic/year");
        const json = await res.json();
        setYears(json.result || []);
      } catch (err) {
        console.error("Year fetch error:", err);
      }
    };
    fetchYears();
  }, []);

  // FETCH FACULTY (BY YEAR)
  useEffect(() => {
    if (!selectedYear) return;
    const fetchFaculty = async () => {
      try {
        const res = await fetch(
          `/api/hod/course-histroy/faculty-list?academicYearId=${selectedYear}`,
        );
        const json = await res.json();
        setFaculties(json.result || []);
      } catch (err) {
        console.error("Faculty fetch error:", err);
      }
    };
    fetchFaculty();
  }, [selectedYear]);

  // FETCH COURSES (BY FACULTY + YEAR)
  useEffect(() => {
    if (!selectedFaculty || !selectedYear) return;
    const fetchCourses = async () => {
      try {
        const res = await fetch(
          `/api/hod/course-histroy/faculty-courses?facultyId=${selectedFaculty}&academicYearId=${selectedYear}`,
        );
        const json = await res.json();
        setCourses(json.result || []);
      } catch (err) {
        console.error("Course fetch error:", err);
      }
    };
    fetchCourses();
  }, [selectedFaculty, selectedYear]);

  // FETCH HISTORY
  useEffect(() => {
    if (!selectedFaculty || !selectedCourse || !selectedYear) return;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/hod/course-histroy/history-list?facultyId=${selectedFaculty}&courseId=${selectedCourse}&academicYearId=${selectedYear}`,
        );
        const json = await res.json();
        setActivity(json.result || []);
      } catch (err) {
        console.error("History fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [selectedFaculty, selectedCourse, selectedYear]);

  // INIT / REINIT DATATABLE
  useEffect(() => {
    if (!selectedCourse || !tableRef.current) return;

    let mounted = true;

    const initTable = async () => {
      const $ = (await import("jquery")).default;
      window.$ = window.jQuery = $;
      await import("datatables.net-dt");

      if (!mounted) return;

      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
        dataTableRef.current = null;
      }

      $(tableRef.current).find("tbody").empty();

      if (!activity || activity.length === 0) return;

      dataTableRef.current = $(tableRef.current).DataTable({
        data: activity,
        columns: [
          {
            data: "date",
            title: "Date",
            render: (data) => new Date(data).toLocaleDateString(),
          },
          { data: "topic", title: "Topic" },
          { data: "subtopic", title: "Subtopic" },
          { data: "remark", title: "Remark", defaultContent: "" },
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
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }
    };
  }, [activity, selectedCourse]);

  return (
    <div className="p-6 text-black">
      <h2 className="text-2xl mb-6 font-semibold">Faculty Teaching History</h2>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(e.target.value);
            setSelectedFaculty("");
            setSelectedCourse("");
            setActivity([]);
          }}
          className="border px-3 py-2 rounded"
        >
          <option value="">Select Academic Year</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.label}
            </option>
          ))}
        </select>

        <select
          value={selectedFaculty}
          onChange={(e) => {
            setSelectedFaculty(e.target.value);
            setSelectedCourse("");
            setActivity([]);
          }}
          disabled={!selectedYear}
          className="border px-3 py-2 rounded disabled:bg-gray-100"
        >
          <option value="">Select Faculty</option>
          {faculties.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>

        <select
          value={selectedCourse}
          onChange={(e) => {
            setSelectedCourse(e.target.value);
            setActivity([]);
          }}
          disabled={!selectedFaculty}
          className="border px-3 py-2 rounded disabled:bg-gray-100"
        >
          <option value="">Select Course</option>
          {courses.map((c) => (
            <option key={c.course_id} value={c.course_id}>
              {c.course_name}
            </option>
          ))}
        </select>
      </div>

      {/* STATUS — isolated in its own div, never a sibling of DataTable wrapper */}
      <div>
        {loading && <p className="mb-4 text-gray-600">Loading history...</p>}
        {!loading && selectedCourse && activity.length === 0 && (
          <p className="text-gray-500 mt-2">No teaching history found.</p>
        )}
      </div>

      {selectedCourse && activity.length > 0 && (
        <div>
          <table
            ref={tableRef}
            className="display stripe hover"
            style={{ width: "100%" }}
          >
            <thead>
              <tr>
                <th>Date</th>
                <th>Topic</th>
                <th>Subtopic</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      )}
    </div>
  );
}

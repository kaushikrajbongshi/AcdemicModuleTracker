"use client";

import { useEffect, useRef, useState } from "react";

export default function CourseTable() {
  const tableRef = useRef(null);
  const dataTableRef = useRef(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // FETCH COURSES FIRST
  // -----------------------------
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/course");
        const json = await res.json();
        setCourses(json.result || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // -----------------------------
  // INIT DATATABLE AFTER DATA
  // -----------------------------
  useEffect(() => {
    if (!courses.length || !tableRef.current) return;

    let mounted = true;

    const initTable = async () => {
      const $ = (await import("jquery")).default;
      window.$ = window.jQuery = $;

      await import("datatables.net-dt");

      // Destroy if already exists
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }

      if (!mounted) return;

      dataTableRef.current = $(tableRef.current).DataTable({
        data: courses,
        columns: [
          { data: "course_id", title: "Course ID" },
          { data: "course_name", title: "Course Name" },
          { data: "dept_id", title: "Department" },
          { data: "semester_id", title: "Semester" },
          {
            data: null,
            title: "Actions",
            orderable: false,
            render: (_, __, row) => `
              <button class="edit-btn" data-id="${row.course_id}">
                Edit
              </button>
              <button class="delete-btn" data-id="${row.course_id}">
                Delete
              </button>
            `,
          },
        ],
        pageLength: 5,
        lengthMenu: [
          [5, 10, 25, 50, 100],
          [5, 10, 25, 50, 100],
        ],
        searching: true,
        ordering: true,
        paging: true,
        destroy: true,
      });

      // Action handlers
      $(tableRef.current).on("click", ".edit-btn", function () {
        const id = $(this).data("id");
        alert("Edit course: " + id);
      });

      $(tableRef.current).on("click", ".delete-btn", function () {
        const id = $(this).data("id");
        if (confirm(`Delete course ${id}?`)) {
          alert("Deleted " + id);
        }
      });
    };

    initTable();

    return () => {
      mounted = false;
      dataTableRef.current?.destroy();
    };
  }, [courses]);

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="p-6 text-black">
      <h2 className="text-2xl mb-4">All Courses</h2>

      {loading && <p>Loading courses...</p>}

      <table
        ref={tableRef}
        className="display stripe hover"
        style={{ width: "100%" }}
      >
        <thead>
          <tr>
            <th>Course ID</th>
            <th>Course Name</th>
            <th>Department</th>
            <th>Semester</th>
            <th>Actions</th>
          </tr>
        </thead>
      </table>

      {/* Minimal styling */}
      <style jsx global>{`
        table.dataTable thead th {
          background: #e5e7eb;
          color: #000;
        }
        .edit-btn,
        .delete-btn {
          padding: 4px 10px;
          margin-right: 6px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          color: white;
        }
        .edit-btn {
          background: #2563eb;
        }
        .delete-btn {
          background: #dc2626;
        }
      `}</style>
    </div>
  );
}

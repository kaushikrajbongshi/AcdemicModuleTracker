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
        const res = await fetch("/api/admin/department/getAll");
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
        data: courses, // ✅ Fixed: was "departments"
        columns: [
          { data: "dept_id", title: "Department ID" },
          { data: "dept_name", title: "Department Name" },
          // ✅ Action column removed
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
      <h2 className="text-2xl mb-4">All Department</h2>

      {loading && <p>Loading departments...</p>}

      <table
        ref={tableRef}
        className="display stripe hover"
        style={{ width: "100%" }}
      >
        <thead>
          <tr>
            <th>Department ID</th>
            <th>Department Name</th>
          
          </tr>
        </thead>
      </table>

      <style jsx global>{`
        table.dataTable thead th {
          background: #e5e7eb;
          color: #000;
        }
      `}</style>
    </div>
  );
}
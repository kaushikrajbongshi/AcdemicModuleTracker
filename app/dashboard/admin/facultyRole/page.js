"use client";

import { useEffect, useRef, useState } from "react";

export default function FacultyTable() {
  const tableRef = useRef(null);
  const dataTableRef = useRef(null);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  // confirm = { type: "role"|"status", id, value, element }

  // =============================
  // FETCH FACULTIES
  // =============================
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const res = await fetch("/api/admin/facultyRole");
        const json = await res.json();
        setFaculties(json.result || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFaculties();
  }, []);

  // =============================
  // INIT DATATABLE
  // =============================
  useEffect(() => {
    if (!faculties.length || !tableRef.current) return;

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
        data: faculties,
        columns: [
          { data: "faculty_id", title: "Faculty ID" },
          { data: "name", title: "Name" },
          { data: "email", title: "Email" },
          { data: "department", title: "Department" },
          {
            data: "role",
            title: "Role",
            render: (data) =>
              data === "HOD"
                ? `<span style="color:purple;font-weight:600">HOD</span>`
                : `<span style="color:blue;font-weight:600">TEACHER</span>`,
          },
          {
            data: "status",
            title: "Status",
            render: (data) =>
              data === "A"
                ? `<span style="color:green">Active</span>`
                : `<span style="color:red">Deactive</span>`,
          },
          {
            data: null,
            title: "Actions",
            orderable: false,
            render: (_, __, row) => `
              <div style="display:flex;flex-direction:column;gap:8px">

                <!-- Role Dropdown -->
                <select class="role-select"
                  data-id="${row.id}"
                  data-original="${row.role}"
                  style="padding:5px;border-radius:6px;border:1px solid #ccc">
                  <option value="TEACHER" ${
                    row.role === "TEACHER" ? "selected" : ""
                  }>TEACHER</option>
                  <option value="HOD" ${
                    row.role === "HOD" ? "selected" : ""
                  }>HOD</option>
                </select>

                <!-- Status Toggle -->
                <label class="switch">
                  <input type="checkbox"
                    class="status-toggle"
                    data-id="${row.id}"
                    ${row.status === "A" ? "checked" : ""}>
                  <span class="slider"></span>
                </label>

              </div>
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

      // =============================
      // ROLE CHANGE
      // =============================
      $(tableRef.current).on("change", ".role-select", function () {
        const id = $(this).data("id");
        const newRole = $(this).val();
        const original = $(this).data("original");
        const el = this;

        setConfirm({
          type: "role",
          id,
          value: newRole,
          original,
          element: el,
          message: `Are you sure you want to change the role to <strong>${newRole}</strong>?`,
        });
      });

      // =============================
      // STATUS CHANGE
      // =============================
      $(tableRef.current).on("change", ".status-toggle", function () {
        const id = $(this).data("id");
        const newStatus = $(this).is(":checked") ? "A" : "D";
        const el = this;

        setConfirm({
          type: "status",
          id,
          value: newStatus,
          element: el,
          message: `Are you sure you want to <strong>${
            newStatus === "A" ? "Activate" : "Deactivate"
          }</strong> this faculty?`,
        });
      });
    };

    initTable();

    return () => {
      mounted = false;
      dataTableRef.current?.destroy();
    };
  }, [faculties]);

  // =============================
  // CONFIRM: YES
  // =============================
  const handleConfirmYes = async () => {
    const { type, id, value, element } = confirm;

    try {
      if (type === "role") {
        await fetch("/api/admin/facultyRole", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ facultyId: id, role: value }),
        });
        // update data-original so future changes track correctly
        element.setAttribute("data-original", value);
      }

      if (type === "status") {
        await fetch("/api/admin/facultyRole", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ facultyId: id, status: value }),
        });
      }
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setConfirm(null);
    }
  };

  // =============================
  // CONFIRM: NO (revert)
  // =============================
  const handleConfirmNo = () => {
    const { type, element, original } = confirm;

    if (type === "role" && element) {
      element.value = original;
    }

    if (type === "status" && element) {
      element.checked = !element.checked;
    }

    setConfirm(null);
  };

  // =============================
  // UI
  // =============================
  return (
    <div className="p-6 text-black">
      <h2 className="text-2xl mb-4">All Faculties</h2>

      {loading && <p>Loading faculties...</p>}

      <table
        ref={tableRef}
        className="display stripe hover"
        style={{ width: "100%" }}
      >
        <thead>
          <tr>
            <th>Faculty ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
      </table>

      {/* =============================
          CONFIRMATION MODAL
      ============================= */}
      {confirm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <p
              style={styles.message}
              dangerouslySetInnerHTML={{ __html: confirm.message }}
            />
            <div style={styles.btnGroup}>
              <button style={styles.btnYes} onClick={handleConfirmYes}>
                Yes, Confirm
              </button>
              <button style={styles.btnNo} onClick={handleConfirmNo}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        table.dataTable thead th {
          background: #e5e7eb;
          color: #000;
        }

        /* Toggle Switch */
        .switch {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 22px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #dc2626;
          transition: 0.3s;
          border-radius: 34px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #16a34a;
        }

        input:checked + .slider:before {
          transform: translateX(18px);
        }
      `}</style>
    </div>
  );
}

// =============================
// MODAL STYLES
// =============================
const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "32px 28px",
    minWidth: "320px",
    maxWidth: "420px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  message: {
    fontSize: "16px",
    marginBottom: "24px",
    color: "#111",
    lineHeight: "1.6",
  },
  btnGroup: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
  },
  btnYes: {
    padding: "9px 22px",
    backgroundColor: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  btnNo: {
    padding: "9px 22px",
    backgroundColor: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
};

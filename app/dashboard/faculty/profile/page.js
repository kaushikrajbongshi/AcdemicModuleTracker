"use client";
import { useState } from "react";

// ─── Icons ────────────────────────────────────────────────────────────────────
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const SaveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const CancelIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const UserIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#64748b" strokeWidth="1.5"/>
    <path d="M22 6l-10 7L2 6" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#f59e0b" strokeWidth="1.8"/>
    <path d="M12 8v4m0 4h.01" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// ─── Field Component ──────────────────────────────────────────────────────────
function Field({ label, value, onChange, disabled, readOnly, multiline, type = "text" }) {
  const [focused, setFocused] = useState(false);
  const base = {
    width: "100%",
    padding: multiline ? "10px 14px" : "10px 14px",
    fontSize: "13.5px",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    color: disabled || readOnly ? "#94a3b8" : "#0f172a",
    background: disabled || readOnly ? "#f8fafc" : focused ? "#fff" : "#f8fafc",
    border: `1.5px solid ${focused && !disabled && !readOnly ? "#2455a4" : "#e2e8f0"}`,
    borderRadius: "8px",
    outline: "none",
    resize: "none",
    transition: "all 0.15s ease",
    boxSizing: "border-box",
    boxShadow: focused && !disabled && !readOnly ? "0 0 0 3px rgba(36,85,164,0.08)" : "none",
    minHeight: multiline ? "90px" : "auto",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{ fontSize: "11.5px", fontWeight: 600, color: "#64748b", letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange?.(e.target.value)}
          disabled={disabled || readOnly}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={base}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          disabled={disabled || readOnly}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={base}
        />
      )}
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ title, children, action }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: "14px",
      border: "1.5px solid #e8edf5",
      padding: "28px 28px 24px",
      boxShadow: "0 1px 6px rgba(26,39,68,0.05)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1a2744", fontFamily: "'DM Sans','Segoe UI',sans-serif", letterSpacing: "-0.01em" }}>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── Main Profile Page ────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    name: "Suman",
    email: "somiyax484@bigonla.com",
    phone: "6003770241",
    class: "N/A",
    address: "N/A",
  });
  const [draft, setDraft] = useState({ ...form });

  const handleEdit = () => { setDraft({ ...form }); setEditing(true); };
  const handleSave = () => { setForm({ ...draft }); setEditing(false); };
  const handleCancel = () => { setDraft({ ...form }); setEditing(false); };

  const billing = { total: "N/A", additional: "N/A", subscription: "N/A" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .profile-root { animation: fadeUp 0.35s ease both; }
        .avatar-ring {
          width: 100px; height: 100px; border-radius: 50%;
          background: linear-gradient(135deg, #2455a4, #4a6091);
          display: flex; align-items: center; justify-content: center;
          color: #fff; margin: 0 auto 14px;
          box-shadow: 0 4px 20px rgba(36,85,164,0.25);
          position: relative;
        }
        .status-dot {
          width: 13px; height: 13px; border-radius: 50%;
          background: #16a34a; border: 2.5px solid #fff;
          position: absolute; bottom: 6px; right: 6px;
        }
        .btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 8px; font-size: 12.5px;
          font-weight: 600; font-family: 'DM Sans','Segoe UI',sans-serif;
          cursor: pointer; border: 1.5px solid transparent;
          transition: all 0.15s ease; letter-spacing: 0.01em;
        }
        .btn-edit { background: #eff6ff; color: #2455a4; border-color: #bfdbfe; }
        .btn-edit:hover { background: #dbeafe; border-color: #93c5fd; }
        .btn-save { background: #1a2744; color: #fff; }
        .btn-save:hover { background: #2455a4; }
        .btn-cancel { background: #fff; color: #64748b; border-color: #e2e8f0; }
        .btn-cancel:hover { background: #f8fafc; border-color: #cbd5e1; }
        .notice {
          display: flex; align-items: center; gap: 7px;
          background: #fffbeb; border: 1px solid #fde68a;
          border-radius: 8px; padding: 9px 13px;
          font-size: 12px; color: #92400e;
          font-family: 'DM Sans','Segoe UI',sans-serif;
          margin-bottom: 20px;
        }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 600px) { .grid-2 { grid-template-columns: 1fr; } }
        .badge-active {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 11px; border-radius: 20px;
          background: #dcfce7; color: #15803d;
          font-size: 11.5px; font-weight: 600;
          font-family: 'DM Sans','Segoe UI',sans-serif;
          letter-spacing: 0.02em;
        }
      `}</style>

      <div className="profile-root" style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "32px 24px",
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
      }}>
        {/* Page title */}
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#1a2744", letterSpacing: "-0.02em" }}>
            My Profile
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
            Manage your personal information and account settings
          </p>
        </div>

        {/* Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "20px", alignItems: "start" }}>

          {/* ── LEFT: Avatar Card ──────────────────────────────────────── */}
          <div style={{
            background: "#fff", borderRadius: "14px",
            border: "1.5px solid #e8edf5", padding: "32px 20px",
            textAlign: "center", boxShadow: "0 1px 6px rgba(26,39,68,0.05)",
          }}>
            <div className="avatar-ring">
              <UserIcon />
              <div className="status-dot" />
            </div>

            <div style={{ fontSize: "17px", fontWeight: 700, color: "#1a2744", marginBottom: "4px" }}>
              {form.name}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", marginBottom: "14px" }}>
              <MailIcon />
              <span style={{ fontSize: "12px", color: "#64748b" }}>{form.email}</span>
            </div>
            <span className="badge-active">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
              Active
            </span>

            {/* Divider */}
            <div style={{ borderTop: "1px solid #f1f5f9", margin: "20px 0" }} />

            {/* Mini stats */}
            {[
              { label: "Class",   value: form.class },
              { label: "Phone",   value: form.phone },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
                <span style={{ fontSize: "11.5px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
                <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* ── RIGHT: Panels ──────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

            {/* Personal Information */}
            <SectionCard
              title="Personal Information"
              action={
                editing ? (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="btn btn-cancel" onClick={handleCancel}><CancelIcon /> Cancel</button>
                    <button className="btn btn-save" onClick={handleSave}><SaveIcon /> Save Changes</button>
                  </div>
                ) : (
                  <button className="btn btn-edit" onClick={handleEdit}><EditIcon /> Edit</button>
                )
              }
            >
              {/* Notice */}
              <div className="notice">
                <InfoIcon />
                You cannot change your email once created. If it is a mistake, contact support.
              </div>

              {/* Fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="grid-2">
                  <Field
                    label="Full Name"
                    value={editing ? draft.name : form.name}
                    onChange={v => setDraft(d => ({ ...d, name: v }))}
                    disabled={!editing}
                  />
                  <Field
                    label="Email Address"
                    value={form.email}
                    readOnly
                    type="email"
                  />
                </div>
                <div className="grid-2">
                  <Field
                    label="Phone Number"
                    value={editing ? draft.phone : form.phone}
                    onChange={v => setDraft(d => ({ ...d, phone: v }))}
                    disabled={!editing}
                    type="tel"
                  />
                  <Field
                    label="Class"
                    value={editing ? draft.class : form.class}
                    onChange={v => setDraft(d => ({ ...d, class: v }))}
                    disabled={!editing}
                  />
                </div>
                <Field
                  label="Address"
                  value={editing ? draft.address : form.address}
                  onChange={v => setDraft(d => ({ ...d, address: v }))}
                  disabled={!editing}
                  multiline
                />
              </div>
            </SectionCard>

            {/* Billing Information */}
            <SectionCard title="Billing Information">
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="grid-2">
                  <Field label="Total Amount (Rs.)"      value={billing.total}        disabled />
                  <Field label="Additional Amount (Rs.)" value={billing.additional}   disabled />
                </div>
                <div style={{ maxWidth: "calc(50% - 8px)" }}>
                  <Field label="Edorb Subscription (Rs.)" value={billing.subscription} disabled />
                </div>
                <p style={{ margin: 0, fontSize: "11.5px", color: "#94a3b8", fontStyle: "italic" }}>
                  * May not apply to all users
                </p>
              </div>
            </SectionCard>

          </div>
        </div>
      </div>
    </>
  );
}
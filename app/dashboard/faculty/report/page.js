"use client";
import { useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Icons ────────────────────────────────────────────────────────────────────
const ExcelIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 2v6h6M8 13l2 2 2-2m-2 2v4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const PDFIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 2v6h6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 17v-5h1.5a1.5 1.5 0 010 3H9m4-3h2m-2 3h1"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path
      d="M8 10l4 4 4-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── Button ───────────────────────────────────────────────────────────────────
function DownloadButton({ label, sublabel, icon, onClick, loading, variant }) {
  const [hovered, setHovered] = useState(false);

  const variants = {
    emerald: {
      idle: { bg: "#fff", border: "#d1d5db", text: "#1a2744", sub: "#6b7280" },
      hover: {
        bg: "#f0fdf4",
        border: "#16a34a",
        text: "#15803d",
        sub: "#4ade80",
      },
      dot: "#16a34a",
      shadow: "0 4px 16px rgba(22,163,74,0.13)",
    },
    navy: {
      idle: { bg: "#fff", border: "#d1d5db", text: "#1a2744", sub: "#6b7280" },
      hover: {
        bg: "#eff6ff",
        border: "#1a2744",
        text: "#1a2744",
        sub: "#3b82f6",
      },
      dot: "#1a2744",
      shadow: "0 4px 16px rgba(26,39,68,0.13)",
    },
  };

  const v = variants[variant];
  const col = hovered ? v.hover : v.idle;

  return (
    <button
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "11px 20px",
        borderRadius: "10px",
        border: `1.5px solid ${col.border}`,
        background: col.bg,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1,
        boxShadow: hovered ? v.shadow : "0 1px 4px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-1px)" : "none",
        transition: "all 0.18s ease",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        minWidth: "192px",
        outline: "none",
        position: "relative",
      }}
    >
      {/* Colour dot */}
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: v.dot,
          flexShrink: 0,
          boxShadow: hovered ? `0 0 0 3px ${v.dot}22` : "none",
          transition: "box-shadow 0.2s",
        }}
      />

      {/* Icon */}
      <span style={{ color: col.text, display: "flex", opacity: 0.75 }}>
        {icon}
      </span>

      {/* Labels */}
      <span
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1px",
          flex: 1,
        }}
      >
        <span
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: col.text,
            letterSpacing: "0.01em",
            lineHeight: 1.2,
          }}
        >
          {loading ? "Generating…" : label}
        </span>
        <span
          style={{
            fontSize: "10.5px",
            color: hovered ? v.hover.sub : v.idle.sub,
            letterSpacing: "0.02em",
          }}
        >
          {sublabel}
        </span>
      </span>

      {/* Arrow */}
      <span
        style={{
          color: col.text,
          opacity: hovered ? 0.9 : 0.3,
          transition: "opacity 0.2s, transform 0.2s",
          transform: hovered ? "translateY(1px)" : "none",
        }}
      >
        <ChevronDown />
      </span>
    </button>
  );
}

// ─── PDF helpers ──────────────────────────────────────────────────────────────
const rgb = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

function buildUniversityPDF({ summary, user }) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210,
    H = 297;
  const ML = 18,
    MR = 18,
    CT = W / 2;

  // ── Palette ──────────────────────────────────────────────────────────────
  const NAVY = "#1a2744";
  const BLUE = "#2455a4";
  const STEEL = "#4a6091";
  const SILVER = "#94a3b8";
  const RULE = "#cbd5e1";
  const BG_ROW = "#f8fafc";
  const WHITE = "#ffffff";
  const GREEN = "#15803d";
  const AMBER = "#b45309";
  const RED = "#b91c1c";
  const BLACK = "#0f172a";

  const progress = parseFloat(summary?.overallProgress) || 0;
  const pColor = progress >= 75 ? GREEN : progress >= 40 ? AMBER : RED;

  // ════════════════════════════════════════════════════════════════════════
  // 1. HEADER — white with navy top bar + institution name
  // ════════════════════════════════════════════════════════════════════════

  // Top navy stripe
  pdf.setFillColor(...rgb(NAVY));
  pdf.rect(0, 0, W, 8, "F");

  // Thin gold accent line
  pdf.setFillColor(...rgb("#c9a84c"));
  pdf.rect(0, 8, W, 0.7, "F");

  // Institution name (white, inside navy stripe)
  pdf.setTextColor(...rgb(WHITE));
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "bold");
  pdf.text("ACADEMIC MODULE TRACKER  —  FACULTY MANAGEMENT SYSTEM", CT, 5.2, {
    align: "center",
  });

  // App branding row
  pdf.setTextColor(...rgb(NAVY));
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text("Academic Module Tracker", ML, 24);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...rgb(STEEL));
  pdf.text("Faculty Progress Summary Report", ML, 30.5);

  // Right side — report metadata
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  pdf.setFontSize(7.5);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...rgb(SILVER));
  pdf.text("Date of Issue", W - MR, 19, { align: "right" });
  pdf.setFontSize(8.5);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...rgb(NAVY));
  pdf.text(today, W - MR, 24.5, { align: "right" });
  pdf.setFontSize(7.5);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...rgb(SILVER));
  pdf.text("Report Type: Internal Academic", W - MR, 30.5, { align: "right" });

  // Full-width horizontal rule
  pdf.setDrawColor(...rgb(NAVY));
  pdf.setLineWidth(0.6);
  pdf.line(ML, 35, W - MR, 35);
  pdf.setLineWidth(0.1);

  // ════════════════════════════════════════════════════════════════════════
  // 2. FACULTY DETAILS — two-column key/value layout
  // ════════════════════════════════════════════════════════════════════════

  let y = 43;

  // Section label
  pdf.setFontSize(6.5);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...rgb(BLUE));
  pdf.text("FACULTY DETAILS", ML, y);
  y += 5;

  const details = [
    ["Name", user?.name || "—"],
    ["Role", user?.facultyRole?.description || "—"],
    ["Academic Year", "2030 – 2031"],
    ["Report ID", `RPT-${Date.now().toString(36).toUpperCase().slice(-6)}`],
  ];

  details.forEach(([key, val], i) => {
    const cx = i % 2 === 0 ? ML : CT + 4;
    const cy = y + Math.floor(i / 2) * 9;
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...rgb(SILVER));
    pdf.text(key.toUpperCase(), cx, cy);
    pdf.setFontSize(9.5);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...rgb(BLACK));
    pdf.text(val, cx, cy + 5);
  });

  y += Math.ceil(details.length / 2) * 9 + 6;

  // Rule
  pdf.setDrawColor(...rgb(RULE));
  pdf.setLineWidth(0.35);
  pdf.line(ML, y, W - MR, y);
  y += 8;

  // ════════════════════════════════════════════════════════════════════════
  // 3. PROGRESS SUMMARY — horizontal stat row
  // ════════════════════════════════════════════════════════════════════════

  pdf.setFontSize(6.5);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...rgb(BLUE));
  pdf.text("PROGRESS OVERVIEW", ML, y);
  y += 6;

  // Progress box — left panel
  pdf.setFillColor(...rgb(NAVY));
  pdf.roundedRect(ML, y, 48, 32, 2, 2, "F");

  pdf.setTextColor(...rgb(WHITE));
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "bold");
  pdf.text("OVERALL PROGRESS", ML + 24, y + 8, { align: "center" });

  pdf.setFontSize(28);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(
    ...rgb(
      pColor === GREEN ? "#4ade80" : pColor === AMBER ? "#fbbf24" : "#f87171",
    ),
  );
  pdf.text(`${progress}%`, ML + 24, y + 22, { align: "center" });

  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...rgb("#94a3b8"));
  const statusLabel =
    progress >= 75
      ? "On Track"
      : progress >= 40
        ? "In Progress"
        : "Behind Schedule";
  pdf.text(statusLabel, ML + 24, y + 28.5, { align: "center" });

  // Progress bar (right of box)
  const bx = ML + 54,
    bw = W - MR - bx,
    bh = 5;

  // Topics bar
  pdf.setTextColor(...rgb(SILVER));
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.text("Topics Completed", bx, y + 7);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...rgb(BLACK));
  pdf.text(
    `${summary?.completedTopics || 0} / ${summary?.totalTopics || 0}`,
    W - MR,
    y + 7,
    { align: "right" },
  );
  pdf.setFillColor(...rgb("#e2e8f0"));
  pdf.roundedRect(bx, y + 9, bw, bh, 2, 2, "F");
  const tFill = Math.max(
    ((summary?.completedTopics || 0) / (summary?.totalTopics || 1)) * bw,
    2,
  );
  pdf.setFillColor(...rgb(BLUE));
  pdf.roundedRect(bx, y + 9, tFill, bh, 2, 2, "F");

  // Subtopics bar
  pdf.setTextColor(...rgb(SILVER));
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.text("Subtopics Completed", bx, y + 20);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...rgb(BLACK));
  pdf.text(
    `${summary?.completedSubtopics || 0} / ${summary?.totalSubtopics || 0}`,
    W - MR,
    y + 20,
    { align: "right" },
  );
  pdf.setFillColor(...rgb("#e2e8f0"));
  pdf.roundedRect(bx, y + 22, bw, bh, 2, 2, "F");
  const sFill = Math.max(
    ((summary?.completedSubtopics || 0) / (summary?.totalSubtopics || 1)) * bw,
    2,
  );
  pdf.setFillColor(...rgb(STEEL));
  pdf.roundedRect(bx, y + 22, sFill, bh, 2, 2, "F");

  // Pending note
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...rgb(SILVER));
  pdf.text(
    `Pending Topics: ${summary?.pendingTopics || 0}  •  Last Updated: ${summary?.lastUpdated ? new Date(summary.lastUpdated).toLocaleDateString("en-GB") : "N/A"}`,
    bx,
    y + 33,
  );

  y += 42;

  // Rule
  pdf.setDrawColor(...rgb(RULE));
  pdf.setLineWidth(0.35);
  pdf.line(ML, y, W - MR, y);
  y += 8;

  // ════════════════════════════════════════════════════════════════════════
  // 4. METRICS TABLE
  // ════════════════════════════════════════════════════════════════════════

  pdf.setFontSize(6.5);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...rgb(BLUE));
  pdf.text("METRIC SUMMARY", ML, y);
  y += 4;

  autoTable(pdf, {
    startY: y,
    head: [["Metric", "Value", "Status"]],
    body: [
      [
        "Overall Progress",
        `${summary?.overallProgress ?? 0}%`,
        progress >= 75
          ? "✓ On Track"
          : progress >= 40
            ? "~ In Progress"
            : "✗ Behind",
      ],
      ["Total Topics", String(summary?.totalTopics ?? 0), "—"],
      [
        "Completed Topics",
        String(summary?.completedTopics ?? 0),
        `${Math.round(((summary?.completedTopics || 0) / (summary?.totalTopics || 1)) * 100)}% done`,
      ],
      [
        "Pending Topics",
        String(summary?.pendingTopics ?? 0),
        summary?.pendingTopics > 0 ? "Requires attention" : "None",
      ],
      ["Total Subtopics", String(summary?.totalSubtopics ?? 0), "—"],
      [
        "Completed Subtopics",
        String(summary?.completedSubtopics ?? 0),
        `${Math.round(((summary?.completedSubtopics || 0) / (summary?.totalSubtopics || 1)) * 100)}% done`,
      ],
      [
        "Last Updated",
        summary?.lastUpdated
          ? new Date(summary.lastUpdated).toLocaleDateString("en-GB")
          : "N/A",
        "—",
      ],
    ],
    theme: "plain",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
      textColor: rgb(BLACK),
      lineColor: rgb(RULE),
      lineWidth: 0.25,
    },
    headStyles: {
      fillColor: rgb(NAVY),
      textColor: rgb(WHITE),
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
    },
    alternateRowStyles: { fillColor: rgb(BG_ROW) },
    columnStyles: {
      0: { cellWidth: 72, textColor: rgb("#334155") },
      1: { cellWidth: 30, fontStyle: "bold", halign: "center" },
      2: { cellWidth: "auto", fontSize: 8, textColor: rgb(STEEL) },
    },
    margin: { left: ML, right: MR },
  });

  y = (pdf.lastAutoTable?.finalY || y + 60) + 8;

  // Rule
  pdf.setDrawColor(...rgb(RULE));
  pdf.setLineWidth(0.35);
  pdf.line(ML, y, W - MR, y);
  y += 7;

  // ════════════════════════════════════════════════════════════════════════
  // 5. DECLARATION BLOCK
  // ════════════════════════════════════════════════════════════════════════

  pdf.setFontSize(6.5);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...rgb(BLUE));
  pdf.text("CERTIFICATION", ML, y);
  y += 5;

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...rgb(STEEL));
  const declaration =
    "This report has been automatically generated by the Academic Module Tracker system and accurately reflects the faculty progress as recorded in the system at the time of generation. This document is intended for internal university use only.";
  const lines = pdf.splitTextToSize(declaration, W - ML - MR);
  pdf.text(lines, ML, y);
  y += lines.length * 4.5 + 10;

  // Signature line
  pdf.setDrawColor(...rgb(NAVY));
  pdf.setLineWidth(0.4);
  pdf.line(ML, y, ML + 52, y);
  pdf.line(CT + 4, y, CT + 56, y);
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...rgb(SILVER));
  pdf.text("Faculty Signature", ML, y + 4.5);
  pdf.text("Head of Department", CT + 4, y + 4.5);

  // ════════════════════════════════════════════════════════════════════════
  // 6. FOOTER
  // ════════════════════════════════════════════════════════════════════════

  // Top rule
  pdf.setDrawColor(...rgb(RULE));
  pdf.setLineWidth(0.35);
  pdf.line(ML, H - 16, W - MR, H - 16);

  // Navy bottom bar
  pdf.setFillColor(...rgb(NAVY));
  pdf.rect(0, H - 10, W, 10, "F");

  pdf.setTextColor(...rgb(WHITE));
  pdf.setFontSize(6.8);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    "Academic Module Tracker  •  Confidential  •  For Internal Use Only",
    ML,
    H - 4.5,
  );
  pdf.text("Page 1 of 1", W - MR, H - 4.5, { align: "right" });

  return pdf;
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function DownloadSummaryReport() {
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const [sRes, uRes] = await Promise.all([
      fetch("/api/faculty/progress/dashboard/summary"),
      fetch("/api/me"),
    ]);
    return { summary: await sRes.json(), user: (await uRes.json()).user };
  };

  const downloadExcel = async () => {
    setLoading(true);
    const { summary, user } = await fetchData();
    const data = [
      { Metric: "Faculty Name", Value: user?.name },
      { Metric: "Role", Value: user?.facultyRole?.description },
      { Metric: "Overall Progress", Value: `${summary?.overallProgress}%` },
      { Metric: "Total Topics", Value: summary?.totalTopics },
      { Metric: "Completed Topics", Value: summary?.completedTopics },
      { Metric: "Pending Topics", Value: summary?.pendingTopics },
      { Metric: "Total Subtopics", Value: summary?.totalSubtopics },
      { Metric: "Completed Subtopics", Value: summary?.completedSubtopics },
      {
        Metric: "Last Updated",
        Value: summary?.lastUpdated
          ? new Date(summary.lastUpdated).toLocaleDateString()
          : "N/A",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Faculty Summary");
    XLSX.writeFile(wb, "faculty_progress_summary.xlsx");
    setLoading(false);
  };

  const downloadPDF = async () => {
    setLoading(true);
    const { summary, user } = await fetchData();
    buildUniversityPDF({ summary, user }).save("faculty_progress_summary.pdf");
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div
        style={{
          display: "flex",
          gap: "14px",
          flexWrap: "wrap",
          padding: "24px 0",
          justifyContent: "center",
          alignItems: "center",
          margin: "10vh 0 0 0",
        }}
      >
        <DownloadButton
          label="Export Excel"
          sublabel="Spreadsheet (.xlsx)"
          icon={<ExcelIcon />}
          onClick={downloadExcel}
          loading={loading}
          variant="emerald"
        />
        <DownloadButton
          label="Export PDF"
          sublabel="Formatted report (.pdf)"
          icon={<PDFIcon />}
          onClick={downloadPDF}
          loading={loading}
          variant="navy"
        />
      </div>
    </>
  );
}
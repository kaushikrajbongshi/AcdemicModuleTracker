"use client";

import { useState, useEffect } from "react";

// Empty State Component
const EmptyState = ({ onAddClick }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <svg
        className="w-10 h-10 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      No academic years added yet
    </h3>
    <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
      Get started by adding your first academic year to the system
    </p>
    <button
      onClick={onAddClick}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
      Add Academic Year
    </button>
  </div>
);

// Confirmation Modal Component
const ConfirmationModal = ({ show, yearToActivate, onCancel, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Activate Academic Year
            </h3>
            <p className="text-sm text-gray-600">
              Activating{" "}
              <span className="font-semibold text-gray-900">
                {yearToActivate?.label}
              </span>{" "}
              will deactivate the current active year. Continue?
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AcademicYearsPage() {
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [newYear, setNewYear] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [yearToActivate, setYearToActivate] = useState(null);
  const [warningMessage, setWarningMessage] = useState("");

  const activeYear = academicYears.find((year) => year.status === "active");

  const validateYearFormat = (year) => {
    const trimmedYear = year.trim();
    const normalizedYear = trimmedYear.replace(/\s+/g, "");

    if (!normalizedYear) {
      return { valid: false, message: "Please enter an academic year." };
    }

    if (!/^\d{4}-\d{4}$/.test(normalizedYear)) {
      return {
        valid: false,
        message:
          "Academic year must be in the format YYYY-YYYY (e.g., 2025-2026).",
      };
    }

    const [startYear, endYear] = normalizedYear.split("-").map(Number);

    if (endYear !== startYear + 1) {
      return {
        valid: false,
        message:
          "The end year must be exactly one year after the start year (e.g., 2025-2026).",
      };
    }

    const exists = academicYears.some((y) => y.label === normalizedYear);
    if (exists) {
      return {
        valid: false,
        message: `Academic year ${normalizedYear} already exists.`,
      };
    }

    return { valid: true, normalizedYear };
  };

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/academic-year/add");
      const data = await res.json();

      if (data.success) {
        setAcademicYears(
          data.years.map((y) => ({
            id: y.id,
            label: y.label,
            status: y.isActive ? "active" : "inactive",
            createdDate: new Date(y.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          })),
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddYear = async () => {
    const validation = validateYearFormat(newYear);

    if (!validation.valid) {
      setWarningMessage(validation.message);
      return;
    }

    const cleanYear = validation.normalizedYear;

    try {
      setSubmitting(true);
      setWarningMessage("");

      const res = await fetch("/api/admin/academic-year/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ label: cleanYear }),
      });
      setNewYear("");
      fetchAcademicYears();
      const data = await res.json();
      if (!data.success) {
        setWarningMessage(data.message);
        return;
      }
    } catch (err) {
      console.error(err);
      setWarningMessage("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivateClick = (year) => {
    setYearToActivate(year);
    setShowModal(true);
  };

  const handleConfirmActivate = async () => {
    if (!yearToActivate) return;

    try {
      setSubmitting(true);

      const res = await fetch("/api/admin/academic-year/activate", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ yearId: yearToActivate.id }),
      });

      const data = await res.json();

      if (!data.success) {
        setWarningMessage(data.message);
        return;
      }

      setShowModal(false);
      setYearToActivate(null);
      fetchAcademicYears();
    } catch (err) {
      console.error(err);
      setWarningMessage("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelActivate = () => {
    setShowModal(false);
    setYearToActivate(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Academic Years
              </h1>
              <p className="text-sm text-gray-600">
                Manage and activate academic years for the system
              </p>
            </div>
            {activeYear && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium text-green-900">
                  Current Active Year: {activeYear.label}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Add Academic Year Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label
                htmlFor="yearInput"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Academic Year (YYYY-YYYY)
              </label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    id="yearInput"
                    type="text"
                    value={newYear}
                    onChange={(e) => {
                      setNewYear(e.target.value);
                      setWarningMessage("");
                    }}
                    onKeyPress={(e) => e.key === "Enter" && handleAddYear()}
                    placeholder="e.g., 2025-2026"
                    className={`w-full px-4 py-2.5 border text-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
                      warningMessage
                        ? "border-amber-300 focus:ring-amber-500 focus:border-amber-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                    }`}
                    aria-label="Academic Year Input"
                  />
                </div>
                <button
                  onClick={handleAddYear}
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Academic Year
                </button>
                <button
                  onClick={fetchAcademicYears}
                  disabled={submitting || loading}
                  className="inline-flex items-center justify-center p-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Refresh"
                  title="Refresh"
                >
                  <svg
                    className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
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
              </div>
              {warningMessage && (
                <div className="flex items-start gap-2 mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <svg
                    className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-amber-800 font-medium">
                      {warningMessage}
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      Format: YYYY-YYYY (e.g., 2025-2026)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Academic Years Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {academicYears.length === 0 ? (
            <EmptyState
              onAddClick={() => document.getElementById("yearInput").focus()}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Academic Year
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {academicYears.map((year) => (
                    <tr
                      key={year.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {year.label}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {year.status === "active" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {year.createdDate}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {year.status === "inactive" ? (
                          <button
                            onClick={() => handleActivateClick(year)}
                            disabled={submitting}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Activate
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            Currently Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          {academicYears.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {academicYears.length}
                </span>{" "}
                academic year{academicYears.length !== 1 ? "s" : ""}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        show={showModal}
        yearToActivate={yearToActivate}
        onCancel={handleCancelActivate}
        onConfirm={handleConfirmActivate}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

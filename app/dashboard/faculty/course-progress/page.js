// app/dashboard/faculty/progress/page.jsx
"use client";
import SummaryCards from "@/components/faculty/TopicTree/dashboard/SummaryCard";
import CourseWiseProgress from "@/components/faculty/TopicTree/dashboard/CourseProgress";
import TopicWiseTable from "@/components/faculty/TopicTree/dashboard/TopicTable";
import DashboardSkeleton from "@/components/faculty/TopicTree/dashboard/DashboardSkeleton";

import { RefreshCw } from "lucide-react";
import { useState } from "react";

export default function ProgressDashboard() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);

    // later: refetch API data here
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  const isLoading = false;
  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Module Progress Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Track your academic module completion status
          </p>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>Last updated: Feb 4, 2026, 10:30 AM</span>

          <button
            onClick={handleRefresh}
            title="Refresh data"
            className="p-2 rounded-full hover:bg-gray-200 transition"
            disabled={refreshing}
          >
            <RefreshCw
              size={18}
              className={`${refreshing ? "animate-spin text-blue-600" : ""}`}
            />
          </button>
        </div>
      </div>

      <SummaryCards />
      <CourseWiseProgress />
      <TopicWiseTable />
    </div>
  );
}

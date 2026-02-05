import { CheckCircle, Clock, Layers, TrendingUp } from "lucide-react";

export default function SummaryCards({ summary }) {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-stretch">
      
      {/* ================= HERO PROGRESS CARD ================= */}
      <div
        className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-blue-500 
        text-white rounded-2xl p-6 shadow-lg h-40 flex flex-col justify-between"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium opacity-90">
            Overall Progress
          </h3>
          <TrendingUp className="w-5 h-5 opacity-90" />
        </div>

        {/* Center */}
        <div>
          <span className="text-5xl font-bold">
            {summary.overallProgress}%
          </span>

          <div className="mt-3 h-2 w-full bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-300 to-white
                rounded-full transition-all duration-500"
              style={{ width: `${summary.overallProgress}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs opacity-90">
          Based on Unit completion
        </p>
      </div>

      {/* ================= TOTAL TOPICS ================= */}
      <StatCard
        title="Total Topics"
        value={summary.totalTopics}
        icon={<Layers className="w-5 h-5 text-blue-600" />}
        bg="bg-blue-50"
      />

      {/* ================= COMPLETED TOPICS ================= */}
      <StatCard
        title="Completed Topics"
        value={summary.completedTopics}
        icon={<CheckCircle className="w-5 h-5 text-green-600" />}
        bg="bg-green-50"
      />

      {/* ================= PENDING TOPICS ================= */}
      <StatCard
        title="Pending Topics"
        value={summary.pendingTopics}
        icon={<Clock className="w-5 h-5 text-orange-600" />}
        bg="bg-orange-50"
      />
    </div>
  );
}

/* ================= STAT CARD ================= */
function StatCard({ title, value, icon, bg }) {
  return (
    <div
      className="relative bg-white rounded-2xl p-5 shadow-sm border 
      hover:shadow-md transition h-40 flex items-center justify-center"
    >
      {/* Title */}
      <p className="absolute top-4 left-4 text-sm text-gray-500">
        {title}
      </p>

      {/* Icon */}
      <div
        className={`absolute top-4 right-4 w-10 h-10 rounded-xl 
        flex items-center justify-center ${bg}`}
      >
        {icon}
      </div>

      {/* Center Value */}
      <p className="text-4xl font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}

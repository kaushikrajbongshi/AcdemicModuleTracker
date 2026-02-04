// components/dashboard/DashboardSkeleton.jsx
export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Summary cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white border rounded-xl p-5 space-y-3"
          >
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-2 bg-gray-200 rounded w-full" />
          </div>
        ))}
      </div>

      {/* Course-wise progress skeleton */}
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <div className="h-5 bg-gray-200 rounded w-1/4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-2 bg-gray-200 rounded w-full" />
          </div>
        ))}
      </div>

      {/* Topic table skeleton */}
      <div className="bg-white border rounded-xl p-6 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-1/4" />
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-4 bg-gray-200 rounded w-full"
          />
        ))}
      </div>
    </div>
  );
}

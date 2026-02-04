// components/dashboard/EmptyState.jsx
export default function EmptyState() {
  return (
    <div className="bg-white border rounded-xl p-10 text-center">
      <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-blue-50 text-blue-600">
        📘
      </div>

      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        No topics assigned yet
      </h3>

      <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
        Topics for your course have not been assigned or marked yet.
        Once topics are added, your progress will appear here.
      </p>
    </div>
  );
}

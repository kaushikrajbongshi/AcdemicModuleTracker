// components/dashboard/CourseWiseProgress.jsx
const courses = [
  { name: "Data Structures & Algorithms", done: 15, total: 15 },
  { name: "Database Management Systems", done: 8, total: 12 },
  { name: "Operating Systems", done: 5, total: 10 },
  { name: "Computer Networks", done: 6, total: 8 },
];

export default function CourseWiseProgress() {
  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Course-wise Progress
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((c) => {
          const percent = Math.round((c.done / c.total) * 100);

          return (
            <div key={c.name} className="border rounded-lg p-5">
              <p className="font-medium text-gray-900">{c.name}</p>

              <div className="flex justify-between text-sm text-gray-500 mt-3">
                <span>Progress</span>
                <span>
                  {c.done} / {c.total} subtopics
                </span>
              </div>

              <div className="mt-2 h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-blue-600 rounded-full"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <p className="text-right text-sm font-medium text-blue-600 mt-1">
                {percent}%
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

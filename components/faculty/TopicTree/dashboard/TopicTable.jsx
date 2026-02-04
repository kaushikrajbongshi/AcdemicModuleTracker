// components/dashboard/TopicWiseTable.jsx
const topics = [
  { name: "Arrays & Linked Lists", done: 5, total: 5 },
  { name: "Trees & Graphs", done: 4, total: 5 },
  { name: "Sorting Algorithms", done: 3, total: 5 },
  { name: "SQL Fundamentals", done: 4, total: 4 },
  { name: "Normalization", done: 4, total: 4 },
  { name: "Process Management", done: 2, total: 5 },
  { name: "Memory Management", done: 3, total: 5 },
  { name: "TCP/IP Protocols", done: 4, total: 4 },
];

export default function TopicWiseTable() {
  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm text-black">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Topic-wise Progress
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-y">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Topic Name
              </th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">
                Subtopics Completed
              </th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {topics.map((t) => {
              const completed = t.done === t.total;

              return (
                <tr key={t.name} className="border-b last:border-none">
                  <td className="px-4 py-3">{t.name}</td>
                  <td className="px-4 py-3 text-center">
                    {t.done} / {t.total}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        completed
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {completed ? "Completed" : "In Progress"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

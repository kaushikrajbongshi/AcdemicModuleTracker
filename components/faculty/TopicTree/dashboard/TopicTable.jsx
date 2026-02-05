export default function TopicWiseTable({
  topics,
  courses,
  selectedCourseId,
  onCourseChange,
}) {
  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Topic-wise Progress
        </h2>

        {/* Course Selector (Top Right) */}
        {courses?.length > 0 && (
          <select
            value={selectedCourseId || ""}
            onChange={(e) => onCourseChange(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {courses.map((course) => (
              <option key={course.courseId} value={course.courseId}>
                {course.courseName}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ================= EMPTY STATE ================= */}
      {!topics || topics.length === 0 ? (
        <p className="text-sm text-gray-500">
          No topics found for the selected course.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-50 border-y">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Topic Name
                </th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">
                  Subtopics
                </th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {topics.map((topic) => (
                <tr
                  key={topic.topicId}
                  className="border-b last:border-none hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-gray-900">
                    {topic.topicName}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    {topic.completedSubtopics} / {topic.totalSubtopics}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        topic.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {topic.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

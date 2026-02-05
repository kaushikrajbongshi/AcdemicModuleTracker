export default function CourseWiseProgress({ courses }) {
  if (!courses || courses.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <p className="text-sm text-gray-500">
          No courses assigned yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Course-wise Progress
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div key={course.courseId} className="border rounded-lg p-5">
            <p className="font-medium text-gray-900">
              {course.courseName}
            </p>

            <div className="flex justify-between text-sm text-gray-500 mt-3">
              <span>Progress</span>
              <span>
                {course.completedSubtopics} / {course.totalSubtopics} subtopics
              </span>
            </div>

            <div className="mt-2 h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-green-600 rounded-full"
                style={{ width: `${course.progress}%` }}
              />
            </div>

            <p className="text-right text-sm font-medium text-blue-600 mt-1">
              {course.progress}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function AssignCourse() {
  const { register, handleSubmit, reset, errors } = useForm();

  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch courses & faculties
  useEffect(() => {
    const fetchData = async () => {
      const courseRes = await fetch("/api/course");
      const facultyRes = await fetch("/api/faculty/all-faculty");

      const course_result = await courseRes.json();
      const faculty_result = await facultyRes.json();

      setCourses(course_result.result);
      setFaculties(faculty_result.result);
    };

    fetchData();
  }, []);

  const onSubmit = async (data) => {
    console.log(data);

    setLoading(true);

    const res = await fetch("/api/admin/assignCourse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    console.log(res);

    setLoading(false);
    reset();
    alert(res.statusText);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-md w-full mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200 mt-16"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
        Assign Course to Faculty
      </h2>

      {/* Course Field */}
      <div className="mb-6">
        <label
          htmlFor="course_id"
          className="block text-xl font-medium text-gray-700 mb-2"
        >
          Course
        </label>
        <select
          id="course_id"
          {...register("course_id", { required: "Please select a course" })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-white text-gray-900 transition-all duration-200"
        >
          <option value="">Select Course</option>
          {courses.map((course) => (
            <option key={course.course_id} value={course.course_id}>
              {course.course_id} - {course.course_name}
            </option>
          ))}
        </select>
      </div>

      {/* Faculty Field */}
      <div className="mb-8">
        <label
          htmlFor="faculty_id"
          className="block text-xl font-medium text-gray-700 mb-2"
        >
          Faculty
        </label>
        <select
          id="faculty_id"
          {...register("faculty_id", { required: "Please select a faculty" })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-white text-gray-900 transition-all duration-200"
        >
          <option value="">Select Faculty</option>
          {faculties.map((fac) => (
            <option key={fac.faculty_id} value={fac.id}>
              {fac.faculty_id} - {fac.name}
            </option>
          ))}
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-indigo-700 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-all duration-200"
      >
        {loading ? "Assigning..." : "Assign Course"}
      </button>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function AddCourse() {
  const { register, handleSubmit, reset } = useForm();

  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch departments & semesters
  useEffect(() => {
    const fetchData = async () => {
      const deptRes = await fetch("/api/departments");
      const semRes = await fetch("/api/semester");

      const dept_result = await deptRes.json();
      const sem_result = await semRes.json();

      setDepartments(dept_result.result);
      setSemesters(sem_result.result);
    };

    fetchData();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);

    await fetch("/api/admin/addCourse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);
    reset();
    alert("Course added successfully");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-[40vw] p-5 border border-gray-300 rounded-lg m-auto mt-[10vh] "
    >
      <h3 className="mb-4 text-xl font-semibold text-black">Add Course</h3>

      <input
        {...register("course_id", { required: true })}
        placeholder="Course ID (e.g. CSC-2021)"
        className="w-full p-2 mb-3 text-black border border-gray-300 mt-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
      />

      <input
        {...register("course_name", { required: true })}
        placeholder="Course Name (e.g. OS)"
        className="w-full p-2 mb-3 border text-black border-gray-300 mt-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
      />

      <select
        {...register("dept_id", { required: true })}
        className="w-full p-2 mb-3 border text-black border-gray-300 mt-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
      >
        <option value="">Select Department</option>
        {departments.map((dept) => (
          <option key={dept.dept_id} value={dept.dept_id}>
            {dept.dept_id} ({dept.dept_name})
          </option>
        ))}
      </select>

      <select
        {...register("semester_id", { required: true })}
        className="w-full p-2 mb-4 border border-gray-300 text-black mt-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
      >
        <option value="">Select Semester</option>
        {semesters.map((sem) => (
          <option key={sem.semester_id} value={sem.semester_id}>
            {sem.semester_id}
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 text-white bg-indigo-600 rounded-md mt-2 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Saving..." : "Save Course"}
      </button>
    </form>
  );
}

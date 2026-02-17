"use client";

import { useEffect } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function AddFaculty() {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);


  const fieldClass =
    "w-full px-3 py-2 mb-3 text-sm text-black bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500";

  const onSubmit = async (data) => {
    setLoading(true);
    const res = await fetch("/api/admin/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        userType: "faculty",
      }),
    });

    const result = await res.json();
    console.log(result);

    setLoading(false);
    reset();
    alert("Faculty added successfully");
  };



  return (
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-sm p-8 m-auto mt-30"
      >
        <h3 className="text-2xl font-semibold text-gray-800 text-center mb-8">
          Add Department
        </h3>

        {/* Course ID */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Department ID
          </label>
          <input
            {...register("department_id", { required: true })}
            placeholder="e.g. CSE"
            className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/80"
          />
        </div>

        {/* Course Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Department Name
          </label>
          <input
            {...register("department_name", { required: true })}
            placeholder="e.g. Computer Science and Engineering"
            className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/80"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 text-white bg-purple-700 rounded-lg hover:bg-purple-900 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Save Course"}
        </button>
      </form>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

export default function AddFaculty() {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    console.log(data);

    const res = await fetch("/api/admin/department/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    console.log(result);

    setLoading(false);
    reset();
    alert("Department added successfully");
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
          {...register("dept_id", { required: true })}
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
          {...register("dept_name", { required: true })}
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

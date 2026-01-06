"use client";

import { useEffect } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function AddFaculty() {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState([]);

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

  useEffect(() => {
    const fetchRole = async () => {
      const res = await fetch("/api/faculty_role");
      const role_result = await res.json();
      setRole(role_result.result);
    };
    fetchRole();
  }, []);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-[40vw] p-5 border border-gray-300 rounded-lg m-auto mt-[10vh]"
    >
      <h3 className="mb-4 text-xl font-semibold text-black">Add Faculty</h3>

      {/* Faculty ID */}
      <input
        {...register("faculty_id", { required: true })}
        placeholder="Faculty ID (e.g. FI01)"
        className={fieldClass}
      />

      {/* Name */}
      <input
        {...register("name", { required: true })}
        placeholder="Faculty Name"
        className={fieldClass}
      />

      {/* Username */}
      <input
        {...register("username", { required: true })}
        placeholder="Username"
        className={fieldClass}
      />

      {/* Email */}
      <input
        type="email"
        {...register("email", { required: true })}
        placeholder="Email"
        className={fieldClass}
      />

      {/* Password */}
      <input
        type="password"
        {...register("password", { required: true })}
        placeholder="Password"
        className={fieldClass}
      />

      <select
        {...register("role", { required: true })}
        className="w-full p-2 mb-4 border border-gray-300 text-black mt-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
      >
        <option value="">Select Role</option>
        {role.map((role) => (
          <option key={role.id} value={role.id}>
            {role.description}
          </option>
        ))}
      </select>

      {/* Status
      <select
        {...register("status", { required: true })}
        className={fieldClass}
      >
        <option value="">Select Status</option>
        <option value="A">Active</option>
        <option value="D">Disabled</option>
      </select> */}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 mt-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save Faculty"}
      </button>
    </form>
  );
}

"use client";

export default function AddStudentForm() {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4 text-black">Add Student</h1>

      <form className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          className="w-full border p-3 rounded"
        />

        <input
          type="text"
          placeholder="Roll No"
          className="w-full border p-3 rounded"
        />

        <input
          type="email"
          placeholder="Email ID"
          className="w-full border p-3 rounded"
        />

        <button className="bg-indigo-600 text-white px-4 py-2 rounded">
          Submit
        </button>
      </form>
    </div>
  );
}

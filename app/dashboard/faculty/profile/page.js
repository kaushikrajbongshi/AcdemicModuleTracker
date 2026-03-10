"use client";

import { useEffect, useState } from "react";

export default function FacultyProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/faculty/profile");
        const json = await res.json();

        if (json.success) {
          setProfile(json.result);
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <p className="p-6">Loading profile...</p>;
  }

  if (!profile) {
    return <p className="p-6 text-red-500">Failed to load profile</p>;
  }

  return (
    <div className="p-6 grid grid-cols-12 gap-6 text-black">

      {/* LEFT PROFILE CARD */}
      <div className="col-span-12 md:col-span-4 bg-white rounded-xl shadow p-6 flex flex-col items-center text-center">

        <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center mb-4">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            className="w-24 h-24"
          />
        </div>

        <h2 className="text-xl font-semibold">{profile.name}</h2>

        <p className="text-gray-500 text-sm">{profile.email}</p>

        <span className="mt-3 px-4 py-1 rounded-full bg-green-100 text-green-600 text-sm">
          {profile.status}
        </span>
      </div>

      {/* RIGHT CONTENT */}
      <div className="col-span-12 md:col-span-8 space-y-6">

        {/* PERSONAL INFORMATION */}
        <div className="bg-white rounded-xl shadow p-6">

          <h3 className="text-lg font-semibold mb-6">
            Personal Information
          </h3>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="text-sm text-gray-600">Faculty ID</label>
              <input
                value={profile.facultyId}
                readOnly
                className="w-full mt-1 border rounded-lg p-2 bg-gray-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Username</label>
              <input
                value={profile.username}
                readOnly
                className="w-full mt-1 border rounded-lg p-2 bg-gray-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                value={profile.email}
                readOnly
                className="w-full mt-1 border rounded-lg p-2 bg-gray-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Department</label>
              <input
                value={profile.department}
                readOnly
                className="w-full mt-1 border rounded-lg p-2 bg-gray-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Role</label>
              <input
                value={profile.role}
                readOnly
                className="w-full mt-1 border rounded-lg p-2 bg-gray-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Joined Date</label>
              <input
                value={new Date(profile.joinedDate).toLocaleDateString()}
                readOnly
                className="w-full mt-1 border rounded-lg p-2 bg-gray-100"
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
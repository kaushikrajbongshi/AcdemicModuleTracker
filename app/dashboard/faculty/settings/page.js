"use client";

import { useState } from "react";

export default function SecuritySettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    console.log({
      currentPassword,
      newPassword,
      confirmPassword,
    });
  };

  return (
    <div className="p-6 flex justify-center text-black">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-xl">
          <h2 className="text-xl font-semibold">Security Settings</h2>
          <p className="text-sm opacity-90">
            Update your password to keep your account secure
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* CURRENT PASSWORD */}
          <div>
            <label className="block text-sm mb-2">
              Current Password
            </label>

            <input
              type="password"
              placeholder="Enter your current password"
              className="w-full border rounded-lg p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <p className="text-xs text-gray-500 mt-1">
              Enter your existing password to verify your identity
            </p>
          </div>

          {/* NEW PASSWORD */}
          <div>
            <label className="block text-sm mb-2">
              New Password
            </label>

            <input
              type="password"
              placeholder="Create a strong password"
              className="w-full border rounded-lg p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <p className="text-xs text-gray-500 mt-1">
              Use at least 8 characters with letters and numbers
            </p>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block text-sm mb-2">
              Confirm New Password
            </label>

            <input
              type="password"
              placeholder="Re-enter your new password"
              className="w-full border rounded-lg p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <p className="text-xs text-gray-500 mt-1">
              Both passwords must match exactly
            </p>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition"
          >
            Update Password
          </button>

          {/* SECURITY TIPS */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3 text-gray-700">
              Security Tips
            </h3>

            <ul className="text-sm text-gray-600 space-y-2">
              <li>✔ Use a unique password that you don't use elsewhere</li>
              <li>✔ Consider using a password manager for better security</li>
              <li>✔ Update your password regularly for maximum security</li>
            </ul>
          </div>

        </form>
      </div>
    </div>
  );
}
// frontend/src/pages/Profile.jsx

import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../auth/Userprovider";
import { FaUserCircle } from "react-icons/fa";
import { Transition } from "@headlessui/react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, setUser, isLoading: userLoading } = useContext(UserContext);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.userName || "",
        email: user.email || "",
      });
    } else {
      setError("You must be logged in to view your profile.");
    }
  }, [user]);

  const handleChange = (e) => {
    setProfileData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/auth/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(profileData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile.");
      }

      const data = await response.json();
      setUser(data.user);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "An error occurred while updating profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white shadow-xl rounded-lg p-8">
        <h2 className="text-3xl font-semibold text-indigo-600 mb-6 text-center">
          Your Profile
        </h2>

        <div className="flex justify-center mb-6">
          <img
            src={user.photo || `/static/user.png`}
            alt="User Avatar"
            className="w-16 h-16 rounded-full cursor-default"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `/static/user.png`;
            }}
          />
        </div>

        {/* Success Message */}
        <Transition
          show={success !== ""}
          enter="transition-opacity duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Success! </strong>
            <span className="block sm:inline">{success}</span>
            <button
              onClick={() => setSuccess("")}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <svg
                className="fill-current h-6 w-6 text-green-500"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <title>Close</title>
                <path d="M14.348 5.652a.5.5 0 00-.707 0L10 9.293 6.36 5.652a.5.5 0 10-.707.707L9.293 10l-3.64 3.64a.5.5 0 00.707.707L10 10.707l3.64 3.64a.5.5 0 00.707-.707L10.707 10l3.64-3.64a.5.5 0 000-.708z" />
              </svg>
            </button>
          </div>
        </Transition>

        {/* Error Message */}
        <Transition
          show={error !== ""}
          enter="transition-opacity duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
            <button
              onClick={() => setError("")}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <svg
                className="fill-current h-6 w-6 text-red-500"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <title>Close</title>
                <path d="M14.348 5.652a.5.5 0 00-.707 0L10 9.293 6.36 5.652a.5.5 0 10-.707.707L9.293 10l-3.64 3.64a.5.5 0 00.707.707L10 10.707l3.64 3.64a.5.5 0 00.707-.707L10.707 10l3.64-3.64a.5.5 0 000-.708z" />
              </svg>
            </button>
          </div>
        </Transition>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={profileData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={profileData.email}
              onChange={handleChange}
              required
              disabled
              className="mt-1 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed text-gray-500"
              placeholder="Email Address"
            />
          </div>

          {/* Update Profile Button */}
          <div>
            <button
              type="submit"
              disabled={isUpdating}
              className={`w-full flex justify-center items-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isUpdating
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors`}
            >
              {isUpdating ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                  Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </button>
          </div>

          {/* Booking History Button */}
          <div>
            <button
              type="button"
              onClick={() => navigate("/booking-history")}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              View Booking History
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
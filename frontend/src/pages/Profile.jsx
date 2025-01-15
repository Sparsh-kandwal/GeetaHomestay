// frontend/src/pages/Profile.jsx

import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../auth/Userprovider";

const Profile = () => {
  const { user, setUser, isLoading: userLoading } = useContext(UserContext);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    photo: "",
    // Add other fields as necessary
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Ensure user is authenticated
    if (!user) {
      setError("You must be logged in to view your profile.");
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/auth/profile`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Assuming you're using cookies for authentication
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch profile data.");
        }

        const data = await response.json();
        setProfileData({
          name: data.user.name || "",
          email: data.user.email || "",
          photo: data.user.photo || "",
          // Populate other fields as necessary
        });
      } catch (err) {
        setError(err.message || "An error occurred while fetching profile data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setProfileData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    // Implement file upload logic if necessary
    // For simplicity, we'll handle photo URLs
    setProfileData((prev) => ({
      ...prev,
      photo: URL.createObjectURL(file),
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
        throw new Error("Failed to update profile.");
      }

      const data = await response.json();
      setUser(data.user); // Update user context with new data
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "An error occurred while updating profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || userLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-8 h-8 border-4 border-indigo-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 mt-20">
      <h2 className="text-2xl font-semibold mb-6">Your Profile</h2>
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form
        onSubmit={handleSubmit}
        className="max-w-lg bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        {/* Profile Photo */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Profile Photo
          </label>
          <div className="flex items-center">
            {profileData.photo ? (
              <img
                src={profileData.photo}
                alt="Profile"
                className="w-16 h-16 rounded-full mr-4"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-300 mr-4 flex items-center justify-center text-white">
                {/* Placeholder avatar */}
                {profileData.name ? profileData.name.charAt(0) : "U"}
              </div>
            )}
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              className="text-sm text-gray-600"
            />
          </div>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={profileData.name}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Your Name"
          />
        </div>

        {/* Email */}
        <div className="mb-6">
          <label
            htmlFor="email"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={profileData.email}
            onChange={handleChange}
            required
            disabled // Assuming email is not editable
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-gray-200 cursor-not-allowed"
            placeholder="Email Address"
          />
        </div>

        {/* Add more fields as necessary */}

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isUpdating}
            className={`${
              isUpdating
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-indigo-700 hover:bg-indigo-800"
            } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
          >
            {isUpdating ? "Updating..." : "Update Profile"}
          </button>
        </div>

        {error && <p className="text-red-500 mt-4">{error}</p>}
      </form>
    </div>
  );
};

export default Profile;
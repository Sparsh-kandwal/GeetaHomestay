import { useState, useEffect, useContext } from "react";
import { UserContext } from "../auth/Userprovider";
import { Transition } from "@headlessui/react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, setUser, isLoading: userLoading } = useContext(UserContext);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  });
  const [, setIsUpdating] = useState(false);
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
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(profileData),
      });

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
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4 text-center">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-74px)] bg-gray-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <h2 className="mb-6 text-center text-3xl font-semibold text-indigo-600">Your Profile</h2>

        <div className="mb-6 flex justify-center">
          <img
            src={user.photo || `/static/user.png`}
            alt="User Avatar"
            className="h-16 w-16 rounded-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `/static/user.png`;
            }}
          />
        </div>

        <Transition
          show={success !== ""}
          enter="transition-opacity duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="relative mb-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700" role="alert">
            <strong className="font-bold">Success! </strong>
            <span className="block sm:inline">{success}</span>
            <button onClick={() => setSuccess("")} className="absolute bottom-0 right-0 top-0 px-4 py-3">
              <svg
                className="h-6 w-6 fill-current text-green-500"
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

        <Transition
          show={error !== ""}
          enter="transition-opacity duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="relative mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
            <button onClick={() => setError("")} className="absolute bottom-0 right-0 top-0 px-4 py-3">
              <svg
                className="h-6 w-6 fill-current text-red-500"
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
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={profileData.name}
              onChange={handleChange}
              required
              disabled
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 text-black shadow-sm transition focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={profileData.email}
              onChange={handleChange}
              required
              disabled
              className="mt-1 block w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-gray-500"
              placeholder="Email Address"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={() => navigate("/booking-history")}
              className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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

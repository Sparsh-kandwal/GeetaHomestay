// frontend/src/pages/BookingHistory.jsx

import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../auth/Userprovider";
import { Link } from "react-router-dom";

const BookingHistory = () => {
  const { user, isLoading: userLoading } = useContext(UserContext);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Ensure user is authenticated
    if (!user) {
      setError("You must be logged in to view your booking history.");
      setIsLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/bookings`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              // Include any auth tokens if necessary
            },
            credentials: "include", // Assuming you're using cookies for authentication
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch bookings.");
        }

        const data = await response.json();
        setBookings(data.bookings); // Adjust based on your backend's response structure
      } catch (err) {
        setError(err.message || "An error occurred while fetching bookings.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

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
      <h2 className="text-2xl font-semibold mb-6">Your Booking History</h2>
      {bookings.length === 0 ? (
        <p>You have no bookings yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead>
              <tr>
                <th className="py-3 px-6 bg-indigo-700 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="py-3 px-6 bg-indigo-700 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Room
                </th>
                <th className="py-3 px-6 bg-indigo-700 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Check-In
                </th>
                <th className="py-3 px-6 bg-indigo-700 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Check-Out
                </th>
                <th className="py-3 px-6 bg-indigo-700 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-6 bg-indigo-700 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id} className="border-b">
                  <td className="py-4 px-6">{booking._id}</td>
                  <td className="py-4 px-6">{booking.roomName}</td>
                  <td className="py-4 px-6">
                    {new Date(booking.checkIn).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    {new Date(booking.checkOut).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 capitalize">{booking.status}</td>
                  <td className="py-4 px-6">
                    <Link
                      to={`/booking/${booking._id}`}
                      className="text-indigo-600 hover:underline"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
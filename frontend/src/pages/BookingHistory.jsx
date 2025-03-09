import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import BookingCard from "../components/BookingCard";

const BookingHistory = () => {
  const [groupedBookings, setGroupedBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 10; // Number of bookings per page

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/bookings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch bookings.");
        }

        const data = await response.json();
        console.log("Fetched Data:", data);

        if (data && Array.isArray(data.bookings)) {
          // Filter only confirmed bookings
          const confirmedBookings = data.bookings.filter(booking => booking.paymentStatus !== "cancelled");

          // Group bookings by bookingId
          const grouped = confirmedBookings.reduce((acc, booking) => {
            const { bookingId } = booking;
            if (!acc[bookingId]) {
              acc[bookingId] = { ...booking, roomTypes: [booking.roomType], totalAmount: booking.totalAmount };
            } else {
              acc[bookingId].roomTypes.push(booking.roomType);
              acc[bookingId].totalAmount += booking.totalAmount;
            }
            return acc;
          }, {});

          setGroupedBookings(Object.values(grouped));
        } else {
          throw new Error("Invalid bookings data format.");
        }
      } catch (err) {
        console.error("Fetch Bookings Error:", err);
        setError(err.message || "An error occurred while fetching bookings.");
        toast.error(err.message || "Failed to fetch bookings.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Pagination logic
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = groupedBookings.slice(indexOfFirstBooking, indexOfLastBooking);

  const nextPage = () => {
    if (currentPage < Math.ceil(groupedBookings.length / bookingsPerPage)) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (isLoading) return <p className="text-center mt-5">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-32 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-center mb-6 text-blue-600">Booking History</h2>

      {groupedBookings.length === 0 ? (
        <p className="text-gray-500 text-center">No confirmed bookings found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {currentBookings.map((booking) => (

              <BookingCard booking={booking} />

            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center mt-6 space-x-4">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`px-5 py-2 rounded-lg font-semibold transition ${
                currentPage === 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              Previous
            </button>

            <span className="px-4 py-2 bg-gray-200 rounded-md font-semibold">
              Page {currentPage} of {Math.ceil(groupedBookings.length / bookingsPerPage)}
            </span>

            <button
              onClick={nextPage}
              disabled={currentPage === Math.ceil(groupedBookings.length / bookingsPerPage)}
              className={`px-5 py-2 rounded-lg font-semibold transition ${
                currentPage === Math.ceil(groupedBookings.length / bookingsPerPage)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BookingHistory;

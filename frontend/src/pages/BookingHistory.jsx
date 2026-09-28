import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { CalendarRange, Compass, CreditCard, ReceiptText } from "lucide-react";
import BookingCard from "../components/BookingCard";
import { UserContext } from "../auth/Userprovider";
import { checkouthandler } from "../utils/Payment";

const BookingHistory = () => {
  const [groupedBookings, setGroupedBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeBookingId, setActiveBookingId] = useState(null);
  const [now, setNow] = useState(Date.now());
  const bookingsPerPage = 10;
  const { user } = useContext(UserContext);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
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

      if (!data || !Array.isArray(data.bookings)) {
        throw new Error("Invalid bookings data format.");
      }

      const grouped = data.bookings.reduce((acc, booking) => {
        const { bookingId } = booking;
        const createdAtMs = new Date(booking.createdAt).getTime();
        const pendingExpiresAt = new Date(createdAtMs + 5 * 60 * 1000).toISOString();

        if (!acc[bookingId]) {
          acc[bookingId] = {
            ...booking,
            roomTypes: [booking.roomType],
            totalAmount: booking.totalAmount,
            pendingExpiresAt,
          };
        } else {
          acc[bookingId].roomTypes.push(booking.roomType);
          acc[bookingId].totalAmount += booking.totalAmount;

          if (createdAtMs > new Date(acc[bookingId].createdAt).getTime()) {
            acc[bookingId].createdAt = booking.createdAt;
            acc[bookingId].pendingExpiresAt = pendingExpiresAt;
          }
        }

        return acc;
      }, {});

      setGroupedBookings(Object.values(grouped));
      setError(null);
    } catch (err) {
      console.error("Fetch Bookings Error:", err);
      setError(err.message || "An error occurred while fetching bookings.");
      toast.error(err.message || "Failed to fetch bookings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const handleCompletePayment = async (booking) => {
    if (!user?._id) {
      toast.error("Please log in before completing payment.");
      return;
    }

    try {
      setActiveBookingId(booking.bookingId);
      await checkouthandler(
        booking.bookingId,
        user,
        async (paymentId) => {
          await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/payment/checkPaymentStatus`,
            {
              paymentId,
              bookingId: booking.bookingId,
            },
            { withCredentials: true }
          );

          toast.success("Payment completed. Booking confirmed.");
          await fetchBookings();
        },
        { bookingId: booking.bookingId }
      );
    } catch (err) {
      console.error("Payment Retry Error:", err);
      toast.error("Unable to start payment. Please try again.");
    } finally {
      setActiveBookingId(null);
    }
  };

  const visibleBookings = groupedBookings.filter((booking) => {
    if (booking.paymentStatus !== "pending") {
      return true;
    }

    return new Date(booking.pendingExpiresAt).getTime() > now;
  });

  useEffect(() => {
    setGroupedBookings((prevBookings) =>
      prevBookings.filter((booking) => {
        if (booking.paymentStatus !== "pending") {
          return true;
        }

        return new Date(booking.pendingExpiresAt).getTime() > now;
      })
    );
  }, [now]);

  const totalPages = Math.max(1, Math.ceil(visibleBookings.length / bookingsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = visibleBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const pendingBookings = visibleBookings.filter((booking) => booking.paymentStatus === "pending").length;
  const confirmedBookings = visibleBookings.length - pendingBookings;

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] bg-[#ece4d7] p-8 animate-pulse" />
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-32 rounded-[24px] bg-[#ece4d7] animate-pulse" />
          ))}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-80 rounded-[28px] bg-[#ece4d7] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-[28px] border border-[#efc9be] bg-[#fff5f0] p-8">
          <p className="text-2xl font-semibold text-[#17322e]">Unable to load bookings</p>
          <p className="mt-3 text-sm text-[#8b4e31]">{error}</p>
          <button
            onClick={fetchBookings}
            className="mt-6 rounded-full bg-[#1f5b52] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17322e]"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] py-8 sm:py-12">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12">
        
        {/* Page Header */}
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8b4e31]">
            Stays & Reservations
          </span>
          <h1 className="mt-2 font-merriweather text-3xl font-bold text-[#17322e] sm:text-4xl">
            My Bookings
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#4f5750]">
            Review your confirmed reservations at Geeta Homestay, check stay details, or complete pending payments.
          </p>
        </div>

        {/* Overview Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#e7dfd2] bg-white p-5 shadow-[0_4px_20px_rgba(23,50,46,0.04)]">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7efe3] text-[#8b4e31]">
                <ReceiptText className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f746d]">Total Bookings</p>
                <p className="text-2xl font-bold text-[#17322e]">{visibleBookings.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e7dfd2] bg-white p-5 shadow-[0_4px_20px_rgba(23,50,46,0.04)]">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef5f2] text-[#1f5b52]">
                <Compass className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f746d]">Confirmed</p>
                <p className="text-2xl font-bold text-[#1f5b52]">{confirmedBookings}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e7dfd2] bg-white p-5 shadow-[0_4px_20px_rgba(23,50,46,0.04)]">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1ea] text-[#8b4e31]">
                <CreditCard className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f746d]">Pending Payment</p>
                <p className="text-2xl font-bold text-[#8b4e31]">{pendingBookings}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings List / Grid */}
        {visibleBookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d9cfbf] bg-white p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f7efe3] text-[#8b4e31]">
              <CalendarRange className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-merriweather text-xl font-semibold text-[#17322e]">No bookings found</h2>
            <p className="mt-2 text-sm text-[#6f746d]">
              Your confirmed stays and active pending reservations will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {currentBookings.map((booking) => (
                <BookingCard
                  key={booking.bookingId}
                  booking={booking}
                  onCompletePayment={handleCompletePayment}
                  isPaying={activeBookingId === booking.bookingId}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#e7dfd2] bg-white px-6 py-4 sm:flex-row">
                <p className="text-xs font-medium text-[#6f746d]">
                  Page <span className="font-semibold text-[#17322e]">{currentPage}</span> of{" "}
                  <span className="font-semibold text-[#17322e]">{totalPages}</span>
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                      currentPage === 1
                        ? "cursor-not-allowed bg-[#ece4d7]/60 text-[#9c968b]"
                        : "bg-[#f7efe3] text-[#17322e] hover:bg-[#ece1ce]"
                    }`}
                  >
                    Previous
                  </button>

                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                      currentPage === totalPages
                        ? "cursor-not-allowed bg-[#ece4d7]/60 text-[#9c968b]"
                        : "bg-[#1f5b52] text-white hover:bg-[#17322e]"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default BookingHistory;

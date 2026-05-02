import { useEffect, useContext, useState } from "react";
import { CheckCircle, Mail, ArrowRight } from "lucide-react";
import { UserContext } from "../auth/Userprovider";
import { useLocation, useNavigate } from "react-router-dom";
import BookingFlowIndicator from "../components/BookingFlowIndicator";

const BookingConfirmation = () => {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [emailStatus] = useState("sent");

  useEffect(() => {
    if (!location.state?.fromCart) {
      navigate("/cart");
    }
  }, [location, navigate]);

  const bookingId = location.state?.bookingDetails?.bookings?.[0]?.bookingId;
  const bookings = location.state?.bookingDetails?.bookings || [];
  const totalAmount = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[28px] bg-[linear-gradient(135deg,#17322e_0%,#295046_100%)] p-5 text-white shadow-[0_22px_50px_rgba(23,50,46,0.16)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f1c8af]">
              Confirmed
            </p>
            <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">
              Booking confirmed
            </h1>
          </div>
          <div className="rounded-full bg-white/10 p-4">
            <CheckCircle className="h-14 w-14 text-[#d7f2df]" />
          </div>
        </div>

        <div className="mt-6">
          <BookingFlowIndicator currentStep={4} compact />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[24px] border border-[#e7dfd2] bg-white p-5 shadow-[0_18px_42px_rgba(23,50,46,0.08)] sm:p-6">
          <h2 className="text-2xl font-semibold text-[#17322e]">Booking</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#f7efe3] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b4e31]">Booking ID</p>
              <p className="mt-2 break-all text-base font-semibold text-[#17322e]">{bookingId || "Pending"}</p>
            </div>
            <div className="rounded-2xl bg-[#eef5f2] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1f5b52]">Email</p>
              <p className="mt-2 text-base font-semibold text-[#17322e]">{user?.email || "Not available"}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {bookings.map((booking) => (
              <div
                key={`${booking.roomType}-${booking.checkIn}-${booking.checkOut}`}
                className="rounded-[20px] border border-[#ece3d7] bg-[#fffdf9] p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#17322e]">{booking.roomType}</h3>
                    <p className="mt-1 text-sm text-[#6f746d]">
                      {new Date(booking.checkIn).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      -{" "}
                      {new Date(booking.checkOut).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <p className="text-base font-semibold text-[#1f5b52]">
                    Rs. {(booking.totalAmount || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[24px] border border-[#e7dfd2] bg-white p-5 shadow-[0_18px_42px_rgba(23,50,46,0.08)]">
            <div className="rounded-2xl bg-[#eef5f2] p-4">
              <div className="flex items-center gap-2 text-[#1f5b52]">
                <Mail className="h-4 w-4" />
                <p className="font-semibold">Email</p>
              </div>
              <p className="mt-1 text-sm text-[#5e635d]">
                {emailStatus === "sent" && "Sent automatically after payment confirmation"}
              </p>
            </div>
            <div className="mt-4 rounded-2xl bg-[#fff1ea] p-4">
              <p className="font-semibold text-[#8b4e31]">Paid</p>
              <p className="mt-1 text-lg font-semibold text-[#17322e]">
                Rs. {totalAmount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#e7dfd2] bg-white p-5 shadow-[0_18px_42px_rgba(23,50,46,0.08)]">
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/booking-history")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1f5b52] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17322e]"
              >
                View bookings
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate("/rooms")}
                className="inline-flex items-center justify-center rounded-full bg-[#f7efe3] px-5 py-3 text-sm font-semibold text-[#17322e] transition hover:bg-[#ece1ce]"
              >
                More rooms
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;

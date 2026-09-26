import { useEffect, useContext } from "react";
import { ArrowRight, Check } from "lucide-react";
import { UserContext } from "../auth/Userprovider";
import { useLocation, useNavigate } from "react-router-dom";
import BookingFlowIndicator from "../components/BookingFlowIndicator";

const BookingConfirmation = () => {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state?.fromCart) {
      navigate("/cart");
    }
  }, [location, navigate]);

  const bookingId = location.state?.bookingDetails?.bookings?.[0]?.bookingId;
  const bookings = location.state?.bookingDetails?.bookings || [];
  const totalAmount = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] py-8 sm:py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        
        {/* Step Indicator */}
        <div className="mb-8 flex justify-center">
          <div className="w-full max-w-xs">
            <BookingFlowIndicator currentStep={4} compact />
          </div>
        </div>

        {/* Warm Personal Header */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f7efe3] px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#8b4e31]">
            <Check className="h-3.5 w-3.5" /> Stay Confirmed
          </span>

          <h1 className="mt-4 font-merriweather text-3xl font-bold leading-tight text-[#17322e] sm:text-4xl">
            We're expecting you!
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#4f5750] sm:text-base">
            Thank you{user?.userName ? `, ${user.userName.split(" ")[0]}` : ""}! Your reservation at Geeta Homestay is complete. We've emailed your invoice and stay details to{" "}
            <span className="font-semibold text-[#17322e]">{user?.email || "your account"}</span>.
          </p>
        </div>

        {/* Booking Summary Card */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-[#e7dfd2] bg-white p-6 shadow-[0_4px_24px_rgba(23,50,46,0.05)] sm:p-8">
          
          {/* Card Top: ID & Total */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e7dfd2] pb-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8b4e31]">
                Booking Reference
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-[#17322e]">
                {bookingId || "Pending Confirmation"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6f746d]">
                Total Amount Paid
              </p>
              <p className="mt-0.5 text-xl font-bold text-[#17322e]">
                ₹{totalAmount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Reserved Rooms */}
          <div className="mt-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#17322e]">
              Reserved Rooms ({bookings.length})
            </h2>

            <div className="space-y-3">
              {bookings.map((booking, idx) => (
                <div
                  key={`${booking.roomType}-${booking.checkIn}-${booking.checkOut}-${idx}`}
                  className="flex flex-col gap-3 rounded-xl border border-[#e7dfd2]/60 bg-[#fffdf9] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-merriweather text-base font-semibold text-[#17322e]">
                      {booking.roomType}
                    </h3>
                    <p className="mt-1 text-xs text-[#6f746d]">
                      {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}
                      {booking.quantity ? ` · ${booking.quantity} ${booking.quantity === 1 ? "room" : "rooms"}` : ""}
                      {booking.members ? ` · ${booking.members} guests` : ""}
                    </p>
                  </div>

                  <p className="text-sm font-bold text-[#17322e]">
                    ₹{(booking.totalAmount || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Location note / Homestay message */}
          <div className="mt-6 rounded-xl bg-[#f9f4eb] p-4 text-xs text-[#4f5750]">
            <p className="font-semibold text-[#17322e]">Location & Contact</p>
            <p className="mt-1 leading-relaxed">
              Geeta Homestay, Karanprayag, Uttarakhand · Need help or directions? Reach us anytime.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => navigate("/booking-history")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1f5b52] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#17322e]"
          >
            View booking history
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate("/rooms")}
            className="inline-flex items-center justify-center rounded-xl border border-[#e7dfd2] bg-white px-6 py-3.5 text-sm font-semibold text-[#17322e] transition hover:bg-[#f7efe3]"
          >
            Explore more rooms
          </button>
        </div>

      </div>
    </div>
  );
};

export default BookingConfirmation;

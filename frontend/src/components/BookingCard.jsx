import { CalendarDays, CreditCard, Clock3, Hash, CheckCircle2, XCircle } from "lucide-react";
import PropTypes from "prop-types";

const BookingCard = ({ booking, onCompletePayment, isPaying }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isPending = booking.paymentStatus === "pending";
  const isCancelled = booking.paymentStatus === "cancelled";
  const pendingUntilText = booking.pendingExpiresAt
    ? new Date(booking.pendingExpiresAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-[28px] border border-[#ede3d5] bg-white p-6 shadow-[0_4px_24px_rgba(23,50,46,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(23,50,46,0.1)]">
      <div>
        {/* Card Header: Reference & Understated Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0e7dc] pb-4">
          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#8f8679]">
            <Hash className="h-3.5 w-3.5 text-[#8b4e31]" />
            <span className="truncate">{booking.bookingId}</span>
          </div>

          {/* Understated Status Badge */}
          {isPending ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf2eb] px-3 py-1 text-xs font-semibold text-[#8b4e31]">
              <Clock3 className="h-3.5 w-3.5 text-[#8b4e31]" />
              Payment Pending
            </span>
          ) : isCancelled ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f2f4f3] px-3 py-1 text-xs font-semibold text-[#6f746d]">
              <XCircle className="h-3.5 w-3.5 text-[#6f746d]" />
              Cancelled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef5f2] px-3 py-1 text-xs font-semibold text-[#1f5b52]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#1f5b52]" />
              Confirmed
            </span>
          )}
        </div>

        {/* Room Types Listing */}
        <div className="mt-4">
          <h3 className="font-merriweather text-lg font-semibold text-[#17322e] leading-snug">
            {booking.roomTypes.join(" · ")}
          </h3>
        </div>

        {/* Dates Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-[#e7dfd2]/70 bg-[#fffdf9] p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#8b4e31]">
              <CalendarDays className="h-3.5 w-3.5" />
              Check-in
            </div>
            <p className="mt-1 text-xs font-semibold text-[#17322e]">
              {formatDate(booking.checkIn)}
            </p>
          </div>

          <div className="rounded-xl border border-[#e7dfd2]/70 bg-[#fffdf9] p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#1f5b52]">
              <CalendarDays className="h-3.5 w-3.5" />
              Check-out
            </div>
            <p className="mt-1 text-xs font-semibold text-[#17322e]">
              {formatDate(booking.checkOut)}
            </p>
          </div>
        </div>
      </div>

      {/* Footer: Price & Retry Action */}
      <div className="mt-5 pt-4 border-t border-[#f0e7dc]">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-medium text-[#6f746d]">
            {isPending ? "Amount due" : "Total paid"}
          </span>
          <span className="font-merriweather text-2xl font-bold text-[#17322e]">
            ₹{booking.totalAmount.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Pending payment notice & retry action */}
        {isPending && (
          <div className="mt-4 rounded-xl border border-[#f5d0c5] bg-[#fff6f2] p-3.5">
            <p className="text-xs leading-relaxed text-[#8b4e31]">
              Reserved temporarily. Finish payment before{" "}
              <span className="font-semibold">{pendingUntilText || "expiry"}</span>.
            </p>

            <button
              onClick={() => onCompletePayment?.(booking)}
              disabled={isPaying}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f5b52] px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#17322e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CreditCard className="h-3.5 w-3.5" />
              {isPaying ? "Opening payment..." : "Complete payment now"}
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

BookingCard.propTypes = {
  booking: PropTypes.shape({
    bookingId: PropTypes.string.isRequired,
    paymentStatus: PropTypes.string,
    pendingExpiresAt: PropTypes.string,
    checkIn: PropTypes.string,
    checkOut: PropTypes.string,
    roomTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
    totalAmount: PropTypes.number.isRequired,
  }).isRequired,
  onCompletePayment: PropTypes.func,
  isPaying: PropTypes.bool,
};

export default BookingCard;

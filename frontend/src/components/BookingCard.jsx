import { CalendarDays, CreditCard, Clock3, Hash, IndianRupee } from "lucide-react";

const BookingCard = ({ booking, onCompletePayment, isPaying }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const isPending = booking.paymentStatus === "pending";
  const pendingUntilText = booking.pendingExpiresAt
    ? new Date(booking.pendingExpiresAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <article className="overflow-hidden rounded-[28px] border border-[#e7dfd2] bg-white shadow-[0_18px_48px_rgba(23,50,46,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_65px_rgba(23,50,46,0.14)]">
      <div
        className={`p-5 text-white ${
          isPending
            ? "bg-[linear-gradient(135deg,#8b4e31_0%,#c77b52_100%)]"
            : "bg-[linear-gradient(135deg,#17322e_0%,#295046_100%)]"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
              Booking
            </p>
            <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
              <Hash className="h-4 w-4 shrink-0" />
              <span className="truncate">{booking.bookingId}</span>
            </div>
          </div>
          <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-semibold">
            {isPending ? "Payment Pending" : "Confirmed"}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#f7efe3] px-4 py-4">
            <div className="flex items-center gap-2 text-[#8b4e31]">
              <CalendarDays className="h-4 w-4" />
              <p className="text-sm font-semibold">Check-in</p>
            </div>
            <p className="mt-2 text-sm font-semibold text-[#17322e]">{formatDate(booking.checkIn)}</p>
          </div>

          <div className="rounded-2xl bg-[#eef5f2] px-4 py-4">
            <div className="flex items-center gap-2 text-[#1f5b52]">
              <CalendarDays className="h-4 w-4" />
              <p className="text-sm font-semibold">Check-out</p>
            </div>
            <p className="mt-2 text-sm font-semibold text-[#17322e]">{formatDate(booking.checkOut)}</p>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f8679]">
            Room Types
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {booking.roomTypes.map((roomType, index) => (
              <span
                key={`${roomType}-${index}`}
                className="rounded-full border border-[#e3dacd] bg-[#fffdf9] px-3 py-1.5 text-sm font-medium text-[#4f5750]"
              >
                {roomType}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-[22px] bg-[#fbf6ef] px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f8679]">Total Paid</p>
            <div className="mt-2 flex items-center gap-1 text-2xl font-semibold text-[#17322e]">
              <IndianRupee className="h-5 w-5" />
              <span>{booking.totalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>
          <div className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#1f5b52]">
            {isPending ? "Awaiting payment" : "Reserved"}
          </div>
        </div>

        {isPending && (
          <div className="mt-5 rounded-[22px] border border-[#efc9be] bg-[#fff5ef] p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-[#fff1ea] p-2 text-[#8b4e31]">
                <Clock3 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#8b4e31]">Complete your payment</p>
                <p className="mt-1 text-sm leading-6 text-[#946047]">
                  This booking is reserved for a short time.
                  {pendingUntilText ? ` Finish payment before ${pendingUntilText}.` : ""}
                </p>
              </div>
            </div>

            <button
              onClick={() => onCompletePayment?.(booking)}
              disabled={isPaying}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#8b4e31] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#744127] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <CreditCard className="h-4 w-4" />
              {isPaying ? "Opening payment..." : "Complete payment"}
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default BookingCard;

import { FaTrashAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { CalendarDays, Users } from "lucide-react";

const removeFromCart = async (roomType, checkIn, checkOut, setAvailableItems) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/deleteFromCart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ roomType, checkIn, checkOut }),
    });

    if (response.ok) {
      setAvailableItems((prev) =>
        prev.filter(
          (item) =>
            !(item.roomType === roomType && item.checkIn === checkIn && item.checkOut === checkOut)
        )
      );
    }
  } catch (error) {
    console.error("Error removing item from cart", error);
  }
};

const variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
  removed: { opacity: 0, y: -24, transition: { duration: 0.3 } },
};

const CartItem = ({ item, isRemoved = false, setAvailableItems, onUpdateQuantity }) => {
  const roomName = item.room?.roomName || item.roomType || "Room";
  const coverImage = item.room?.coverImage
    ? import.meta.env.VITE_CLOUDINARY_CLOUD + item.room.coverImage
    : "/static/mount1.jpg";

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <motion.div
      className={`relative overflow-hidden rounded-[28px] border p-5 sm:p-6 shadow-[0_4px_24px_rgba(23,50,46,0.05)] transition-all ${
        isRemoved ? "border-[#efc9be] bg-[#fff5f0]" : "border-[#ede3d5] bg-white"
      }`}
      initial="visible"
      animate={isRemoved ? "removed" : "visible"}
      exit="removed"
      variants={variants}
    >
      {isRemoved && (
        <div className="mb-4 rounded-xl border border-[#efc9be] bg-[#fff1ea] p-3 text-xs font-semibold text-[#8b4e31]">
          {`${item.removedQuantity} room${item.removedQuantity > 1 ? "s" : ""} removed due to availability changes.`}
        </div>
      )}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {/* Cover Photo */}
        <div className="h-44 w-full sm:h-36 sm:w-44 shrink-0 overflow-hidden rounded-2xl bg-[#efe7da]">
          <img
            src={coverImage}
            alt={roomName}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Room & Stay Details */}
        <div className="flex flex-1 flex-col justify-between min-w-0">
          <div>
            {/* Title & Price Header */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="font-merriweather text-lg sm:text-xl font-semibold text-[#17322e]">
                {roomName}
              </h3>
              <span className="font-merriweather text-xl font-bold text-[#17322e]">
                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
              </span>
            </div>

            {/* Room Count Stepper — Prominent below value in BIG font */}
            {!isRemoved && onUpdateQuantity ? (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8b4e31]">
                  Rooms:
                </span>
                <div className="flex items-center gap-2.5 rounded-xl border border-[#e7dfd2] bg-[#f9f4eb] px-3.5 py-1.5">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item, item.quantity - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1f5b52] text-sm font-bold text-white transition hover:bg-[#17322e] active:scale-95"
                    aria-label="Decrease room count"
                  >
                    −
                  </button>
                  <span className="min-w-[24px] text-center font-merriweather text-xl font-bold text-[#17322e]">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item, item.quantity + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1f5b52] text-sm font-bold text-white transition hover:bg-[#17322e] active:scale-95"
                    aria-label="Increase room count"
                  >
                    +
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-xs font-semibold text-[#4f5750]">
                {item.quantity} {item.quantity === 1 ? "Room" : "Rooms"}
              </div>
            )}

            {/* Guests Specs & Stay Dates Badge */}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#6f746d]">
              <span className="inline-flex items-center gap-1.5 font-medium text-[#4f5750]">
                <Users className="h-3.5 w-3.5 text-[#8b4e31]" />
                {item.members} Guests
              </span>
              <span>•</span>
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#e7dfd2]/70 bg-[#fffdf9] px-3 py-1 text-xs font-medium text-[#4f5750]">
                <CalendarDays className="h-3.5 w-3.5 text-[#1f5b52]" />
                <span>
                  {formatDate(item.checkIn)} – {formatDate(item.checkOut)}
                </span>
              </div>
            </div>
          </div>

          {/* Understated Remove Control */}
          {!isRemoved && (
            <div className="mt-4 flex items-center justify-between border-t border-[#f0e7dc] pt-3">
              <span className="text-xs text-[#8f8679]">
                ₹{item.price.toLocaleString("en-IN")} / night
              </span>
              <button
                onClick={() =>
                  removeFromCart(item.roomType, item.checkIn, item.checkOut, setAvailableItems)
                }
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8b4e31] transition hover:text-[#744127] hover:underline"
                aria-label="Remove room from cart"
              >
                <FaTrashAlt className="h-3 w-3" />
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CartItem;

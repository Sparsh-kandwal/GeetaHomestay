import { FaTrashAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { CalendarDays, Users, BedDouble } from "lucide-react";

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
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
  removed: { opacity: 0, y: -32, transition: { duration: 0.35 } },
};

const CartItem = ({ item, isRemoved = false, setAvailableItems }) => (
  <motion.div
    className={`relative overflow-hidden rounded-[28px] border p-5 shadow-[0_16px_38px_rgba(23,50,46,0.05)] ${
      isRemoved
        ? "border-[#efc9be] bg-[#fff5f0]"
        : "border-[#e6ddd1] bg-white"
    }`}
    initial="visible"
    animate={isRemoved ? "removed" : "visible"}
    exit="removed"
    variants={variants}
  >
    {isRemoved && (
      <div className="mb-4 rounded-2xl border border-[#efc9be] bg-[#fff1ea] px-4 py-3 text-sm font-semibold text-[#8b4e31]">
        {`${item.removedQuantity} room${item.removedQuantity > 1 ? "s" : ""} removed from your cart because availability changed.`}
      </div>
    )}

    <div className="grid gap-5 md:grid-cols-[220px_1fr]">
      <img
        src={import.meta.env.VITE_CLOUDINARY_CLOUD + item.room.coverImage}
        alt={item.room.roomName || "Room"}
        className="h-56 w-full rounded-[24px] object-cover"
      />

      <div className="min-w-0">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-[#17322e]">
              {item.room.roomName || "Room"}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#f7efe3] px-3 py-1 text-xs font-semibold text-[#8b4e31]">
                Mountain stay
              </span>
              {!isRemoved && (
                <span className="rounded-full bg-[#eef5f2] px-3 py-1 text-xs font-semibold text-[#1f5b52]">
                  Ready for checkout
                </span>
              )}
            </div>
          </div>

          <div className="rounded-[22px] bg-[#f8f3eb] p-4 xl:min-w-[200px]">
            <span className="text-sm text-[#90897c] line-through">
              Rs. {Math.round(item.price * 1.4).toLocaleString("en-IN")}
            </span>
            <p className="mt-2 text-2xl font-semibold text-[#17322e]">
              Rs. {item.price.toLocaleString("en-IN")}
            </p>
            <p className="text-sm text-[#6f746d]">per room</p>
            <p className="mt-2 text-sm font-semibold text-[#1f5b52]">
              Save Rs. {(Math.round(item.price * 1.4) - item.price).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {!isRemoved && (
            <div className="rounded-2xl bg-[#f9f4eb] px-4 py-3 text-sm text-[#5e635d]">
              <div className="flex items-center gap-2 font-medium text-[#17322e]">
                <BedDouble className="h-4 w-4 text-[#8b4e31]" />
                Rooms
              </div>
              <p className="mt-1">{item.quantity}</p>
            </div>
          )}

          <div className="rounded-2xl bg-[#f9f4eb] px-4 py-3 text-sm text-[#5e635d]">
            <div className="flex items-center gap-2 font-medium text-[#17322e]">
              <Users className="h-4 w-4 text-[#8b4e31]" />
              Guests
            </div>
            <p className="mt-1">{item.members}</p>
          </div>

          <div className="rounded-2xl bg-[#f9f4eb] px-4 py-3 text-sm text-[#5e635d] sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 font-medium text-[#17322e]">
              <CalendarDays className="h-4 w-4 text-[#8b4e31]" />
              Stay dates
            </div>
            <p className="mt-1">
              {new Date(item.checkIn).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              {" - "}
              {new Date(item.checkOut).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {!isRemoved && (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg font-semibold text-[#17322e]">
              Total: Rs. {(item.price * item.quantity).toLocaleString("en-IN")}
            </p>

            <button
              onClick={() =>
                removeFromCart(item.roomType, item.checkIn, item.checkOut, setAvailableItems)
              }
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#fff1ea] px-4 py-2.5 text-sm font-semibold text-[#8b4e31] transition hover:bg-[#fde6db]"
              aria-label="Remove from cart"
            >
              <FaTrashAlt className="h-4 w-4" />
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

export default CartItem;

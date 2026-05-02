import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ShieldCheck, ArrowRight, ShoppingBag } from "lucide-react";
import { RoomContext, UserContext } from "../auth/Userprovider";
import CartItem from "./Cartitem";
import { checkouthandler } from "../utils/Payment";
import BookingFlowIndicator from "./BookingFlowIndicator";
import axios from "axios";
import { toast } from "react-hot-toast";

const Cart = () => {
  const [availableItems, setAvailableItems] = useState([]);
  const [removedItems, setRemovedItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { fetchRooms, rooms, setRooms, roomsLoading } = useContext(RoomContext);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRooms = sessionStorage.getItem("rooms");
    if (storedRooms) {
      setRooms(JSON.parse(storedRooms));
    } else {
      fetchRooms();
    }
  }, [fetchRooms, setRooms]);

  useEffect(() => {
    const newTotalAmount = availableItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setTotalAmount(newTotalAmount);
  }, [availableItems]);

  const totalInflatedPrice = availableItems.reduce(
    (acc, item) => acc + Math.round(item.price * 1.4) * item.quantity,
    0
  );
  const totalSavings = totalInflatedPrice - totalAmount;

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/getCart`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const data = await response.json();

        if (data.available) {
          const enrichedAvailable = data.available.map((item) => ({
            ...item,
            room: rooms.find((room) => room.roomType === item.roomType) || {},
          }));
          setAvailableItems(enrichedAvailable);
        }

        if (data.removed) {
          const enrichedRemoved = data.removed.map((item) => ({
            ...item,
            room: rooms.find((room) => room.roomType === item.roomType) || {},
          }));
          setRemovedItems(enrichedRemoved);
        }
      } catch (error) {
        console.error("Error Fetching Cart Items", error);
        toast.error("Failed to fetch cart items");
      } finally {
        setLoading(false);
      }
    };

    if (!roomsLoading) fetchCart();
  }, [roomsLoading, rooms]);

  const handleProceedToCheckout = async () => {
    if (!user?._id) {
      toast.error("Please log in before proceeding to payment.");
      return;
    }

    try {
      setIsProcessing(true);
      const bookingResponse = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/bookroom`,
        {
          userId: user._id,
          totalAmount,
        },
        { withCredentials: true }
      );

      if (bookingResponse.data.success) {
        const bookingId = bookingResponse.data.bookings?.[0]?.bookingId;
        const payableAmount = bookingResponse.data.bookings?.reduce(
          (sum, booking) => sum + (booking.totalAmount || 0),
          0
        ) || totalAmount;

        if (bookingResponse.data.hasPendingPayment) {
          toast("You already have a pending booking. Complete that payment to confirm it.");
        }

        await checkouthandler(
          payableAmount,
          user,
          async (paymentId) => {
            await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/payment/checkPaymentStatus`,
              {
                paymentId,
                userId: user._id,
                bookingId,
              },
              { withCredentials: true }
            );

            navigate("/booking-confirmation", {
              state: {
                bookingDetails: bookingResponse.data,
                fromCart: true,
              },
            });
          },
          { bookingId }
        );
      } else {
        toast.error("Booking failed. Please try again.");
      }
    } catch (error) {
      console.error("Booking Error:", error);
      toast.error("Booking request failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || roomsLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 animate-pulse rounded-[24px] bg-[#ece4d7]" />
            ))}
          </div>
          <div className="h-80 animate-pulse rounded-[24px] bg-[#ece4d7]" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] bg-[linear-gradient(135deg,#17322e_0%,#295046_100%)] p-5 text-white shadow-[0_22px_50px_rgba(23,50,46,0.16)] sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f1c8af]">
            Cart
          </p>
          <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">Review & pay</h1>
        </div>

        <div className="rounded-[28px] border border-[#e7dfd2] bg-[rgba(255,252,247,0.92)] p-5 shadow-[0_16px_40px_rgba(23,50,46,0.06)]">
          <BookingFlowIndicator currentStep={3} compact />
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#eef5f2] px-4 py-2 text-sm text-[#1f5b52]">
            <ShieldCheck className="h-4 w-4" />
            Secure payment
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-3xl font-semibold text-[#17322e]">Your cart</h2>
            <span className="rounded-full bg-[#f7efe3] px-4 py-2 text-sm font-semibold text-[#8b4e31]">
              {availableItems.length} item{availableItems.length === 1 ? "" : "s"}
            </span>
          </div>

          {availableItems.length === 0 && removedItems.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#d9cfbf] bg-[rgba(255,252,247,0.9)] p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f7efe3]">
                <ShoppingBag className="h-6 w-6 text-[#8b4e31]" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-[#17322e]">Cart is empty</h3>
              <button
                onClick={() => navigate("/rooms")}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1f5b52] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17322e]"
              >
                View rooms
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {removedItems.length > 0 && (
                <div className="rounded-[24px] border border-[#efc9be] bg-[#fff5f0] p-4">
                  <h3 className="text-base font-semibold text-[#8b4e31]">Availability updated</h3>
                  <div className="mt-4 space-y-4">
                    {removedItems.map((item) => (
                      <CartItem
                        key={`removed-${item.id || item.roomType}`}
                        item={item}
                        isRemoved
                        setAvailableItems={setAvailableItems}
                      />
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                <div className="space-y-5">
                  {availableItems.map((item) => (
                    <CartItem
                      key={`available-${item.id || item.roomType}`}
                      item={item}
                      setAvailableItems={setAvailableItems}
                    />
                  ))}
                </div>
              </AnimatePresence>
            </div>
          )}
        </div>

        {availableItems.length > 0 && (
          <div className="lg:w-[360px]">
            <div className="rounded-[24px] border border-[#e7dfd2] bg-white p-5 shadow-[0_18px_42px_rgba(23,50,46,0.08)] lg:sticky lg:top-32">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-[#17322e]">Summary</h2>
                </div>
                <div className="rounded-full bg-[#eef5f2] px-3 py-1 text-xs font-semibold text-[#1f5b52]">
                  Secure
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between text-sm text-[#90897c] line-through">
                  <span>Original</span>
                  <span>Rs. {totalInflatedPrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between text-base font-semibold text-[#17322e]">
                  <span>Total</span>
                  <span>Rs. {totalAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-semibold text-[#1f5b52]">
                  <span>Save</span>
                  <span>Rs. {totalSavings.toLocaleString("en-IN")}</span>
                </div>
                <div className="rounded-2xl bg-[#f7efe3] p-4 text-sm text-[#6f746d]">
                  Taxes included
                </div>
                <button
                  onClick={handleProceedToCheckout}
                  disabled={isProcessing}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1f5b52] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#17322e] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isProcessing ? "Preparing..." : "Proceed to pay"}
                  {!isProcessing && <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

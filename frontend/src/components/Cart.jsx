import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ShieldCheck, ArrowRight, ShoppingBag, AlertCircle } from "lucide-react";
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
  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    title: "",
    message: "",
    details: "",
  });
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
          bookingId,
          user,
          async (paymentId) => {
            await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/payment/checkPaymentStatus`,
              {
                paymentId,
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

  const handleUpdateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/deleteFromCart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            roomType: item.roomType,
            checkIn: item.checkIn,
            checkOut: item.checkOut,
          }),
        });
        if (response.ok) {
          setAvailableItems((prev) =>
            prev.filter(
              (i) =>
                !(
                  i.roomType === item.roomType &&
                  i.checkIn === item.checkIn &&
                  i.checkOut === item.checkOut
                )
            )
          );
        }
      } catch (err) {
        console.error("Error removing item:", err);
      }
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/updateCart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          updates: [
            {
              roomType: item.roomType,
              quantity: newQuantity,
              members: item.members,
              checkIn: item.checkIn,
              checkOut: item.checkOut,
            },
          ],
        }),
      });

      const data = await response.json();

      if (response.ok && data.updatedItems && data.updatedItems.length > 0) {
        setAvailableItems((prev) =>
          prev.map((i) =>
            i.roomType === item.roomType &&
            i.checkIn === item.checkIn &&
            i.checkOut === item.checkOut
              ? { ...i, quantity: newQuantity }
              : i
          )
        );
        toast.success("Room count updated");
      } else if (data.notUpdated && data.notUpdated.length > 0) {
        const msg = data.notUpdated[0].message || "Not enough rooms available";
        const avail = data.notUpdated[0].availableRooms ?? item.quantity;
        setModalInfo({
          isOpen: true,
          title: "Availability Limit Reached",
          message: `Unable to increase room count for ${item.room?.roomName || item.roomType}.`,
          details: `Only ${avail} room(s) available for dates ${new Date(item.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${new Date(item.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}.`,
        });
      } else {
        toast.error(data.message || "Failed to update room count");
      }
    } catch (err) {
      console.error("Error updating room quantity:", err);
      toast.error("Internal server error");
    }
  };

  if (loading || roomsLoading) {
    return (
      <div className="min-h-screen bg-[#faf7f2] py-10">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-44 animate-pulse rounded-[28px] bg-[#ece4d7]" />
              ))}
            </div>
            <div className="h-72 animate-pulse rounded-[28px] bg-[#ece4d7]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] py-8 sm:py-12">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12">
        
        {/* Header & Flow Indicator */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8b4e31]">
              Reservation Summary
            </span>
            <h1 className="mt-2 font-merriweather text-3xl font-bold text-[#17322e] sm:text-4xl">
              Review & Pay
            </h1>
          </div>

          <div className="max-w-xs">
            <BookingFlowIndicator currentStep={3} compact />
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] lg:gap-12">
          
          {/* Left Column: Cart Items */}
          <div className="min-w-0">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-merriweather text-xl font-semibold text-[#17322e]">
                Selected Rooms
              </h2>
              <span className="text-xs font-medium text-[#6f746d]">
                {availableItems.length} {availableItems.length === 1 ? "room" : "rooms"}
              </span>
            </div>

            {availableItems.length === 0 && removedItems.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-[#d9cfbf] bg-white p-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f7efe3] text-[#8b4e31]">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-merriweather text-xl font-semibold text-[#17322e]">Your cart is empty</h3>
                <p className="mt-2 text-sm text-[#6f746d]">Explore our mountain suites to start your reservation.</p>
                <button
                  onClick={() => navigate("/rooms")}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1f5b52] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#17322e]"
                >
                  Explore rooms
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {removedItems.length > 0 && (
                  <div className="rounded-[28px] border border-[#efc9be] bg-[#fff5f0] p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-[#8b4e31]">
                      Availability Notice
                    </h3>
                    <div className="mt-3 space-y-3">
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
                  <div className="space-y-4">
                    {availableItems.map((item) => (
                      <CartItem
                        key={`available-${item.id || item.roomType}`}
                        item={item}
                        setAvailableItems={setAvailableItems}
                        onUpdateQuantity={handleUpdateQuantity}
                      />
                    ))}
                  </div>
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary Box */}
          {availableItems.length > 0 && (
            <div>
              <div className="top-24 rounded-[28px] border border-[#ede3d5] bg-white p-6 shadow-[0_4px_24px_rgba(23,50,46,0.05)] lg:sticky">
                <h2 className="font-merriweather text-xl font-semibold text-[#17322e]">
                  Stay Summary
                </h2>

                <div className="mt-5 space-y-3 border-t border-[#f0e7dc] pt-4">
                  {availableItems.map((item) => (
                    <div
                      key={`sum-${item.roomType}`}
                      className="flex items-center justify-between text-xs text-[#4f5750]"
                    >
                      <span className="truncate pr-2">
                        {item.room?.roomName || item.roomType} ({item.quantity}x)
                      </span>
                      <span className="font-medium text-[#17322e]">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 border-t border-[#f0e7dc] pt-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f746d]">Total Payable</p>
                      <p className="text-[11px] text-[#8f8679]">Includes all taxes & fees</p>
                    </div>
                    <p className="font-merriweather text-2xl font-bold text-[#17322e]">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleProceedToCheckout}
                    disabled={isProcessing}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f5b52] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#17322e] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isProcessing ? "Preparing..." : "Proceed to pay"}
                    {!isProcessing && <ArrowRight className="h-4 w-4" />}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-[#6f746d] pt-1">
                    <ShieldCheck className="h-4 w-4 text-[#1f5b52]" />
                    <span>Secure payment powered by Razorpay</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Information Modal Popup when room count cannot be increased */}
      {modalInfo.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-[28px] border border-[#ede3d5] bg-white p-6 shadow-2xl transition-all sm:p-8">
            <div className="flex items-center gap-3 text-[#8b4e31]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff5f0]">
                <AlertCircle className="h-6 w-6 text-[#8b4e31]" />
              </div>
              <h3 className="font-merriweather text-xl font-bold text-[#17322e]">
                {modalInfo.title || "Information"}
              </h3>
            </div>

            <p className="mt-4 font-semibold text-[#17322e]">
              {modalInfo.message}
            </p>

            <p className="mt-2 text-sm text-[#6f746d]">
              {modalInfo.details}
            </p>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setModalInfo({ ...modalInfo, isOpen: false })}
                className="rounded-xl bg-[#1f5b52] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#17322e] active:scale-95"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

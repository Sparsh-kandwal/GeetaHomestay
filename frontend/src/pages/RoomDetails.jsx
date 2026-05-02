import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaChevronLeft,
  FaHeart,
  FaExclamationTriangle,
  FaCartPlus,
  FaShoppingBag,
} from "react-icons/fa";
import { ShieldCheck, CalendarDays, Users, BedDouble, Lock, Sparkles } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { useDateContext } from "../contexts/DateContext";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { RoomContext, UserContext } from "../auth/Userprovider";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "../auth/api";
import BookingFlowIndicator from "../components/BookingFlowIndicator";
import {
  buildAssetUrl,
  findRoomByIdentifier,
  getFallbackRoomImage,
  normalizeRoom,
  toRoomSlug,
} from "../utils/roomData";

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const { user, setUser } = useContext(UserContext);
  const { checkInDate, setCheckInDate, checkOutDate, setCheckOutDate } = useDateContext();
  const { fetchRooms, roomsLoading, rooms } = useContext(RoomContext);
  const [room, setRoom] = useState();
  const [load, setLoad] = useState(true);
  const [minCheckOutDate, setMinCheckOutDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [roomCount, setRoomCount] = useState(1);
  const [galleryFallbacks, setGalleryFallbacks] = useState({});
  const [roomDetails, setRoomDetails] = useState({
    roomType: null,
    roomName: null,
    price: null,
    description: null,
    amenities: [],
    maxAdults: 1,
    gallery: [],
    totalRooms: 0,
    availableRooms: null,
  });

  const responseGoogle = async (authResult) => {
    try {
      if (authResult.code) {
        const result = await googleAuth(authResult.code);
        if (result.data?.user) {
          setUser(result.data.user);
        } else {
          alert("Error while processing login.");
        }
      } else {
        alert("Google Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during Google Login:", error);
      alert("Error while Google Login...");
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
    scope: "openid profile email",
  });

  useEffect(() => {
    if (!rooms?.length) {
      fetchRooms();
    }
  }, [fetchRooms, rooms]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [id]);

  useEffect(() => {
    if (roomsLoading) {
      setRoom(undefined);
      return;
    }

    if (rooms && rooms.length > 0) {
      const matchedRoom = findRoomByIdentifier(rooms, id);
      setRoom(matchedRoom);
    } else {
      setRoom(undefined);
    }
  }, [roomsLoading, rooms, id]);

  useEffect(() => {
    if (room) {
      const normalizedRoom = normalizeRoom(room);
      setGalleryFallbacks({});
      setLoad(false);
      setRoomDetails({
        roomType: normalizedRoom.roomType || null,
        roomName: normalizedRoom.roomName || null,
        price: normalizedRoom.price || null,
        description: normalizedRoom.description || null,
        amenities: normalizedRoom.amenities || [],
        maxAdults: normalizedRoom.maxAdults || 1,
        gallery: normalizedRoom.gallery || [getFallbackRoomImage()],
        totalRooms: normalizedRoom.totalRooms || null,
        availableRooms: normalizedRoom.availableRooms ?? null,
      });
      return;
    }

    if (!roomsLoading) {
      setLoad(false);
    }
  }, [room, roomsLoading]);

  useEffect(() => {
    if (!checkInDate) {
      const today = new Date().toISOString().split("T")[0];
      setCheckInDate(today);
      setMinCheckOutDate(today);
    }
  }, [checkInDate, setCheckInDate]);

  useEffect(() => {
    if (checkInDate) {
      const nextDay = new Date(checkInDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setMinCheckOutDate(nextDay.toISOString().split("T")[0]);
    }
  }, [checkInDate]);

  const isInvalidDateRange = () => {
    return checkInDate && checkOutDate && checkInDate >= checkOutDate;
  };

  const getBookingBlockMessage = () => {
    if (!checkOutDate) {
      return "Please select a check-out date first.";
    }

    if (isInvalidDateRange()) {
      return "Please choose a valid check-out date after check-in.";
    }

    if (!user) {
      return "Please log in first to continue.";
    }

    return "";
  };

  const handleBlockedBookingAction = () => {
    const message = getBookingBlockMessage();

    if (message) {
      toast.info(message);
      return true;
    }

    return false;
  };

  useEffect(() => {
    if (guests > roomDetails.maxAdults * roomCount) {
      setGuests(roomDetails.maxAdults * roomCount);
    }
  }, [guests, roomDetails.maxAdults, roomCount]);

  const calculateTotalPrice = () => {
    if (!checkInDate || !checkOutDate) return roomDetails.price;
    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);
    const timeDiff = endDate - startDate;
    const dayCount = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
    return dayCount * roomDetails.price * roomCount;
  };

  const handleAddToCart = async () => {
    if (handleBlockedBookingAction()) {
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/addToCart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          checkIn: checkInDate,
          checkOut: checkOutDate,
          members: guests,
          roomType: roomDetails.roomType,
          quantity: roomCount,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Added to cart");
      }
      if (response.status === 400) {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Internal server error");
    }
  };

  const handleBuyNow = async () => {
    if (handleBlockedBookingAction()) {
      return;
    }

    try {
      const availabilityResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/checkAvailability`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            checkIn: checkInDate,
            checkOut: checkOutDate,
          }),
        }
      );

      const availabilityData = await availabilityResponse.json();

      if (
        !availabilityData.success ||
        !availabilityData.availability[roomDetails.roomType] ||
        availabilityData.availability[roomDetails.roomType].availableRooms < roomCount
      ) {
        toast.error("Not available for selected dates");
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/addToCart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          checkIn: checkInDate,
          checkOut: checkOutDate,
          members: guests,
          roomType: roomDetails.roomType,
          quantity: roomCount,
        }),
      });

      if (response.ok) {
        toast.success("Added to cart");
        navigate("/cart");
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Internal server error");
    }
  };

  const swiperSettings = {
    modules: [Autoplay, Navigation, Pagination, EffectFade],
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    navigation: true,
    pagination: { clickable: true },
    effect: "fade",
    loop: true,
    speed: 1000,
  };

  if (roomsLoading || load) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-72 animate-pulse rounded-[28px] bg-[#ece4d7]" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <div className="h-12 w-2/3 animate-pulse rounded-2xl bg-[#ece4d7]" />
            <div className="h-32 animate-pulse rounded-[24px] bg-[#ece4d7]" />
            <div className="h-48 animate-pulse rounded-[24px] bg-[#ece4d7]" />
          </div>
          <div className="h-[420px] animate-pulse rounded-[24px] bg-[#ece4d7]" />
        </div>
      </div>
    );
  }

  if (!room && !load) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="rounded-[28px] border border-[#efc9be] bg-[#fff5f0] p-8">
          <FaExclamationTriangle className="mx-auto mb-4 text-4xl text-[#8b4e31]" />
          <h2 className="text-3xl font-semibold text-[#17322e]">Room not found</h2>
          <button
            onClick={() => navigate("/rooms")}
            className="mt-6 rounded-full bg-[#1f5b52] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17322e]"
          >
            Back to rooms
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = roomDetails.price ? calculateTotalPrice() : 0;
  const bookingBlockMessage = getBookingBlockMessage();
  const isBookingReady = !bookingBlockMessage;
  const galleryImages =
    roomDetails.gallery && roomDetails.gallery.length > 0
      ? roomDetails.gallery
      : [getFallbackRoomImage()];
  const availabilityCopy =
    roomDetails.availableRooms === null || roomDetails.availableRooms === undefined
      ? `${roomDetails.totalRooms} rooms`
      : roomDetails.availableRooms > 0
        ? `${roomDetails.availableRooms} available`
        : "Unavailable";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#f7efe3] px-4 py-2.5 text-sm font-semibold text-[#17322e] transition hover:bg-[#ece1ce]"
      >
        <FaChevronLeft />
        Back
      </button>

      <div className="rounded-[28px] bg-[linear-gradient(135deg,#17322e_0%,#295046_100%)] p-5 text-white shadow-[0_22px_50px_rgba(23,50,46,0.16)] sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f1c8af]">
              Room
            </p>
            <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">{roomDetails.roomName}</h1>
            <p className="mt-3 text-sm text-white/75">{availabilityCopy}</p>
          </div>
          <BookingFlowIndicator currentStep={2} compact />
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] xl:gap-8">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[28px] border border-[#e7dfd2] bg-white shadow-[0_18px_48px_rgba(23,50,46,0.08)]">
            <div className="relative">
              <Swiper {...swiperSettings}>
                {galleryImages.map((image, index) => (
                  <SwiperSlide key={`${roomDetails.roomType}-${index}`}>
                    <img
                      src={
                        galleryFallbacks[index]
                          ? getFallbackRoomImage()
                          : buildAssetUrl(image)
                      }
                      alt={`${roomDetails.roomName} ${index + 1}`}
                      className="h-[280px] w-full object-cover sm:h-[420px] lg:h-[520px]"
                      loading="lazy"
                      onError={() =>
                        setGalleryFallbacks((prev) => ({ ...prev, [index]: true }))
                      }
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              <button
                onClick={() => setIsFavorite((prev) => !prev)}
                className="absolute right-4 top-4 rounded-full bg-white/90 p-3 text-red-500 shadow-md transition hover:bg-white"
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <FaHeart className={isFavorite ? "text-red-600" : "text-gray-400"} />
              </button>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#e7dfd2] bg-white p-5 shadow-[0_18px_42px_rgba(23,50,46,0.06)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#eef5f2] px-3 py-1 text-xs font-semibold text-[#1f5b52]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Trusted
                  </span>
                  <span className="rounded-full bg-[#f7efe3] px-3 py-1 text-xs font-semibold text-[#8b4e31]">
                    {availabilityCopy}
                  </span>
                </div>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-[#5e635d]">
                  {roomDetails.description || "Clean stay with simple comfort and mountain access."}
                </p>
              </div>
              <div className="rounded-[20px] bg-[#f8f3eb] p-4 sm:min-w-[200px]">
                <p className="text-sm text-[#90897c] line-through">
                  Rs. {roomDetails.price ? Math.round(roomDetails.price * 1.4).toLocaleString("en-IN") : "--"}
                </p>
                <p className="mt-2 text-3xl font-semibold text-[#17322e]">
                  Rs. {roomDetails.price?.toLocaleString("en-IN")}
                </p>
                <p className="text-sm text-[#6f746d]">per night</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#f7efe3] px-4 py-4">
                <div className="flex items-center gap-2 text-[#8b4e31]">
                  <Users className="h-4 w-4" />
                  <p className="text-sm font-semibold">Guests</p>
                </div>
                <p className="mt-2 text-sm text-[#5e635d]">Up to {roomDetails.maxAdults}</p>
              </div>
              <div className="rounded-2xl bg-[#eef5f2] px-4 py-4">
                <div className="flex items-center gap-2 text-[#1f5b52]">
                  <BedDouble className="h-4 w-4" />
                  <p className="text-sm font-semibold">Rooms</p>
                </div>
                <p className="mt-2 text-sm text-[#5e635d]">{roomDetails.totalRooms}</p>
              </div>
              <div className="rounded-2xl bg-[#fff1ea] px-4 py-4">
                <div className="flex items-center gap-2 text-[#8b4e31]">
                  <CalendarDays className="h-4 w-4" />
                  <p className="text-sm font-semibold">Price</p>
                </div>
                <p className="mt-2 text-sm text-[#5e635d]">Per night</p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#e7dfd2] bg-white p-5 shadow-[0_18px_42px_rgba(23,50,46,0.06)]">
            <h2 className="text-2xl font-semibold text-[#17322e]">Amenities</h2>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {roomDetails.amenities.length > 0 ? (
                roomDetails.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="flex min-h-[56px] items-center rounded-2xl border border-[#e3dacd] bg-[#fffdf9] px-4 py-3 text-sm text-[#4f5750]"
                  >
                    {amenity.icon && <span className="mr-2 text-base">{amenity.icon}</span>}
                    {amenity.name}
                  </span>
                ))
              ) : (
                <p className="col-span-full text-sm text-[#6f746d]">
                  Amenities will be updated soon.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="rounded-[24px] border border-[#e7dfd2] bg-white p-5 shadow-[0_18px_42px_rgba(23,50,46,0.08)] xl:sticky xl:top-32">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b4e31]">
                  Book
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[#17322e]">
                  Select dates
                </h2>
              </div>
              <div className="rounded-full bg-[#eef5f2] px-3 py-1 text-xs font-semibold text-[#1f5b52]">
                Price clear
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="rounded-2xl border border-[#e6ddd1] bg-[#fffdf9] px-4 py-3">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8b4e31]">
                  Check-in
                </span>
                <input
                  type="date"
                  value={checkInDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-[#17322e] outline-none"
                />
              </label>
              <label className="rounded-2xl border border-[#e6ddd1] bg-[#fffdf9] px-4 py-3">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8b4e31]">
                  Check-out
                </span>
                <input
                  type="date"
                  value={checkOutDate}
                  min={minCheckOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-[#17322e] outline-none"
                />
              </label>
            </div>

            {isInvalidDateRange() && (
              <div className="mt-4 rounded-2xl border border-[#efc9be] bg-[#fff1ea] px-4 py-3 text-sm text-[#8b4e31]">
                Check-out must be after check-in.
              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#f9f4eb] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#17322e]">Rooms</p>
                  <p className="text-xs text-[#8b4e31]">Max {roomDetails.totalRooms || 1}</p>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-full bg-white p-2">
                  <button
                    type="button"
                    onClick={() => setRoomCount((prev) => prev - 1)}
                    disabled={roomCount <= 1}
                    className="h-10 w-10 rounded-full bg-[#1f5b52] text-white disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold text-[#17322e]">{roomCount}</span>
                  <button
                    type="button"
                    onClick={() => setRoomCount((prev) => prev + 1)}
                    disabled={roomCount >= (roomDetails.totalRooms || 1)}
                    className="h-10 w-10 rounded-full bg-[#1f5b52] text-white disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-[#f9f4eb] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#17322e]">Guests</p>
                  <p className="text-xs text-[#8b4e31]">Max {roomDetails.maxAdults * roomCount}</p>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-full bg-white p-2">
                  <button
                    type="button"
                    onClick={() => setGuests((prev) => prev - 1)}
                    disabled={guests <= 1}
                    className="h-10 w-10 rounded-full bg-[#1f5b52] text-white disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold text-[#17322e]">{guests}</span>
                  <button
                    type="button"
                    onClick={() => setGuests((prev) => prev + 1)}
                    disabled={guests >= roomDetails.maxAdults * roomCount}
                    className="h-10 w-10 rounded-full bg-[#1f5b52] text-white disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[20px] bg-[#f7efe3] p-4">
              <div className="flex items-center gap-2 text-[#8b4e31]">
                <CalendarDays className="h-4 w-4" />
                <p className="text-sm font-semibold">Total</p>
              </div>
              <p className="mt-2 text-3xl font-semibold text-[#17322e]">
                Rs. {totalPrice.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="mt-5 rounded-[24px] border border-[#eadcca] bg-[linear-gradient(180deg,#fffdf8_0%,#fbf4ea_100%)] p-4 shadow-[0_16px_35px_rgba(139,78,49,0.08)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b4e31]">
                    Next step
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-[#17322e]">
                    {isBookingReady ? "You are ready to book" : "One quick step left"}
                  </h3>
                </div>
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    isBookingReady
                      ? "bg-[#eef5f2] text-[#1f5b52]"
                      : "bg-[#fff1ea] text-[#8b4e31]"
                  }`}
                >
                  {isBookingReady ? <Sparkles className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                  {isBookingReady ? "Ready" : "Action needed"}
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-[#6b6258]">
                {isBookingReady
                  ? "Continue to reserve this room now or save it to your cart for later."
                  : bookingBlockMessage}
              </p>

              <div className="mt-4 space-y-3">
              <button
                onClick={() => {
                  if (handleBlockedBookingAction()) {
                    return;
                  }

                  handleBuyNow();
                }}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(31,91,82,0.24)] transition ${
                  isBookingReady
                    ? "bg-[#1f5b52] hover:-translate-y-0.5 hover:bg-[#17322e]"
                    : "bg-[linear-gradient(135deg,#b97a5a_0%,#8b4e31_100%)] hover:-translate-y-0.5 hover:brightness-105"
                }`}
                aria-label="Book Now"
              >
                <FaShoppingBag />
                Book now
              </button>

              <button
                onClick={() => {
                  if (handleBlockedBookingAction()) {
                    return;
                  }

                  handleAddToCart();
                }}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-full border px-5 py-4 text-sm font-semibold transition ${
                  isBookingReady
                    ? "border-[#f1d7c5] bg-[#fff1ea] text-[#8b4e31] hover:-translate-y-0.5 hover:bg-[#fde6db]"
                    : "border-[#ead1bc] bg-white text-[#8b4e31] hover:-translate-y-0.5 hover:bg-[#fff8f3]"
                }`}
                aria-label="Add to Cart"
              >
                <FaCartPlus />
                Add to cart
              </button>

              {bookingBlockMessage && (
                <div className="rounded-[20px] border border-[#efc9be] bg-white/80 px-4 py-3 text-sm text-[#8b4e31]">
                  <p className="font-semibold">Booking tip</p>
                  <p className="mt-1 text-[#946047]">{bookingBlockMessage}</p>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;

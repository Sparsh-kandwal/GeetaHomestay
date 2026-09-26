import { useState, useEffect, useContext } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  FaChevronLeft,
  FaHeart,
  FaExclamationTriangle,
  FaCartPlus,
} from "react-icons/fa";
import { Users, BedDouble, Lock, Sparkles } from "lucide-react";
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
  buildRoomCardImageUrl,
  findRoomByIdentifier,
  getRoomGalleryImages,
  normalizeRoom,
} from "../utils/roomData";

const RoomDetails = () => {
  const { id } = useParams();
  const location = useLocation();
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
    hasRoomImages: false,
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
    const stateRoom = location.state?.room;

    if (stateRoom && findRoomByIdentifier([stateRoom], id)) {
      setRoom(stateRoom);
      return;
    }

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
  }, [roomsLoading, rooms, id, location.state]);

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
        gallery: getRoomGalleryImages(normalizedRoom, { includeFallback: false }),
        hasRoomImages: normalizedRoom.hasRoomImages,
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
      return "Please log in to continue your booking.";
    }

    return "";
  };

  const handleBlockedBookingAction = () => {
    const message = getBookingBlockMessage();

    if (message) {
      if (!user && checkOutDate && !isInvalidDateRange()) {
        googleLogin();
      } else {
        toast.info(message);
      }

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
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Gallery skeleton */}
        <div className="h-[56vw] max-h-[520px] min-h-[260px] animate-pulse rounded-lg bg-[#ece4d7]" />
        {/* Title skeleton */}
        <div className="mt-8 h-10 w-2/3 animate-pulse rounded bg-[#ece4d7]" />
        <div className="mt-4 h-5 w-1/3 animate-pulse rounded bg-[#ece4d7]" />
        {/* Content skeleton */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            <div className="h-4 w-full animate-pulse rounded bg-[#ece4d7]" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-[#ece4d7]" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-[#ece4d7]" />
          </div>
          <div className="h-[400px] animate-pulse rounded-2xl bg-[#ece4d7]" />
        </div>
      </div>
    );
  }

  if (!room && !load) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <FaExclamationTriangle className="mx-auto mb-5 text-3xl text-[#8b4e31]" />
        <h2 className="font-merriweather text-2xl font-semibold text-[#17322e]">
          Room not found
        </h2>
        <p className="mt-2 text-sm text-[#6f746d]">
          This room may no longer be available.
        </p>
        <button
          onClick={() => navigate("/rooms")}
          className="mt-6 rounded-full bg-[#1f5b52] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#17322e]"
        >
          Browse rooms
        </button>
      </div>
    );
  }

  const totalPrice = roomDetails.price ? calculateTotalPrice() : 0;
  const bookingBlockMessage = getBookingBlockMessage();
  const isBookingReady = !bookingBlockMessage;
  const galleryImages = roomDetails.gallery?.filter(Boolean) || [];
  const roomSwiperSettings = {
    ...swiperSettings,
    autoplay: galleryImages.length > 1 ? swiperSettings.autoplay : false,
    navigation: galleryImages.length > 1,
    pagination: galleryImages.length > 1 ? swiperSettings.pagination : false,
    loop: galleryImages.length > 1,
  };
  const availabilityCopy =
    roomDetails.availableRooms === null || roomDetails.availableRooms === undefined
      ? `${roomDetails.totalRooms} rooms`
      : roomDetails.availableRooms > 0
        ? `${roomDetails.availableRooms} available`
        : "Unavailable";

  const nightCount =
    checkInDate && checkOutDate
      ? Math.max(1, Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / 86400000))
      : null;

  const renderBookingCard = (isMobile = false) => (
    <div
      className={`rounded-2xl border border-[#e7dfd2] bg-white p-5 shadow-[0_4px_24px_rgba(23,50,46,0.06)] sm:p-6 ${
        isMobile ? "mb-8 lg:hidden" : "hidden lg:block lg:sticky lg:top-24"
      }`}
    >
      <h2 className="font-merriweather text-xl font-semibold text-[#17322e]">
        Reserve your stay
      </h2>

      {/* Date Pickers */}
      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <label className="rounded-xl border border-[#e6ddd1] bg-[#fffdf9] px-3.5 py-2.5 transition focus-within:border-[#1f5b52]">
            <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b4e31]">
              Check-in
            </span>
            <input
              type="date"
              value={checkInDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-[#17322e] outline-none sm:text-sm"
            />
          </label>
          <label className="rounded-xl border border-[#e6ddd1] bg-[#fffdf9] px-3.5 py-2.5 transition focus-within:border-[#1f5b52]">
            <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b4e31]">
              Check-out
            </span>
            <input
              type="date"
              value={checkOutDate}
              min={minCheckOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-[#17322e] outline-none sm:text-sm"
            />
          </label>
        </div>

        {isInvalidDateRange() && (
          <p className="text-xs text-[#8b4e31]">
            Check-out must be after check-in.
          </p>
        )}

        {/* Rooms & Guests */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="rounded-xl bg-[#f9f4eb] p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#17322e]">Rooms</p>
              <p className="text-[10px] text-[#8b4e31]">Max {roomDetails.totalRooms || 1}</p>
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setRoomCount((prev) => prev - 1)}
                disabled={roomCount <= 1}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1f5b52] text-xs font-semibold text-white transition hover:bg-[#17322e] disabled:opacity-40"
              >
                −
              </button>
              <span className="text-sm font-semibold text-[#17322e]">{roomCount}</span>
              <button
                type="button"
                onClick={() => setRoomCount((prev) => prev + 1)}
                disabled={roomCount >= (roomDetails.totalRooms || 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1f5b52] text-xs font-semibold text-white transition hover:bg-[#17322e] disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-[#f9f4eb] p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#17322e]">Guests</p>
              <p className="text-[10px] text-[#8b4e31]">Max {roomDetails.maxAdults * roomCount}</p>
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setGuests((prev) => prev - 1)}
                disabled={guests <= 1}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1f5b52] text-xs font-semibold text-white transition hover:bg-[#17322e] disabled:opacity-40"
              >
                −
              </button>
              <span className="text-sm font-semibold text-[#17322e]">{guests}</span>
              <button
                type="button"
                onClick={() => setGuests((prev) => prev + 1)}
                disabled={guests >= roomDetails.maxAdults * roomCount}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1f5b52] text-xs font-semibold text-white transition hover:bg-[#17322e] disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="mt-5 border-t border-[#e7dfd2] pt-4">
        {nightCount && (
          <div className="flex items-center justify-between text-xs text-[#4f5750]">
            <span>
              ₹{roomDetails.price?.toLocaleString("en-IN")} × {nightCount}{" "}
              {nightCount === 1 ? "night" : "nights"}
              {roomCount > 1 ? ` × ${roomCount} rooms` : ""}
            </span>
            <span className="font-medium text-[#17322e]">
              ₹{totalPrice.toLocaleString("en-IN")}
            </span>
          </div>
        )}
        <div className="mt-2 flex items-end justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f746d]">Total</p>
          <p className="text-2xl font-bold text-[#17322e]">
            ₹{totalPrice.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 space-y-2.5">
        <button
          onClick={() => {
            if (handleBlockedBookingAction()) return;
            handleBuyNow();
          }}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition ${
            isBookingReady
              ? "bg-[#1f5b52] hover:bg-[#17322e]"
              : "bg-[#8b4e31] hover:brightness-110"
          }`}
          aria-label="Book Now"
        >
          {isBookingReady ? <Sparkles className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
          {isBookingReady ? "Book now" : "Complete details to book"}
        </button>
        <button
          onClick={() => {
            if (handleBlockedBookingAction()) return;
            handleAddToCart();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#e7dfd2] bg-white px-5 py-3.5 text-sm font-semibold text-[#17322e] transition hover:bg-[#f7efe3]"
          aria-label="Add to Cart"
        >
          <FaCartPlus className="h-3.5 w-3.5 text-[#8b4e31]" />
          Add to cart
        </button>
      </div>

      {bookingBlockMessage && (
        <p className="mt-3 text-center text-xs leading-relaxed text-[#8b4e31]">
          {bookingBlockMessage}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* Container for full page alignment — extended width for widescreen desktop */}
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 xl:px-12">
        
        {/* ── 1. Room Identity Header (below navbar) ── */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f7efe3] text-[#17322e] transition hover:bg-[#ece1ce]"
                aria-label="Go back"
              >
                <FaChevronLeft className="text-xs" />
              </button>
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8b4e31]">
                {roomDetails.roomType || "Room"} · {availabilityCopy}
              </span>
            </div>
            <h1 className="font-merriweather text-2xl font-bold text-[#17322e] sm:text-3xl lg:text-4xl">
              {roomDetails.roomName}
            </h1>
          </div>

          <div className="flex items-baseline gap-1.5 sm:flex-col sm:items-end sm:gap-0">
            <p className="text-2xl font-bold text-[#17322e] sm:text-3xl">
              ₹{roomDetails.price?.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-[#6f746d]">per night</p>
          </div>
        </div>

        {/* ── 2. Mobile / Tablet Booking Card (Below room name, Above photo) ── */}
        {renderBookingCard(true)}

        {/* ── 3. Photo Gallery (Unobscured full view) ── */}
        <div className="relative mb-10 overflow-hidden rounded-2xl bg-[#ece4d7] shadow-sm sm:rounded-3xl">
          <div className="relative aspect-[4/3] w-full sm:aspect-[16/10] md:aspect-[16/9] lg:aspect-[2.2/1] max-h-[580px]">
            {galleryImages.length > 0 ? (
              <Swiper {...roomSwiperSettings} className="room-gallery-swiper h-full w-full">
                {galleryImages.map((image, index) => (
                  <SwiperSlide key={`${roomDetails.roomType}-${image}`} className="h-full">
                    {!galleryFallbacks[index] && (
                      <img
                        src={buildRoomCardImageUrl(image)}
                        alt={`${roomDetails.roomName} — view ${index + 1}`}
                        className="h-full w-full object-cover"
                        loading={index === 0 ? "eager" : "lazy"}
                        fetchPriority={index === 0 ? "high" : "auto"}
                        sizes="(max-width: 1440px) 100vw, 1440px"
                        onError={() =>
                          setGalleryFallbacks((prev) => ({ ...prev, [index]: true }))
                        }
                      />
                    )}
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[#6f746d]">
                Room photos coming soon
              </div>
            )}

            {/* Favorite button on photo */}
            <button
              onClick={() => setIsFavorite((prev) => !prev)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-sm transition hover:bg-white sm:right-6 sm:top-6 sm:h-11 sm:w-11"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <FaHeart
                className={`h-4 w-4 ${isFavorite ? "text-red-500" : "text-[#a09b93]"}`}
              />
            </button>
          </div>
        </div>

        {/* ── 4. Main Content: Details + Desktop Sticky Booking Card ── */}
        <div className="grid gap-10 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] lg:gap-12 xl:gap-16">
          {/* Left Column: Room Story, Specs & Amenities */}
          <div className="space-y-10">
            
            {/* Booking flow indicator */}
            <div className="max-w-xs">
              <BookingFlowIndicator currentStep={2} compact />
            </div>

            {/* Room Description */}
            {roomDetails.description && (
              <div className="space-y-3">
                <h2 className="font-merriweather text-xl font-semibold text-[#17322e]">
                  About this space
                </h2>
                <p className="text-[15px] leading-7 text-[#4f5750] sm:text-base sm:leading-8">
                  {roomDetails.description}
                </p>
              </div>
            )}

            {/* Room quick facts */}
            <div className="rounded-2xl border border-[#e7dfd2] bg-[#fffdf9] p-6">
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#17322e]">
                Room Overview
              </h3>
              <div className="mt-4 flex flex-wrap gap-8 text-sm text-[#4f5750]">
                <span className="inline-flex items-center gap-2.5 font-medium">
                  <Users className="h-4 w-4 text-[#8b4e31]" />
                  Up to {roomDetails.maxAdults} guests
                </span>
                <span className="inline-flex items-center gap-2.5 font-medium">
                  <BedDouble className="h-4 w-4 text-[#8b4e31]" />
                  {roomDetails.totalRooms} {roomDetails.totalRooms === 1 ? "room" : "rooms"} available
                </span>
              </div>
            </div>

            {/* Amenities */}
            {roomDetails.amenities.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-merriweather text-xl font-semibold text-[#17322e]">
                  What this room offers
                </h3>
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  {roomDetails.amenities.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 rounded-xl border border-[#e7dfd2]/60 bg-[#fffdf9] px-4 py-3 text-sm text-[#17322e]"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f7efe3] text-[#8b4e31]">
                        ✓
                      </span>
                      <span className="font-medium">{item.name || item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Booking Card for Desktop */}
          <div className="lg:relative">
            {renderBookingCard(false)}
          </div>
        </div>

      </div>
    </div>
  );
};

export default RoomDetails;

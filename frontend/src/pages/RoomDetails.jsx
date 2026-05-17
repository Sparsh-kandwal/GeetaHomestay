import { useState, useEffect, useContext } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
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
      <div className="mx-auto w-full max-w-7xl overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
        <div className="h-64 animate-pulse rounded-[24px] bg-[#ece4d7] sm:h-80 lg:h-96 lg:rounded-[28px]" />
        <div className="mt-6 grid gap-6 xl:mt-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-8">
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

  return (
    <div className="mx-auto w-full max-w-7xl overflow-x-hidden px-3 py-3 sm:px-4 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-8">
      {/* ── Back Button ── */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#f7efe3] px-4 py-2 text-xs font-semibold text-[#17322e] transition hover:bg-[#ece1ce] sm:mb-5 sm:px-5 sm:py-2.5 sm:text-sm"
      >
        <FaChevronLeft className="text-[10px] sm:text-xs" />
        Back
      </button>

      {/* ── Hero Banner ── */}
      <div className="rounded-2xl bg-[linear-gradient(135deg,#17322e_0%,#295046_100%)] p-4 text-white shadow-[0_22px_50px_rgba(23,50,46,0.16)] sm:rounded-[24px] sm:p-5 md:rounded-[28px] md:p-6">
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)] lg:items-start">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f1c8af] sm:text-xs sm:tracking-[0.24em]">
              Room
            </p>
            <h1 className="mt-1.5 max-w-[18ch] break-words text-2xl font-semibold leading-tight sm:mt-2 sm:max-w-none sm:text-3xl md:text-4xl lg:text-5xl">
              {roomDetails.roomName}
            </h1>
            <p className="mt-2 text-xs text-white/75 sm:mt-3 sm:text-sm">{availabilityCopy}</p>
          </div>
          <div className="w-full min-w-0 lg:flex lg:justify-end">
            <BookingFlowIndicator currentStep={2} compact />
          </div>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="mt-4 grid min-w-0 gap-4 sm:mt-5 sm:gap-5 md:mt-8 lg:gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)] xl:gap-8">

        {/* ── LEFT COLUMN ── */}
        <div className="min-w-0 space-y-4 sm:space-y-5">

          {/* Image Gallery Card */}
          <div className="overflow-hidden rounded-2xl border border-[#e7dfd2] bg-white shadow-[0_18px_48px_rgba(23,50,46,0.08)] sm:rounded-[24px] md:rounded-[28px]">
            <div className="relative aspect-[4/3] bg-[#efe7da] sm:aspect-[16/10] lg:aspect-[16/9] xl:aspect-[16/10]">
              {galleryImages.length > 0 ? (
                <Swiper {...roomSwiperSettings} className="room-details-swiper h-full">
                  {galleryImages.map((image, index) => (
                    <SwiperSlide key={`${roomDetails.roomType}-${image}`} className="h-full">
                      {!galleryFallbacks[index] && (
                        <img
                          src={buildRoomCardImageUrl(image)}
                          alt={`${roomDetails.roomName} ${index + 1}`}
                          className="h-full w-full object-contain object-center"
                          loading={index === 0 ? "eager" : "lazy"}
                          fetchPriority={index === 0 ? "high" : "auto"}
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 92vw, 58vw"
                          onError={() =>
                            setGalleryFallbacks((prev) => ({ ...prev, [index]: true }))
                          }
                        />
                      )}
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <div className="flex h-full min-h-[240px] items-center justify-center px-6 text-center text-sm font-medium text-[#6f746d]">
                  Room photos are not available for this room yet.
                </div>
              )}

              <button
                onClick={() => setIsFavorite((prev) => !prev)}
                className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-md transition hover:bg-white sm:right-4 sm:top-4"
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <FaHeart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isFavorite ? "text-red-600" : "text-gray-400"}`} />
              </button>
            </div>
          </div>

          {/* Description + Price Card */}
          <div className="rounded-2xl border border-[#e7dfd2] bg-white p-4 shadow-[0_18px_42px_rgba(23,50,46,0.06)] sm:rounded-[24px] sm:p-5 md:rounded-[28px] md:p-6">
            {/* Badges row */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#eef5f2] px-2.5 py-1 text-[10px] font-semibold text-[#1f5b52] sm:px-3 sm:py-1.5 sm:text-xs">
                <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Trusted
              </span>
              <span className="rounded-full bg-[#f7efe3] px-2.5 py-1 text-[10px] font-semibold text-[#8b4e31] sm:px-3 sm:py-1.5 sm:text-xs">
                {availabilityCopy}
              </span>
            </div>

            {/* Description + Price */}
            <div className="mt-3 flex flex-col gap-4 sm:mt-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
              <p className="min-w-0 text-sm leading-6 text-[#5e635d] sm:text-base sm:leading-7">
                {roomDetails.description || "Clean stay with simple comfort and mountain access."}
              </p>

              <div className="w-full flex-shrink-0 rounded-xl bg-[#f8f3eb] p-3 min-[520px]:max-w-[260px] sm:rounded-2xl sm:p-4 md:p-5 lg:w-auto lg:min-w-[220px]">
                <p className="text-xs text-[#90897c] line-through sm:text-sm">
                  Rs. {roomDetails.price ? Math.round(roomDetails.price * 1.4).toLocaleString("en-IN") : "--"}
                </p>
                <p className="mt-1 text-2xl font-bold text-[#17322e] sm:mt-2 sm:text-3xl md:text-4xl">
                  Rs. {roomDetails.price?.toLocaleString("en-IN")}
                </p>
                <p className="mt-0.5 text-xs text-[#6f746d] sm:mt-1 sm:text-sm">per night</p>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-1 gap-2 min-[520px]:grid-cols-3 sm:mt-5 sm:gap-3 md:mt-6 md:gap-4">
              <div className="rounded-xl bg-[#f7efe3] px-2.5 py-3 sm:rounded-2xl sm:px-4 sm:py-4 md:rounded-3xl md:p-5">
                <div className="flex items-center gap-1.5 text-[#8b4e31] sm:gap-2">
                  <Users className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                  <p className="text-[10px] font-semibold sm:text-sm">Guests</p>
                </div>
                <p className="mt-1.5 text-xs font-medium text-[#5e635d] sm:mt-2 sm:text-sm md:text-base">
                  Up to {roomDetails.maxAdults}
                </p>
              </div>
              <div className="rounded-xl bg-[#eef5f2] px-2.5 py-3 sm:rounded-2xl sm:px-4 sm:py-4 md:rounded-3xl md:p-5">
                <div className="flex items-center gap-1.5 text-[#1f5b52] sm:gap-2">
                  <BedDouble className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                  <p className="text-[10px] font-semibold sm:text-sm">Rooms</p>
                </div>
                <p className="mt-1.5 text-xs font-medium text-[#5e635d] sm:mt-2 sm:text-sm md:text-base">
                  {roomDetails.totalRooms}
                </p>
              </div>
              <div className="rounded-xl bg-[#fff1ea] px-2.5 py-3 sm:rounded-2xl sm:px-4 sm:py-4 md:rounded-3xl md:p-5">
                <div className="flex items-center gap-1.5 text-[#8b4e31] sm:gap-2">
                  <CalendarDays className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                  <p className="text-[10px] font-semibold sm:text-sm">Price</p>
                </div>
                <p className="mt-1.5 text-xs font-medium text-[#5e635d] sm:mt-2 sm:text-sm md:text-base">
                  Per night
                </p>
              </div>
            </div>
          </div>

          {/* Amenities Card */}
          <div className="rounded-2xl border border-[#e7dfd2] bg-white p-4 shadow-[0_18px_42px_rgba(23,50,46,0.06)] sm:rounded-[24px] sm:p-5 md:rounded-[28px] md:p-6">
            <h2 className="text-base font-semibold text-[#17322e] sm:text-xl md:text-2xl">Amenities</h2>
            <div className="mt-3 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:mt-4 sm:gap-3 md:grid-cols-3 md:mt-5 md:gap-4 lg:grid-cols-4">
              {roomDetails.amenities.length > 0 ? (
                roomDetails.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="flex min-h-[48px] items-center rounded-lg border border-[#e3dacd] bg-[#fffdf9] px-2.5 py-2.5 text-[11px] text-[#4f5750] transition hover:bg-[#faf7f1] sm:min-h-[56px] sm:rounded-2xl sm:px-3 sm:py-3 sm:text-xs md:min-h-[60px] md:px-4 md:py-4 md:text-sm"
                  >
                    {amenity.icon && (
                      <span className="mr-1.5 flex-shrink-0 text-sm sm:mr-2 sm:text-base">
                        {amenity.icon}
                      </span>
                    )}
                    <span className="min-w-0 flex-shrink leading-tight">{amenity.name}</span>
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

        {/* ── RIGHT COLUMN — Booking Card ── */}
        <div className="w-full min-w-0">
          <div className="rounded-2xl border border-[#e7dfd2] bg-white p-4 shadow-[0_18px_42px_rgba(23,50,46,0.08)] sm:rounded-[24px] sm:p-5 md:rounded-[28px] md:p-6 xl:sticky xl:top-32">

            {/* Card header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8b4e31] sm:text-xs sm:tracking-[0.22em]">
                  Book
                </p>
                <h2 className="mt-1.5 text-base font-semibold text-[#17322e] sm:mt-2 sm:text-xl md:text-2xl">
                  Select dates
                </h2>
              </div>
              <div className="rounded-full bg-[#eef5f2] px-2.5 py-1 text-[10px] font-semibold text-[#1f5b52] whitespace-nowrap sm:px-3 sm:py-1.5 sm:text-xs">
                Price clear
              </div>
            </div>

            {/* Date inputs */}
            <div className="mt-4 grid grid-cols-1 gap-2 min-[520px]:grid-cols-2 sm:mt-5 sm:gap-3">
              <label className="rounded-xl border border-[#e6ddd1] bg-[#fffdf9] px-3 py-3 sm:rounded-2xl sm:px-4">
                <span className="mb-1 block text-[9px] font-semibold uppercase tracking-[0.1em] text-[#8b4e31] sm:text-[10px] sm:tracking-[0.18em]">
                  Check-in
                </span>
                <input
                  type="date"
                  value={checkInDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="min-h-11 w-full bg-transparent text-sm font-medium text-[#17322e] outline-none"
                />
              </label>
              <label className="rounded-xl border border-[#e6ddd1] bg-[#fffdf9] px-3 py-3 sm:rounded-2xl sm:px-4">
                <span className="mb-1 block text-[9px] font-semibold uppercase tracking-[0.1em] text-[#8b4e31] sm:text-[10px] sm:tracking-[0.18em]">
                  Check-out
                </span>
                <input
                  type="date"
                  value={checkOutDate}
                  min={minCheckOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="min-h-11 w-full bg-transparent text-sm font-medium text-[#17322e] outline-none"
                />
              </label>
            </div>

            {/* Invalid date warning */}
            {isInvalidDateRange() && (
              <div className="mt-3 rounded-xl border border-[#efc9be] bg-[#fff1ea] px-3 py-2.5 text-[11px] text-[#8b4e31] sm:mt-4 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
                Check-out must be after check-in.
              </div>
            )}

            {/* Rooms & Guests */}
            <div className="mt-4 grid grid-cols-1 gap-3 min-[430px]:grid-cols-2 sm:mt-5 sm:gap-4">
              <div className="rounded-xl bg-[#f9f4eb] p-3 sm:rounded-2xl sm:p-4 md:p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-[#17322e] sm:text-xs md:text-sm">Rooms</p>
                  <p className="text-[10px] text-[#8b4e31] sm:text-xs">Max {roomDetails.totalRooms || 1}</p>
                </div>
                <div className="mt-2.5 flex items-center justify-between rounded-full bg-white p-1.5 sm:mt-3 sm:p-2">
                  <button
                    type="button"
                    onClick={() => setRoomCount((prev) => prev - 1)}
                    disabled={roomCount <= 1}
                    className="h-11 w-11 rounded-full bg-[#1f5b52] text-lg font-semibold text-white transition hover:bg-[#17322e] disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="text-base font-semibold text-[#17322e] sm:text-lg md:text-xl">{roomCount}</span>
                  <button
                    type="button"
                    onClick={() => setRoomCount((prev) => prev + 1)}
                    disabled={roomCount >= (roomDetails.totalRooms || 1)}
                    className="h-11 w-11 rounded-full bg-[#1f5b52] text-lg font-semibold text-white transition hover:bg-[#17322e] disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-[#f9f4eb] p-3 sm:rounded-2xl sm:p-4 md:p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-[#17322e] sm:text-xs md:text-sm">Guests</p>
                  <p className="text-[10px] text-[#8b4e31] sm:text-xs">Max {roomDetails.maxAdults * roomCount}</p>
                </div>
                <div className="mt-2.5 flex items-center justify-between rounded-full bg-white p-1.5 sm:mt-3 sm:p-2">
                  <button
                    type="button"
                    onClick={() => setGuests((prev) => prev - 1)}
                    disabled={guests <= 1}
                    className="h-11 w-11 rounded-full bg-[#1f5b52] text-lg font-semibold text-white transition hover:bg-[#17322e] disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="text-base font-semibold text-[#17322e] sm:text-lg md:text-xl">{guests}</span>
                  <button
                    type="button"
                    onClick={() => setGuests((prev) => prev + 1)}
                    disabled={guests >= roomDetails.maxAdults * roomCount}
                    className="h-11 w-11 rounded-full bg-[#1f5b52] text-lg font-semibold text-white transition hover:bg-[#17322e] disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Total price */}
            <div className="mt-4 rounded-xl bg-[#f7efe3] p-3 sm:mt-5 sm:rounded-2xl sm:p-4 md:p-5">
              <div className="flex items-center gap-2 text-[#8b4e31]">
                <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <p className="text-[10px] font-semibold uppercase sm:text-xs md:text-sm">Total</p>
              </div>
              <p className="mt-2 text-2xl font-bold text-[#17322e] sm:mt-3 sm:text-3xl md:text-4xl">
                Rs. {totalPrice.toLocaleString("en-IN")}
              </p>
            </div>

            {/* Next step / Action card */}
            <div className="mt-4 rounded-xl border border-[#eadcca] bg-[linear-gradient(180deg,#fffdf8_0%,#fbf4ea_100%)] p-3 shadow-[0_16px_35px_rgba(139,78,49,0.08)] sm:mt-5 sm:rounded-2xl sm:p-4 md:rounded-2xl md:p-6">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8b4e31] sm:text-[10px] sm:tracking-[0.18em]">
                    Next step
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-[#17322e] sm:mt-1.5 sm:text-base md:text-lg">
                    {isBookingReady ? "You are ready to book" : "One quick step left"}
                  </h3>
                </div>
                <div
                  className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold sm:px-2.5 sm:text-xs ${
                    isBookingReady
                      ? "bg-[#eef5f2] text-[#1f5b52]"
                      : "bg-[#fff1ea] text-[#8b4e31]"
                  }`}
                >
                  {isBookingReady ? <Sparkles className="h-2.5 w-2.5" /> : <Lock className="h-2.5 w-2.5" />}
                  {isBookingReady ? "Ready" : "Action"}
                </div>
              </div>

              <p className="mt-2 text-[11px] leading-5 text-[#6b6258] sm:mt-2.5 sm:text-xs sm:leading-5 md:text-sm md:leading-6">
                {isBookingReady
                  ? "Continue to reserve this room now or save it to your cart for later."
                  : bookingBlockMessage}
              </p>

              <div className="mt-3 space-y-2.5 sm:mt-4 sm:space-y-3">
                <button
                  onClick={() => {
                    if (handleBlockedBookingAction()) {
                      return;
                    }
                    handleBuyNow();
                  }}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(31,91,82,0.24)] transition sm:rounded-xl sm:px-5 sm:py-4 md:rounded-full ${
                    isBookingReady
                      ? "bg-[#1f5b52] hover:-translate-y-0.5 hover:bg-[#17322e]"
                      : "bg-[linear-gradient(135deg,#b97a5a_0%,#8b4e31_100%)] hover:-translate-y-0.5 hover:brightness-105"
                  }`}
                  aria-label="Book Now"
                >
                  <FaShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Book now
                </button>

                <button
                  onClick={() => {
                    if (handleBlockedBookingAction()) {
                      return;
                    }
                    handleAddToCart();
                  }}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3.5 text-sm font-semibold transition sm:rounded-xl sm:px-5 sm:py-4 md:rounded-full ${
                    isBookingReady
                      ? "border-[#f1d7c5] bg-[#fff1ea] text-[#8b4e31] hover:-translate-y-0.5 hover:bg-[#fde6db]"
                      : "border-[#ead1bc] bg-white text-[#8b4e31] hover:-translate-y-0.5 hover:bg-[#fff8f3]"
                  }`}
                  aria-label="Add to Cart"
                >
                  <FaCartPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Add to cart
                </button>

                {bookingBlockMessage && (
                  <div className="rounded-lg border border-[#efc9be] bg-white/90 px-3 py-2.5 text-[11px] text-[#8b4e31] sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm md:rounded-2xl">
                    <p className="font-semibold">Booking tip</p>
                    <p className="mt-0.5 text-[#946047] sm:mt-1">{bookingBlockMessage}</p>
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

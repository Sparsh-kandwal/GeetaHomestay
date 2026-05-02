import { useState, memo } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaBed,
  FaUserFriends,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import {
  buildAssetUrl,
  getFallbackRoomImage,
  normalizeRoom,
  toRoomSlug,
} from "../utils/roomData";

const RoomCard = ({ room }) => {
  const normalizedRoom = normalizeRoom(room);
  const {
    roomType,
    roomName,
    price,
    description,
    amenities,
    maxAdults,
    gallery,
    totalRooms,
    availableRooms,
  } = normalizedRoom;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  const visibleAmenities = amenities.slice(0, 4);
  const inventoryCount = availableRooms ?? totalRooms;
  const availabilityLabel =
    availableRooms === undefined
      ? "Check dates for live availability"
      : availableRooms > 0
        ? `${availableRooms} room${availableRooms > 1 ? "s" : ""} left`
        : "Sold out for selected dates";

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? gallery.length - 1 : prevIndex - 1
    );
    setImageError(false);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === gallery.length - 1 ? 0 : prevIndex + 1
    );
    setImageError(false);
  };

  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleCardClick = () => {
    navigate(`/rooms/${encodeURIComponent(toRoomSlug(roomType || roomName))}`);
  };

  return (
    <div
      className="group flex w-full cursor-pointer flex-col overflow-hidden rounded-[30px] border border-[#e7dfd2] bg-white shadow-[0_18px_48px_rgba(23,50,46,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_65px_rgba(23,50,46,0.14)] xl:flex-row"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === "Enter") handleCardClick();
      }}
      aria-label={`View details for ${roomName}`}
    >
      <div className="relative xl:w-[38%]">
        <img
          src={
            imageError
              ? getFallbackRoomImage()
              : buildAssetUrl(gallery[currentImageIndex] || gallery[0])
          }
          alt={`${roomName} ${currentImageIndex + 1}`}
          className="h-72 w-full object-cover sm:h-80 xl:h-full"
          loading="lazy"
          onError={() => setImageError(true)}
        />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <span className="rounded-full bg-[rgba(255,250,242,0.9)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8b4e31]">
            Mountain comfort
          </span>
          <button
            onClick={toggleFavorite}
            className="rounded-full bg-white/90 p-2 text-red-500 shadow-sm transition hover:bg-white"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? (
              <FaHeart className="text-red-600" />
            ) : (
              <FaRegHeart className="text-gray-400" />
            )}
          </button>
        </div>

        {gallery.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white transition hover:bg-black/55"
              aria-label="Previous image"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white transition hover:bg-black/55"
              aria-label="Next image"
            >
              <FaChevronRight />
            </button>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#eef5f2] px-3 py-1 text-xs font-semibold text-[#1f5b52]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Trusted stay
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  availableRooms === undefined
                    ? "bg-[#f7efe3] text-[#8b4e31]"
                    : availableRooms > 0
                      ? "bg-[#eef5f2] text-[#1f5b52]"
                      : "bg-[#fff1ea] text-[#8b4e31]"
                }`}
              >
                {availabilityLabel}
              </span>
            </div>
            <h3 className="mt-4 text-2xl font-semibold text-[#17322e] sm:text-3xl">
              {roomName}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#60655f] line-clamp-2">
              {description}
            </p>
          </div>

          <div className="rounded-[24px] bg-[#f8f3eb] p-4 lg:min-w-[200px]">
            <span className="text-sm text-[#918a7d] line-through">
              Rs. {Math.round(price * 1.4).toLocaleString("en-IN")}
            </span>
            <div className="mt-2 flex items-center gap-2 text-[#c97953]">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                Limited offer
              </span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-[#17322e]">
              Rs. {price.toLocaleString("en-IN")}
            </p>
            <p className="text-sm text-[#6f746d]">per night</p>
            <p className="mt-2 text-sm font-semibold text-[#1f5b52]">
              Save Rs. {(Math.round(price * 1.4) - price).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {visibleAmenities.map((amenity) => (
            <span
              key={amenity.name}
              className="rounded-full border border-[#e3dacd] bg-[#fffdf9] px-3 py-1.5 text-sm text-[#4f5750]"
            >
              {amenity.name}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-[#5e635d]">
          <div className="flex items-center gap-2 rounded-full bg-[#f7efe3] px-4 py-2">
            <FaUserFriends className="text-[#8b4e31]" />
            Up to {maxAdults} guests
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[#eef5f2] px-4 py-2">
            <FaBed className="text-[#1f5b52]" />
            {inventoryCount} total room{inventoryCount > 1 ? "s" : ""}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#6f746d]">Photos, price, and quick booking.</p>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1f5b52] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17322e]"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/rooms/${encodeURIComponent(toRoomSlug(roomType || roomName))}`);
            }}
          >
            View room
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

RoomCard.propTypes = {
  room: PropTypes.shape({
    roomType: PropTypes.string.isRequired,
    roomName: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    description: PropTypes.string,
    amenities: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        icon: PropTypes.node,
      })
    ).isRequired,
    maxAdults: PropTypes.number.isRequired,
    gallery: PropTypes.arrayOf(PropTypes.string).isRequired,
    totalRooms: PropTypes.number,
    availableRooms: PropTypes.number,
  }).isRequired,
};

export default memo(RoomCard);

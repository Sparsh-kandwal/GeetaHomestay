import { useState, memo } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  buildRoomCardImageUrl,
  getRoomGalleryImages,
  getFallbackRoomImage,
  normalizeRoom,
  toRoomSlug,
} from "../utils/roomData";

const RoomCard = ({ room, isFeatured = false }) => {
  const normalizedRoom = normalizeRoom(room);
  const {
    roomType,
    roomName,
    price,
    description,
    amenities,
    maxAdults,
    totalRooms,
    availableRooms,
  } = normalizedRoom;
  const gallery = getRoomGalleryImages(normalizedRoom);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  const visibleAmenities = amenities.slice(0, 4);
  const inventoryCount = availableRooms ?? totalRooms;

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
    navigate(`/rooms/${encodeURIComponent(toRoomSlug(roomType || roomName))}`, {
      state: { room: normalizedRoom },
    });
  };

  return (
    <article
      onClick={handleCardClick}
      className={`group flex flex-col h-full cursor-pointer overflow-hidden rounded-[28px] border border-[#ede3d5] bg-white transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_22px_50px_rgba(23,50,46,0.1)] ${
        isFeatured ? "md:col-span-2 lg:col-span-2" : ""
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`View details for ${roomName}`}
    >
      {/* Large Focal Imagery */}
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#efe7da]">
        <img
          src={
            imageError
              ? getFallbackRoomImage()
              : buildRoomCardImageUrl(gallery[currentImageIndex] || gallery[0])
          }
          alt={`${roomName} view ${currentImageIndex + 1}`}
          className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onError={() => setImageError(true)}
        />

        {/* Carousel controls (subtle appearance on card hover) */}
        {gallery.length > 1 && (
          <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={prevImage}
              className="rounded-full bg-black/45 p-2 text-white backdrop-blur-sm transition hover:bg-black/75"
              aria-label="Previous image"
            >
              <FaChevronLeft className="h-3 w-3" />
            </button>
            <button
              onClick={nextImage}
              className="rounded-full bg-black/45 p-2 text-white backdrop-blur-sm transition hover:bg-black/75"
              aria-label="Next image"
            >
              <FaChevronRight className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Top Overlay: Availability or Featured status + Favorite Button */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3.5">
          {availableRooms !== undefined && availableRooms <= 2 && availableRooms > 0 ? (
            <span className="rounded-full bg-black/55 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md">
              Only {availableRooms} left
            </span>
          ) : availableRooms === 0 ? (
            <span className="rounded-full bg-[#8b4e31]/90 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md">
              Sold out for dates
            </span>
          ) : isFeatured ? (
            <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#8b4e31] backdrop-blur-md shadow-sm">
              Featured Suite
            </span>
          ) : (
            <span />
          )}

          <button
            onClick={toggleFavorite}
            className="ml-auto rounded-full bg-black/35 p-2 text-white backdrop-blur-md transition hover:bg-black/55 hover:scale-110"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? (
              <FaHeart className="h-3.5 w-3.5 text-red-500" />
            ) : (
              <FaRegHeart className="h-3.5 w-3.5 text-white/90" />
            )}
          </button>
        </div>

        {/* Bottom gallery indicator */}
        {gallery.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-black/40 px-2.5 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-md">
            {currentImageIndex + 1} / {gallery.length}
          </div>
        )}
      </div>

      {/* Editorial Content: Clear Focal Point (Name + Price) */}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          {/* Room Name and Price */}
          <div className="flex flex-col gap-1.5">
            <h3 className="font-merriweather text-xl font-semibold leading-snug text-[#17322e] transition group-hover:text-[#1f5b52]">
              {roomName}
            </h3>

            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-merriweather text-2xl font-bold text-[#17322e]">
                ₹{price.toLocaleString("en-IN")}
              </span>
              <span className="text-xs font-normal text-[#6f746d]">/ night</span>
            </div>
          </div>

          {/* Understated Specs */}
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[#8b4e31]">
            <span>Up to {maxAdults} {maxAdults === 1 ? "Guest" : "Guests"}</span>
            <span>•</span>
            <span>Mountain View</span>
            {inventoryCount > 0 && (
              <>
                <span>•</span>
                <span className="text-[#596661] font-normal">{inventoryCount} total</span>
              </>
            )}
          </div>

          {/* Quiet Narrative Description */}
          {description && (
            <p className="mt-3 text-xs sm:text-sm font-light leading-relaxed text-[#596661] line-clamp-2">
              {description}
            </p>
          )}

          {/* Understated Amenities (Clean text list with bullet separators, NOT badge-heavy) */}
          {visibleAmenities.length > 0 && (
            <div className="mt-4 pt-3.5 border-t border-[#f0e7dc]">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#6e7772]">
                {visibleAmenities.map((amenity, idx) => (
                  <span key={amenity.name} className="flex items-center gap-1.5">
                    {idx > 0 && <span className="text-[#c8bcab]">•</span>}
                    <span>{amenity.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Minimalist Action */}
        <div className="mt-6 pt-4 border-t border-[#f0e7dc] flex items-center justify-between text-xs sm:text-sm font-semibold text-[#1f5b52] group-hover:text-[#17322e] transition">
          <span>View Room Details</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-[#8b4e31]" />
        </div>
      </div>
    </article>
  );
};

RoomCard.propTypes = {
  isFeatured: PropTypes.bool,
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


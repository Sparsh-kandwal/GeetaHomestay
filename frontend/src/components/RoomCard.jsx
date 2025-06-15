import React, { useState, memo } from 'react';
import {
  FaChevronLeft,
  FaChevronRight,
  FaBed,
  FaUserFriends,
  FaHeart,
  FaRegHeart,
} from 'react-icons/fa';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const RoomCard = ({ room }) => {
  const {
    roomType,
    roomName,
    price,
    discount,
    description,
    amenities,
    maxAdults,
    gallery,
    totalRooms, // Assuming this property exists
    availableRooms
  } = room;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  // Handle image navigation in the gallery
  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? gallery.length - 1 : prevIndex - 1
    );
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === gallery.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Toggle favorite state
  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // You can also handle favorite logic here, like updating a backend
  };

  // Handle card click to navigate to RoomDetails
  const handleCardClick = () => {
    navigate(`/rooms/${roomType}`, { state: { room } });
  };

  return (
    <div
      className="w-full bg-white shadow-lg rounded-lg overflow-hidden flex flex-col md:flex-row hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter') handleCardClick();
      }}
      aria-label={`View details for ${roomName}`}
    >
      {/* Image Gallery */}
      <div className="relative md:w-1/3 w-full h-56 md:h-auto">
        <img
          src={import.meta.env.VITE_CLOUDINARY_CLOUD + gallery[currentImageIndex]}
          alt={`${roomName} Image ${currentImageIndex + 1}`}
          className="w-full h-56 md:h-full object-cover"
          loading="lazy"
        />
        {/* Navigation Buttons */}
        {gallery.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute top-1/2 left-3 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
              aria-label="Previous Image"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={nextImage}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
              aria-label="Next Image"
            >
              <FaChevronRight />
            </button>
          </>
        )}
        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          className="absolute top-3 right-3 bg-white bg-opacity-75 text-red-500 p-2 rounded-full hover:bg-opacity-100 transition"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? (
            <FaHeart className="text-red-600 transition-colors duration-200" />
          ) : (
            <FaRegHeart className="text-gray-400 transition-colors duration-200" />
          )}
        </button>
      </div>

      {/* Room Details */}
      <div className="p-4 flex flex-col flex-grow md:w-2/3">
        {/* Room Name and Price */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">
            {roomName}
          </h3>
          <div className="flex flex-col items-start sm:items-end mt-2 sm:mt-0">
            {/* Fake inflated price */}
            <span className="text-xs sm:text-sm line-through text-gray-400 mb-1">
              ₹{Math.round(price * 1.4)}
            </span>
            {/* Real price and offer */}
            <span className="text-lg sm:text-xl font-bold text-indigo-600">
              ₹{price}
              <span className="ml-2 px-2 py-0.5 rounded bg-yellow-200 text-yellow-800 text-xs font-semibold align-middle">Limited Time Offer</span>
            </span>
            <span className="text-xs sm:text-sm font-medium text-gray-500">per night</span>
            {/* You Save */}
            <span className="text-xs sm:text-sm font-semibold text-green-600 mt-1">
              Save ₹{Math.round(price * 1.4) - price} Now !
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-3">
          {description}
        </p>

        {/* Amenities */}
        <div className="mb-4">
          <h4 className="text-md sm:text-lg font-semibold mb-2">
            Amenities:
          </h4>
          <div className="flex flex-wrap gap-2">
            {amenities.map((amenity, index) => (
              <span
                key={index}
                className="flex items-center text-gray-700 text-sm bg-gray-100 px-2 py-1 rounded-full"
              >
                <span className="text-base mr-1">{amenity.icon}</span>
                {amenity.name}
              </span>
            ))}
          </div>
        </div>

        {/* Capacity */}
        <div className="mb-6 flex flex-wrap items-center text-gray-600 text-sm">
          {/* Maximum Guests */}
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg shadow-sm mr-4 mb-3">
            <FaUserFriends className="text-blue-500" />
            <span className="font-medium">
              Maximum {maxAdults} Guests
            </span>
          </div>

          {/* Rooms Available */}
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg shadow-sm mb-3">
            <FaBed className="text-purple-500" />
            <span className="font-medium">
              {availableRooms || totalRooms} Rooms Available
            </span>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-auto flex justify-end">
          <button
            className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/rooms/${roomType}`, { state: { room } });
            }}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

// PropTypes for type checking
RoomCard.propTypes = {
  room: PropTypes.shape({
    roomType: PropTypes.string.isRequired,
    roomName: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    description: PropTypes.string,
    amenities: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        icon: PropTypes.node.isRequired, // React element for icons
      })
    ).isRequired,
    maxAdults: PropTypes.number.isRequired,
    gallery: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
};

export default memo(RoomCard);

import React, { useState } from 'react';
import {
  FaChevronLeft,
  FaChevronRight,
  FaBed,
  FaUserFriends,
  FaHeart
} from 'react-icons/fa';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const RoomCard = ({ room }) => {
  const {
    id,
    name,
    price,
    description,
    amenities,
    maxAdults,
    maxChildren,
    gallery
  } = room;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false); // For favorite functionality
  const navigate = useNavigate();

  // Handle image navigation in the gallery
  const prevImage = (e) => {
    e.stopPropagation(); // Prevent triggering the card's onClick
    setCurrentImageIndex(prevIndex =>
      prevIndex === 0 ? gallery.length - 1 : prevIndex - 1
    );
  };

  const nextImage = (e) => {
    e.stopPropagation(); // Prevent triggering the card's onClick
    setCurrentImageIndex(prevIndex =>
      prevIndex === gallery.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Toggle favorite state
  const toggleFavorite = (e) => {
    e.stopPropagation(); // Prevent triggering the card's onClick
    setIsFavorite(!isFavorite);
  };

  // Handle card click to navigate to RoomDetails
  const handleCardClick = () => {
    navigate(`/rooms/${id}`, { state: { room } }); // Fixed: Used backticks
  };

  return (
    <div
      className="w-full bg-white shadow-lg rounded-lg overflow-hidden flex flex-col md:flex-row hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image Gallery */}
      <div className="relative md:w-1/3">
        <img
          src={gallery[currentImageIndex]}
          alt={`${name} Image ${currentImageIndex + 1}`} // Fixed: Used template literals
          className="w-full h-56 md:h-full object-cover transition-transform duration-500 transform hover:scale-105"
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
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <FaHeart
            className={`${isFavorite ? 'text-red-600' : 'text-gray-400'} transition-colors duration-200`}
          />
        </button>
      </div>

      {/* Room Details */}
      <div className="p-4 flex flex-col flex-grow md:w-2/3">
        {/* Room Name and Price */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">
            {name}
          </h3>
          <p className="text-lg sm:text-xl font-bold text-indigo-600 mt-2 sm:mt-0">
            ₹{price}{' '}
            <span className="text-sm sm:text-base font-medium">
              per night
            </span>
          </p>
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
                <span className="text-base mr-1">
                  {amenity.icon}
                </span>
                {amenity.name}
              </span>
            ))}
          </div>
        </div>

        {/* Capacity */}
        <div className="mb-4 flex flex-wrap items-center text-gray-700 text-sm">
          <div className="flex items-center mr-4 mb-2 sm:mb-0">
            <FaBed className="mr-1" />
            <span>{maxAdults} Adults</span>
          </div>
          <div className="flex items-center mr-4 mb-2 sm:mb-0">
            <FaUserFriends className="mr-1" />
            <span>{maxChildren} Children</span>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-auto flex justify-end">
          <button className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
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
    id: PropTypes.string.isRequired, // Ensure each room has a unique 'id'
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    description: PropTypes.string,
    amenities: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        icon: PropTypes.string // Changed to string since icons are emojis
      })
    ),
    maxAdults: PropTypes.number,
    maxChildren: PropTypes.number,
    gallery: PropTypes.arrayOf(PropTypes.string)
  }).isRequired
};

export default RoomCard;
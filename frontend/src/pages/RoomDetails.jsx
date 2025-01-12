// src/components/RoomDetails.jsx

import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { rooms } from '../constants/Rooms';
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaBed, 
  FaUserFriends, 
  FaHeart, 
  FaPlus, 
  FaMinus,
  FaArrowLeft,
  FaCheck,
  FaExclamationTriangle,
  FaCartPlus
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Within handleAddToCart
const handleAddToCart = () => {
  if (isInvalidDateRange() || !arrivalDate || !departureDate) {
    toast.error('Please select valid arrival and departure dates before adding to cart.');
    return;
  }

  const cartItem = {
    room,
    bookingDetails: {
      arrivalDate,
      departureDate,
      adults,
      children,
      roomCount,
      totalPrice: calculateTotalPrice()
    }
  };

  addToCart(cartItem);
  // toast.success('Room added to cart!'); // Already handled in context
};

const RoomDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // State for booking
  const [arrivalDate, setArrivalDate] = useState(null);
  const [departureDate, setDepartureDate] = useState(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [roomCount, setRoomCount] = useState(1);

  // Access cart context
  const { addToCart } = useCart();

  // Option 1: Use location.state if navigated from RoomCard
  const roomFromState = location.state?.room;

  // Option 2: Find the room by id if accessed directly
  const room = roomFromState || rooms.find((r) => r.id === id);

  if (!room) {
    return <div className="container mx-auto px-4 py-24 text-center text-red-500">Room not found.</div>;
  }

  const {
    name,
    price,
    description,
    amenities,
    maxAdults,
    maxChildren,
    gallery,
    totalRooms
  } = room;

  // Image navigation handlers
  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? gallery.length - 1 : prevIndex - 1
    );
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === gallery.length - 1 ? 0 : prevIndex + 1
    );
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  // Handlers for booking
  const handleOccupancyChange = (type, value) => {
    if (type === 'adults') {
      setAdults(value);
    } else if (type === 'children') {
      setChildren(value);
    }
  };

  const handleRoomCountChange = (value) => {
    setRoomCount(value);
  };

  const isInvalidDateRange = () => {
    return arrivalDate && departureDate && arrivalDate >= departureDate;
  };

  const calculateTotalPrice = () => {
    if (!arrivalDate || !departureDate) return 0;
    const timeDiff = departureDate.getTime() - arrivalDate.getTime();
    const dayCount = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return dayCount * price * roomCount;
  };

  const handleBookNow = () => {
    // Implement booking logic here
    console.log('Booking Confirmed');
    // Navigate to a confirmation page or show a modal
    navigate('/booking-confirmation', { state: { room, bookingDetails: { arrivalDate, departureDate, adults, children, roomCount, totalPrice: calculateTotalPrice() } } });
  };

  // Handler for adding to cart
  const handleAddToCart = () => {
    if (isInvalidDateRange() || !arrivalDate || !departureDate) {
      alert('Please select valid arrival and departure dates before adding to cart.');
      return;
    }

    const cartItem = {
      room,
      bookingDetails: {
        arrivalDate,
        departureDate,
        adults,
        children,
        roomCount,
        totalPrice: calculateTotalPrice()
      }
    };

    addToCart(cartItem);
    alert('Room added to cart!');
  };

  return (
    <div className="container mx-auto px-4 py-12 lg:py-24">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 focus:outline-none"
      >
        <FaChevronLeft className="mr-2" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="relative">
          <div className="aspect-w-4 aspect-h-3">
            <img
              src={gallery[currentImageIndex]}
              alt={`${name} Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover rounded-lg shadow-lg transition-transform duration-500 transform hover:scale-105"
              loading="lazy"
            />
          </div>
          {gallery.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition"
                aria-label="Previous Image"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={nextImage}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition"
                aria-label="Next Image"
              >
                <FaChevronRight />
              </button>
            </>
          )}
          {/* Image Indicators */}
          {gallery.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
              {gallery.map((_, index) => (
                <span
                  key={index}
                  className={`w-3 h-3 rounded-full cursor-pointer ${
                    index === currentImageIndex ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                  aria-label={`Go to image ${index + 1}`}
                ></span>
              ))}
            </div>
          )}
          {/* Favorite Button */}
          <button
            onClick={toggleFavorite}
            className="absolute top-4 right-4 bg-white bg-opacity-75 text-red-500 p-3 rounded-full hover:bg-opacity-100 transition"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <FaHeart
              className={`${isFavorite ? 'text-red-600' : 'text-gray-400'} transition-colors duration-200`}
            />
          </button>
        </div>

        {/* Room Details and Booking */}
        <div className="flex flex-col">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-800">{name}</h1>
          <p className="text-xl lg:text-2xl font-semibold text-indigo-600 mb-6">₹{price.toLocaleString()} per night</p>
          <p className="text-gray-700 mb-6">{description}</p>

          {/* Room Availability */}
          <div className="mb-6">
            <h2 className="text-xl lg:text-2xl font-semibold mb-3 text-gray-800">Room Availability</h2>
            <p className="mb-3 text-gray-700">Total rooms available: <span className="font-medium">{totalRooms}</span></p>
            <div className="flex items-center space-x-4">
              <label className="font-medium text-gray-700" htmlFor="roomCount">Number of rooms:</label>
              <div className="flex items-center">
                <button
                  onClick={() => handleRoomCountChange(Math.max(1, roomCount - 1))}
                  className="bg-gray-200 p-2 rounded-l hover:bg-gray-300 transition duration-300 focus:outline-none"
                  aria-label="Decrease room count"
                >
                  <FaMinus />
                </button>
                <input
                  type="number"
                  id="roomCount"
                  value={roomCount}
                  onChange={(e) => handleRoomCountChange(Math.min(Math.max(1, parseInt(e.target.value) || 1), totalRooms))}
                  min="1"
                  max={totalRooms}
                  className="w-16 text-center border-t border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Room count"
                />
                <button
                  onClick={() => handleRoomCountChange(Math.min(roomCount + 1, totalRooms))}
                  className="bg-gray-200 p-2 rounded-r hover:bg-gray-300 transition duration-300 focus:outline-none"
                  aria-label="Increase room count"
                >
                  <FaPlus />
                </button>
              </div>
            </div>
          </div>

          {/* Select Dates */}
          <div className="mb-6">
            <h2 className="text-xl lg:text-2xl font-semibold mb-3 text-gray-800">Select Dates</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="arrivalDate">Arrival Date</label>
                <DatePicker
                  selected={arrivalDate}
                  onChange={(date) => setArrivalDate(date)}
                  selectsStart
                  startDate={arrivalDate}
                  endDate={departureDate}
                  minDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  id="arrivalDate"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="departureDate">Departure Date</label>
                <DatePicker
                  selected={departureDate}
                  onChange={(date) => setDepartureDate(date)}
                  selectsEnd
                  startDate={arrivalDate}
                  endDate={departureDate}
                  minDate={arrivalDate ? new Date(arrivalDate.getTime() + 24 * 60 * 60 * 1000) : new Date()}
                  dateFormat="dd/MM/yyyy"
                  id="departureDate"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            {isInvalidDateRange() && (
              <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
                <FaExclamationTriangle className="mr-2" />
                <span>Departure date must be after arrival date.</span>
              </div>
            )}
          </div>

          {/* Occupancy Controls */}
          <div className="mb-6">
            <h2 className="text-xl lg:text-2xl font-semibold mb-3 text-gray-800">Number of Guests</h2>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Adults */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="adults">Adults (Max: {maxAdults})</label>
                <div className="flex items-center">
                  <button
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    className="bg-gray-200 p-2 rounded-l hover:bg-gray-300 transition duration-300 focus:outline-none"
                    aria-label="Decrease adults"
                  >
                    <FaMinus />
                  </button>
                  <input
                    type="number"
                    id="adults"
                    value={adults}
                    onChange={(e) => setAdults(Math.min(Math.max(1, parseInt(e.target.value) || 1), maxAdults))}
                    min="1"
                    max={maxAdults}
                    className="w-16 text-center border-t border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="Number of adults"
                  />
                  <button
                    onClick={() => setAdults(Math.min(adults + 1, maxAdults))}
                    className="bg-gray-200 p-2 rounded-r hover:bg-gray-300 transition duration-300 focus:outline-none"
                    aria-label="Increase adults"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
              {/* Children */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="children">Children (Max: {maxChildren})</label>
                <div className="flex items-center">
                  <button
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    className="bg-gray-200 p-2 rounded-l hover:bg-gray-300 transition duration-300 focus:outline-none"
                    aria-label="Decrease children"
                  >
                    <FaMinus />
                  </button>
                  <input
                    type="number"
                    id="children"
                    value={children}
                    onChange={(e) => setChildren(Math.min(Math.max(0, parseInt(e.target.value) || 0), maxChildren))}
                    min="0"
                    max={maxChildren}
                    className="w-16 text-center border-t border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="Number of children"
                  />
                  <button
                    onClick={() => setChildren(Math.min(children + 1, maxChildren))}
                    className="bg-gray-200 p-2 rounded-r hover:bg-gray-300 transition duration-300 focus:outline-none"
                    aria-label="Increase children"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Total Price */}
          <div className="mb-6">
            <h2 className="text-xl lg:text-2xl font-semibold mb-2 text-gray-800">Total Price</h2>
            <p className="text-xl font-bold text-indigo-600">
              ₹{calculateTotalPrice().toLocaleString()} 
              <span className="text-gray-600"> for {roomCount} room{roomCount > 1 ? 's' : ''}</span>
            </p>
          </div>

          {/* Booking and Add to Cart Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Book Now Button */}
            <button
              onClick={handleBookNow}
              className={`w-full sm:w-1/2 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-200 ${
                isInvalidDateRange() || !arrivalDate || !departureDate
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              disabled={isInvalidDateRange() || !arrivalDate || !departureDate}
            >
              Book Now
            </button>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className={`w-full sm:w-1/2 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-200`}
              disabled={isInvalidDateRange() || !arrivalDate || !departureDate}
              aria-label="Add to Cart"
            >
              <div className="flex items-center justify-center">
                <FaCartPlus className="mr-2" />
                Add to Cart
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="mt-12">
        <h2 className="text-2xl lg:text-3xl font-semibold mb-6 text-gray-800">Amenities</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {amenities.map((amenity, index) => (
            <span
              key={index}
              className="flex items-center text-gray-700 text-sm bg-gray-100 px-4 py-2 rounded-full shadow-sm"
            >
              {amenity.icon && (
                <span className="text-base mr-2">
                  {amenity.icon}
                </span>
              )}
              {amenity.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
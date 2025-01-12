// src/components/RoomDetails.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { rooms } from '../constants/Rooms';
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaBed, 
  FaHeart, 
  FaPlus, 
  FaMinus,
  FaExclamationTriangle,
  FaCartPlus
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Swiper React components and required modules
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const RoomDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [isFavorite, setIsFavorite] = useState(false);
  
  // State for booking
  const [arrivalDate, setArrivalDate] = useState(null);
  const [departureDate, setDepartureDate] = useState(null);
  const [guests, setGuests] = useState(1); // Unified guests state
  const [roomCount, setRoomCount] = useState(1);

  // Access cart context
  const { addToCart } = useCart();

  // Option 1: Use location.state if navigated from RoomCard
  const roomFromState = location.state?.room;

  // Option 2: Find the room by id if accessed directly
  const room = roomFromState || rooms.find((r) => r.id === id);

  if (!room) {
    return (
      <div className="container mx-auto px-4 py-24 text-center text-red-500">
        <FaExclamationTriangle className="mx-auto mb-4 text-4xl" />
        <p>Room not found.</p>
      </div>
    );
  }

  const {
    name,
    price,
    description,
    amenities,
    maxGuests,
    gallery,
    totalRooms
  } = room;

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Optionally, handle favorite logic (e.g., update backend)
  };

  // Handlers for booking
  const handleGuestsChange = (value) => {
    setGuests(value);
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
    if (isInvalidDateRange() || !arrivalDate || !departureDate) {
      toast.error('Please select valid arrival and departure dates before booking.');
      return;
    }

    // Implement booking logic here (e.g., backend API call)
    // For now, navigate to a confirmation page
    navigate('/booking-confirmation', { 
      state: { 
        room, 
        bookingDetails: { 
          arrivalDate, 
          departureDate, 
          guests, 
          roomCount, 
          totalPrice: calculateTotalPrice() 
        } 
      } 
    });

    toast.success('Booking confirmed!');
  };

  // Handler for adding to cart
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
        guests,
        roomCount,
        totalPrice: calculateTotalPrice()
      }
    };

    addToCart(cartItem);
    toast.success('Room added to cart!');
  };

  // Ensure that guests do not exceed maxGuests per room
  useEffect(() => {
    if (guests > maxGuests * roomCount) {
      setGuests(maxGuests * roomCount);
    }
  }, [guests, maxGuests, roomCount]);

  // Define Swiper settings
  const swiperSettings = {
    modules: [Autoplay, Navigation, Pagination, EffectFade],
    autoplay: {
      delay: 5000, // 5 seconds
      disableOnInteraction: false,
    },
    navigation: true,
    pagination: { clickable: true },
    effect: 'fade', // Change to 'slide', 'cube', etc., for different effects
    loop: true,
    speed: 1000, // Transition speed in ms
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
        {/* Image Gallery with Swiper */}
        <div className="relative">
          {/* Wrapping Swiper to maintain 4:3 aspect ratio */}
          <div className="w-full aspect-w-4 aspect-h-3 relative">
            <Swiper {...swiperSettings}>
              {gallery.map((image, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={image}
                    alt={`${name} Image ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                    loading="lazy"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

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
        </div>

        {/* Room Details and Booking */}
        <div className="flex flex-col">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-800">{name}</h1>
          <p className="text-xl lg:text-2xl font-semibold text-indigo-600 mb-6">
            ₹{price.toLocaleString()} per night
          </p>
          <p className="text-gray-700 mb-6">{description}</p>

          {/* Room Availability */}
          <div className="mb-6">
            <h2 className="text-xl lg:text-2xl font-semibold mb-3 text-gray-800">Room Availability</h2>
            <p className="mb-3 text-gray-700">
              Total rooms available: <span className="font-medium">{totalRooms}</span>
            </p>
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
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    handleRoomCountChange(Math.min(Math.max(1, value), totalRooms));
                  }}
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

          {/* Room Availability */}
          <div className="mb-6">

            
          <div className="mb-6">
          <label
            htmlFor="quantity-input"
            className="font-medium text-gray-700"
          >
            Rooms:
          </label>
          <div className="relative flex items-center max-w-[8rem]">
            <button
              type="button"
              onClick={() => handleRoomCountChange(roomCount - 1)}
              disabled={roomCount <= 1} // Disable if room count is already 1
              className="mt-2 bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none"
            >
              <svg
                className="w-3 h-3 text-gray-900 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 18 2"
              >
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h16" />
              </svg>
            </button>
            <input
              type="number"
              id="quantity-input"
              value={roomCount}
              readOnly
              className="mt-2 bg-gray-50 border-x-0 border-gray-300 h-11 text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full py-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => handleRoomCountChange(roomCount + 1)}
              disabled={roomCount >= totalRooms} // Disable if room count exceeds total available
              className="mt-2 bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none"
            >
              <svg
                className="w-3 h-3 text-gray-900 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 18 18"
              >
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16m8-8H1" />
              </svg>
            </button>
          </div>
        </div>
          </div>
          {/* Occupancy Controls */}
          <div className="mb-6">
          <label className="font-medium text-gray-700">Number of Guests: </label>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="guests">
                  Guests (Max: {maxGuests * roomCount})
                </label>
                <div className="flex items-center">
                  <button
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="bg-gray-200 p-2 rounded-l hover:bg-gray-300 transition duration-300 focus:outline-none"
                    aria-label="Decrease guests"
                  >
                    <FaMinus />
                  </button>
                  <input
                    type="number"
                    id="guests"
                    value={guests}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setGuests(Math.min(Math.max(1, value), maxGuests * roomCount));
                    }}
                    min="1"
                    max={maxGuests * roomCount}
                    className="w-16 text-center border-t border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="Number of guests"
                  />
                  <button
                    onClick={() => setGuests(Math.min(guests + 1, maxGuests * roomCount))}
                    className="bg-gray-200 p-2 rounded-r hover:bg-gray-300 transition duration-300 focus:outline-none"
                    aria-label="Increase guests"
                  >
                    <FaPlus />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Maximum {maxGuests} guests per room.
                </p>
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
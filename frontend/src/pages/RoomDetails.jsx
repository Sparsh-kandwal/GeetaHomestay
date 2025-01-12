// src/components/RoomDetails.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
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
import { useDateContext } from '../contexts/DateContext';


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
    const [rooms, setRooms] = useState([]);
  

  let { checkInDate, setCheckInDate, checkOutDate, setCheckOutDate } = useDateContext();
  
  
  const [minCheckOutDate, setMinCheckOutDate] = useState('');

  useEffect(() => {
      // Fetch rooms from sessionStorage
      const rooms = sessionStorage.getItem('rooms');
      if (rooms) {
        setRooms(JSON.parse(rooms));
      }
    }, []);

  // Set the minimum date for check-in and check-out dynamically
  useEffect(() => {
    if (!checkInDate) {
      const today = new Date().toISOString().split('T')[0];
      setCheckInDate(today);
      setMinCheckOutDate(today);
    }
  }, [checkInDate, setCheckInDate]);

  // Update the minimum check-out date when the check-in date changes
  useEffect(() => {
    if (checkInDate) {
      const nextDay = new Date(checkInDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setMinCheckOutDate(nextDay.toISOString().split('T')[0]);
    }
  }, [checkInDate]);
  
  // State for booking
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
    return checkInDate && checkOutDate && checkInDate >= checkOutDate;
  };

  const calculateTotalPrice = () => {
    if (!checkInDate || !checkOutDate) return 0;
    checkInDate = new Date(checkInDate)
    checkOutDate = new Date(checkOutDate)

    const timeDiff = checkOutDate - checkInDate;
    const dayCount = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return dayCount * price * roomCount;
  };

  const handleBookNow = () => {
    if (isInvalidDateRange() || !checkInDate || !checkOutDate) {
      toast.error('Please select valid check-in and check-out dates before booking.');
      return;
    }

    // Implement booking logic here (e.g., backend API call)
    // For now, navigate to a confirmation page
    navigate('/booking-confirmation', { 
      state: { 
        room, 
        bookingDetails: { 
          checkInDate, 
          checkOutDate, 
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
    if (isInvalidDateRange() || !checkInDate || !checkOutDate) {
      toast.error('Please select valid check-in and check-out dates before adding to cart.');
      return;
    }

    const cartItem = {
      room,
      bookingDetails: {
        checkInDate,
        checkOutDate,
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
                    src={import.meta.env.VITE_CLOUDINARY_CLOUD+image}
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
          <p className="text-sm text-gray-600 mt-1">
                  ({maxGuests} guests per room)
                </p>
          <p className="text-gray-700 mb-6">{description}</p>

          {/* Room Availability */}
          {/* Select Dates */}
          <div className="mb-6">
            {/* <h2 className="text-xl lg:text-2xl font-semibold mb-3 text-gray-800">Select Dates</h2> */}
            <div className="relative flex items-center md:flex-row gap-10">
            <div className="flex flex-col w-full md:w-auto">
              <label className="text-gray-700 text-sm mb-1">Check-in</label>
              <input
                type="date"
                value={checkInDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
            <div className="flex flex-col w-full md:w-auto">
              <label className="text-gray-700 text-sm mb-1">Check-out</label>
              <input
                type="date"
                value={checkOutDate}
                min={minCheckOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
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
          <div className='relative flex items-center md:flex-row gap-10'>

            {/* Room Availability */}
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
                  className="mt-2 bg-indigo-600 hover:bg-indigo-700 border border-indigo-600 rounded-s-lg p-3 h-11"
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
                  className="mt-2 text-indigo-600 h-11 text-center block w-full py-2.5"
                />
                <button
                  type="button"
                  onClick={() => handleRoomCountChange(roomCount + 1)}
                  disabled={roomCount >= totalRooms} // Disable if room count exceeds total available
                  className="mt-2 bg-gray-100 bg-indigo-600 hover:bg-indigo-700 border border-indigo-600 rounded-e-lg p-3 h-11"
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
            {/* Occupancy Controls */}
            <div className="mb-6">
              <div className='flex items-center'>
              <label className="font-medium text-gray-700">Guests </label>
              <label className="block text-sm font-medium text-gray-700" htmlFor="guest-input">
                      (Max: {maxGuests * roomCount})
                    </label>
                    :
              </div>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="relative flex items-center max-w-[8rem]">
                    <button
                    type="button"
                    onClick={() => setGuests(guests - 1)}
                    disabled={guests <= 1} // Disable if room count is already 1
                    className="mt-2 bg-gray-100 bg-indigo-600 hover:bg-indigo-700 border border-indigo-600 rounded-s-lg p-3 h-11"
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
                      id="guest-input"
                      min="1"
                      max={maxGuests * roomCount}
                      value={guests}
                      readOnly
                      className="mt-2 text-indigo-600 h-11 text-center block w-full py-2.5"
                    />
                    <button
                      type="button"
                      onClick={() => setGuests(guests + 1)}
                      disabled={guests >= maxGuests * roomCount} // Disable if room count exceeds total available
                      className="mt-2 bg-gray-100 bg-indigo-600 hover:bg-indigo-700 border border-indigo-600 rounded-e-lg p-3 h-11"
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
                isInvalidDateRange() || !checkInDate || !checkOutDate
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              disabled={isInvalidDateRange() || !checkInDate || !checkOutDate}
            >
              Book Now
            </button>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className={`w-full sm:w-1/2 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-200`}
              disabled={isInvalidDateRange() || !checkInDate || !checkOutDate}
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
import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaChevronLeft, 
  FaHeart, 
  FaExclamationTriangle,
  FaCartPlus,
  FaShoppingBag
} from 'react-icons/fa';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { useDateContext } from '../contexts/DateContext';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { RoomContext, UserContext } from '../auth/Userprovider';
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "../auth/api";
import OpacityLoader from '../components/OpacityLoader';
import axios from 'axios';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const { user, isLoading, setUser, setIsLoading } = useContext(UserContext);
  let { checkInDate, setCheckInDate, checkOutDate, setCheckOutDate } = useDateContext();
  const { fetchRooms, roomsLoading, rooms } = useContext(RoomContext);
  const [ room, setRoom ] = useState();
  const [load, setLoad] = useState(true);
  const [minCheckOutDate, setMinCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1); 
  const [roomCount, setRoomCount] = useState(1);
  const [roomDetails, setRoomDetails] = useState({
    roomType: null,
    roomName: null,
    price: null,
    description: null,
    amenities: null,
    maxAdults: null,
    gallery: null,
    totalRooms: null,
  });


  const responseGoogle = async (authResult) => {
    try {
        if (authResult.code) {
            const result = await googleAuth(authResult.code);
            console.log("Backend response:", result);
            if (result.data?.user) {
                setUser(result.data.user);
            } else {
                console.error("User data missing in backend response");
                alert("Error while processing login.");
            }
        } else {
            console.error("No authorization code in auth result:", authResult);
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
    if (!rooms) {
      fetchRooms();
    }
  }, [fetchRooms]);

  useEffect(() => {
    setRoom(rooms.find((r) => r.roomType === id));
  }, [rooms, fetchRooms, roomsLoading]);

  useEffect(() => {
    if (room) {
      setLoad(false);
      setRoomDetails({
        roomType: room.roomType || null,
        roomName: room.roomName || null,
        price: room.price || null,
        description: room.description || null,
        amenities: room.amenities || null,
        maxAdults: room.maxAdults || null,
        gallery: room.gallery || null,
        totalRooms: room.totalRooms || null,
      });
    }
  }, [room]);





  useEffect(() => {
    if (!checkInDate) {
      const today = new Date().toISOString().split('T')[0];
      setCheckInDate(today);
      setMinCheckOutDate(today);
    }
  }, [checkInDate, setCheckInDate]);

  useEffect(() => {
    if (checkInDate) {
      const nextDay = new Date(checkInDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setMinCheckOutDate(nextDay.toISOString().split('T')[0]);
    }
  }, [checkInDate]);
  
  const isInvalidDateRange = () => {
    return checkInDate && checkOutDate && checkInDate >= checkOutDate;
  };


  useEffect(() => {
    if (guests > roomDetails.maxAdults * roomCount) {
      setGuests(roomDetails.maxAdults * roomCount);
    }
  }, [guests, roomDetails.maxAdults, roomCount, roomsLoading]);
  



  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleGuestsChange = (value) => {
    setGuests(value);
  };

  const handleRoomCountChange = (value) => {
    setRoomCount(value);
  };

  

  const calculateTotalPrice = () => {
    if (!checkInDate || !checkOutDate) return roomDetails.price;
    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);
    const timeDiff = endDate - startDate;
    const dayCount = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
    return dayCount * roomDetails.price * roomCount;
  };

  const handleBookNow = () => {
    if (isInvalidDateRange() || !checkInDate || !checkOutDate) {
      toast.error('Please select valid check-in and check-out dates before booking.');
      return;
    }
    toast.success('Booking confirmed!');
  };

  const handleAddToCart = async () => {
    if (isInvalidDateRange() || !checkInDate || !checkOutDate) {
      toast.error('Please select valid check-in and check-out dates before adding to cart.');
      return;
    }
    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + `/addToCart`, {
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
        toast.success('Room added to cart!');
      }
      if (response.status === 400) {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("internal server error");
    }
  };

  const handleBuyNow = async () => {
    if (isInvalidDateRange() || !checkInDate || !checkOutDate) {
      toast.error('Please select valid check-in and check-out dates before booking.');
      return;
    }

    try {
      // First check availability
      const availabilityResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/checkAvailability`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            checkIn: checkInDate,
            checkOut: checkOutDate,
          }),
        }
      );

      const availabilityData = await availabilityResponse.json();

      // Check if the requested room type is available
      if (!availabilityData.success || 
          !availabilityData.availability[roomDetails.roomType] ||
          availabilityData.availability[roomDetails.roomType].availableRooms < roomCount) {
        toast.error('Selected rooms are not available for these dates');
        return;
      }

      // Add to cart
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + `/addToCart`, {
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
        toast.success('Room added to cart!');
        // Redirect to cart page
        navigate('/cart');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Internal server error");
    }
  };

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

  if (roomsLoading || load) {
    return <div className="min-h-screen"> loading </div>
  }

  if (!room && !load) {
    return (
      <div className="container mx-auto px-4 py-24 text-center text-red-500">
        <FaExclamationTriangle className="mx-auto mb-4 text-4xl" />
        <p>Room not found.</p>
      </div>
    );
  }  






  return (
    <div className="container mx-auto px-4 py-28 lg:py-28 mt-1 lg:mt-19">
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
              
              {roomDetails.gallery && roomDetails.gallery.map((image, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={import.meta.env.VITE_CLOUDINARY_CLOUD+image}
                    alt={`${roomDetails.roomName} Image ${index + 1}`}
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
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-800">{roomDetails.roomName}</h1>
          <div className="flex flex-col items-start sm:items-end mb-6">
            {/* Fake inflated price */}
            <span className="text-xs sm:text-sm line-through text-gray-400 mb-1">
              ₹{roomDetails.price ? Math.round(roomDetails.price * 1.4) : '--'}
            </span>
            {/* Real price and offer */}
            <span className="text-xl lg:text-2xl font-bold text-indigo-600">
              ₹{roomDetails.price && roomDetails.price.toLocaleString()}
              <span className="ml-2 px-2 py-0.5 rounded bg-yellow-200 text-yellow-800 text-xs font-semibold align-middle">Limited Time Offer</span>
            </span>
            <span className="text-xs sm:text-sm font-medium text-gray-500">per night</span>
            {/* You Save */}
            {roomDetails.price && (
              <span className="text-xs sm:text-sm font-semibold text-green-600 mt-1">
                You Save ₹{Math.round(roomDetails.price * 1.4) - roomDetails.price}!
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">
                  ({roomDetails.maxAdults} guests per room)
                </p>
          <p className="text-gray-700 mb-6">{roomDetails.description}</p>

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
                  disabled={roomCount >= roomDetails.totalRooms} // Disable if room count exceeds total available
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
                      (Max: {roomDetails.maxAdults * roomCount})
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
                      max={roomDetails.maxAdults * roomCount}
                      value={guests}
                      readOnly
                      className="mt-2 text-indigo-600 h-11 text-center block w-full py-2.5"
                    />
                    <button
                      type="button"
                      onClick={() => setGuests(guests + 1)}
                      disabled={guests >= roomDetails.maxAdults * roomCount} // Disable if room count exceeds total available
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
              ₹{roomDetails.price && calculateTotalPrice().toLocaleString()} 
              <span className="text-gray-600"> for {roomCount} room{roomCount > 1 ? 's' : ''}</span>
            </p>
          </div>

          {/* Booking and Add to Cart Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Buy Now Button */}
            <button
              onClick={user ? handleBuyNow : googleLogin}
              className={`w-full sm:w-1/2 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-200 ${
                isInvalidDateRange() || !checkInDate || !checkOutDate
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              title={isInvalidDateRange() || !checkInDate || !checkOutDate 
                ? 'Please select a Checkout Date' 
                : ''}
              disabled={isInvalidDateRange() || !checkInDate || !checkOutDate}
              aria-label="Buy Now"
            >
              <div className="flex items-center justify-center">
                <FaShoppingBag className="mr-2" />
                Buy Now
              </div>
            </button>

            {/* Add to Cart Button */}
            <button
              onClick={user ? handleAddToCart : googleLogin}
              className={`w-full sm:w-1/2 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-200 ${
                isInvalidDateRange() || !checkInDate || !checkOutDate
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              title={isInvalidDateRange() || !checkInDate || !checkOutDate 
                ? 'Please select a Checkout Date' 
                : ''}
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
          {roomDetails.amenities && roomDetails.amenities.map((amenity, index) => (
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
import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useDateContext } from '../contexts/DateContext';

const SearchBar = ({setAvailableRooms}) => {
  const {
    checkInDate,
    setCheckInDate,
    checkOutDate,
    setCheckOutDate,
  } = useDateContext();

  const [minCheckOutDate, setMinCheckOutDate] = useState('');
  const [error, setError] = useState('');

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

  const handleSearch = async () => {
    if (!checkInDate || !checkOutDate) {
      alert('Please select both check-in and check-out dates.');
      return;
    }
  
    setError('');
  
    // Construct the request URL using the backend URL and query parameters
    const url = `${import.meta.env.VITE_BACKEND_URL}/checkAvailability`;
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkIn: checkInDate,
          checkOut: checkOutDate,
        }),
        credentials: 'include'
      });
  
      const data = await response.json();
  
      if (data.success) {
        console.log(data.availability)
        setAvailableRooms(data.availability)
      } else {
        alert('Failed to fetch room availability.');
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      alert('An error occurred while fetching room availability.');
    }
  };

  return (
    <div className="flex flex-row items-center gap-3 justify-center px-4 py-5 border border-gray-200 rounded-2xl bg-gray-50 shadow-xl w-[95%] md:w-fit mx-auto sticky bottom-5 z-40 backdrop-blur-md"
      style={{ fontFamily: 'Merriweather Sans, ui-sans-serif, system-ui' }}>
      {/* Check-in Date */}
      <div className="flex flex-col w-[40%] md:w-full">
        <label className="text-gray-700 text-xs md:text-sm mb-1 font-semibold tracking-wide">Check-in</label>
        <input
          type="date"
          value={checkInDate}
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => setCheckInDate(e.target.value)}
          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition placeholder-gray-400 text-base md:text-lg hover:border-indigo-300"
        />
      </div>

      {/* Check-out Date */}
      <div className="flex flex-col w-[40%] md:w-full">
        <label className="text-gray-700 text-xs md:text-sm mb-1 font-semibold tracking-wide">Check-out</label>
        <input
          type="date"
          value={checkOutDate}
          min={minCheckOutDate}
          onChange={(e) => setCheckOutDate(e.target.value)}
          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition placeholder-gray-400 text-base md:text-lg hover:border-indigo-300"
        />
      </div>

      {/* Search Button */}
      <div className="flex flex-col w-[20%] md:w-auto items-center justify-end mt-5 md:mt-0">
        <label className="text-gray-700 text-xs md:text-sm mb-1 font-semibold tracking-wide invisible md:visible">Search</label>
        <button
          onClick={handleSearch}
          className="w-12 h-12 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-lg flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
          aria-label="Search"
        >
          <FaSearch size={22} />
        </button>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default SearchBar;

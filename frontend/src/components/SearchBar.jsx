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
      setError('Please select both check-in and check-out dates.');
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
      });
  
      const data = await response.json();
  
      if (data.success) {
        setAvailableRooms(data.availability)
      } else {
        setError('Failed to fetch room availability.');
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      setError('An error occurred while fetching room availability.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center mt-5 gap-3 justify-center p-4 border border-gray-300 rounded-lg bg-white shadow-md w-fit mx-auto sticky bottom-5">
      {/* Check-in Date */}
      <div className="flex flex-col w-full lg:w-[200px]">
        <label className="text-gray-700 text-sm mb-1">Check-in</label>
        <input
          type="date"
          value={checkInDate}
          min={new Date().toISOString().split('T')[0]} // Ensure today or future date
          onChange={(e) => setCheckInDate(e.target.value)}
          className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>

      {/* Check-out Date */}
      <div className="flex flex-col w-full lg:w-[200px]">
        <label className="text-gray-700 text-sm mb-1">Check-out</label>
        <input
          type="date"
          value={checkOutDate}
          min={minCheckOutDate} // Ensure day after check-in
          onChange={(e) => setCheckOutDate(e.target.value)}
          className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>

      <div className="flex flex-col w-[50px]">
        <label className="text-gray-700 text-sm mb-1">Search</label>
        <button
          onClick={handleSearch}
          className="w-12 h-12 bg-blue-500 text-white rounded-full hover:bg-blue-600 flex items-center justify-center transition"
          aria-label="Search"
        >
          <FaSearch size={20} />
        </button>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default SearchBar;

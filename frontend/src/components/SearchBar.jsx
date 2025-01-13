import React, { useEffect, useState } from 'react';
import { useDateContext } from '../contexts/DateContext';
import { FaCalendarAlt, FaSearch } from 'react-icons/fa';

const SearchBar = () => {
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

  const handleSearch = () => {
    if (!checkInDate || !checkOutDate) {
      setError('Please select both check-in and check-out dates.');
      return;
    }

    setError('');
    alert(`Searching for:
    Check-in: ${checkInDate}
    Check-out: ${checkOutDate}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 bg-gray-100 rounded-full shadow-md flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
      {/* Check-in Date */}
      <div className="relative flex-1 w-full">
        <label htmlFor="checkIn" className="block text-gray-800 font-bold text-sm md:text-base mb-1">
          Check-in
        </label>
        <FaCalendarAlt className="absolute top-10 left-3 text-gray-500 text-lg md:text-xl" />
        <input
          id="checkIn"
          type="date"
          value={checkInDate}
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => setCheckInDate(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-transparent rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition duration-200 bg-white text-gray-800"
        />
      </div>

      {/* Check-out Date */}
      <div className="relative flex-1 w-full">
        <label htmlFor="checkOut" className="block text-gray-800 font-bold text-sm md:text-base mb-1">
          Check-out
        </label>
        <FaCalendarAlt className="absolute top-10 left-3 text-gray-500 text-lg md:text-xl" />
        <input
          id="checkOut"
          type="date"
          value={checkOutDate}
          min={minCheckOutDate}
          onChange={(e) => setCheckOutDate(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-transparent rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition duration-200 bg-white text-gray-800"
        />
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-yellow-500 text-white rounded-full shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition duration-200"
      >
        <FaSearch className="text-sm md:text-base" />
      </button>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mt-2 md:mt-0">
          {error}
        </p>
      )}
    </div>
  );
};

export default SearchBar;
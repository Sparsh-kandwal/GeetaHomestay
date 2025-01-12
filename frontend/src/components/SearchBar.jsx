import React, { useEffect, useState } from 'react';
import { useDateContext } from '../contexts/DateContext';

const SearchBar = () => {
  const {
    checkInDate,
    setCheckInDate,
    checkOutDate,
    setCheckOutDate,
  } = useDateContext();

  const [minCheckOutDate, setMinCheckOutDate] = useState('');

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

  const handleSearch = () => {
    if (!checkInDate || !checkOutDate) {
      alert('Please select valid dates.');
      return;
    }

    alert(`Searching for:
    Check-in: ${checkInDate}
    Check-out: ${checkOutDate}`);
  };

  return (
    <div className="flex flex-col md:flex-row items-center p-4 border border-gray-300 rounded-lg bg-white shadow-md space-y-4 md:space-y-0 md:space-x-4 font-sans">
      {/* Check-in Date */}
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

      {/* Check-out Date */}
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

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="w-full md:w-auto px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;

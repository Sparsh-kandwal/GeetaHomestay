import React, { useState } from 'react';

const SearchBar = () => {
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1);

  const handleSearch = () => {
    alert(`Searching for:
    Check-in: ${checkInDate}
    Check-out: ${checkOutDate}
    `)
  };

  return (
    <div className="flex items-center p-4 border border-gray-300 rounded-lg bg-white shadow-md space-x-4 font-sans">
      <div className="flex flex-col">
        <label className="text-gray-700 text-sm mb-1">Check-in</label>
        <input
          type="date"
          value={checkInDate}
          onChange={(e) => setCheckInDate(e.target.value)}
          className="px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-gray-700 text-sm mb-1">Check-out</label>
        <input
          type="date"
          value={checkOutDate}
          onChange={(e) => setCheckOutDate(e.target.value)}
          className="px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>
     
      <button
        onClick={handleSearch}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;

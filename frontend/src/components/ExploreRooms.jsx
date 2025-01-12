// src/components/ExploreRooms.jsx

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RoomCard from './RoomCard';
import { rooms } from '../constants/Rooms';// Adjusted import path based on your data file

const ExploreRooms = () => {
  // States for filter inputs
  const [searchTermInput, setSearchTermInput] = useState('');
  const [selectedAmenitiesInput, setSelectedAmenitiesInput] = useState([]);
  const [maxPriceInput, setMaxPriceInput] = useState(4000); // Only max price
  const [guestCountInput, setGuestCountInput] = useState('');

  // Fixed amenities options aligned with data
  const amenitiesOptions = ['Air Conditioning', 'Non-AC'];

  // Handle amenity selection (input state)
  const handleAmenityChangeInput = (amenity) => {
    setSelectedAmenitiesInput((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  // Handle Reset button click
  const handleReset = () => {
    // Reset input states
    setSearchTermInput('');
    setSelectedAmenitiesInput([]);
    setMaxPriceInput(4000);
    setGuestCountInput('');
  };

  // Filtering logic using useMemo for performance optimization
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // 1. Match room name if searchTerm is provided
      const matchesName = searchTermInput
        ? room.name.toLowerCase().includes(searchTermInput.toLowerCase())
        : true;

      // 2. Match selected amenities if any are selected
      let matchesAmenities = true;
      if (selectedAmenitiesInput.length > 0) {
        const hasAC = room.amenities.some(
          (a) => a.name.trim().toLowerCase() === 'air conditioning'
        );
        const filterAC = selectedAmenitiesInput.includes('Air Conditioning');
        const filterNonAC = selectedAmenitiesInput.includes('Non-AC');

        if (filterAC && filterNonAC) {
          matchesAmenities = true; // Both filters selected, include all rooms
        } else if (filterAC) {
          matchesAmenities = hasAC;
        } else if (filterNonAC) {
          matchesAmenities = !hasAC;
        }
      }

      // 3. Match price range (only max price)
      const matchesPrice = room.price <= Number(maxPriceInput);

      // 4. Match guest count if specified
      const matchesGuests = guestCountInput
        ? room.maxGuests >= Number(guestCountInput)
        : true;

      return matchesName && matchesAmenities && matchesPrice && matchesGuests;
    });
  }, [searchTermInput, selectedAmenitiesInput, maxPriceInput, guestCountInput]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-semibold text-center text-gray-800 mb-10">
        Explore Our Rooms
      </h2>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Search and Filters Component */}
        <div className="w-full lg:w-1/4 p-6 bg-white shadow-md rounded-lg">
          <h3 className="text-lg font-semibold mb-6">Search & Filters</h3>

          {/* Search by Name */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by room name..."
              value={searchTermInput}
              onChange={(e) => setSearchTermInput(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filter by Amenities */}
          <div className="mb-6">
            <h4 className="text-md font-semibold mb-2">Filter by Amenities</h4>
            <div className="space-y-2">
              {amenitiesOptions.map((amenity, index) => (
                <label key={index} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedAmenitiesInput.includes(amenity)}
                    onChange={() => handleAmenityChangeInput(amenity)}
                    className="form-checkbox h-5 w-5 text-indigo-600"
                  />
                  <span className="ml-3 text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filter by Price Range (Max Price Only) */}
          <div className="mb-6">
            <h4 className="text-md font-semibold mb-3">Filter by Price (₹)</h4>
            <div className="flex flex-col space-y-4">
              <div>
                <label
                  className="block text-gray-700 text-sm mb-1"
                  htmlFor="maxPrice"
                >
                  Max Price: ₹{maxPriceInput}
                </label>
                <input
                  type="range"
                  id="maxPrice"
                  min="0"
                  max="4000" // Adjusted max based on data
                  step="100"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Filter by Guest Count */}
          <div className="mb-6">
            <h4 className="text-md font-semibold mb-3">Filter by Guest Count</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700">Total Guests</label>
                <select
                  value={guestCountInput}
                  onChange={(e) => setGuestCountInput(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Any</option>
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="5">5 Guests</option>
                  <option value="6">6 Guests</option>
                  <option value="7">7 Guests</option>
                  <option value="8">8 Guests</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="mt-4">
            <button
              onClick={handleReset}
              className="w-full bg-gray-300 text-gray-700 p-3 rounded-lg hover:bg-gray-400 transition duration-200"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Room Cards */}
        <div className="w-full xl:w-4/5 lg:w-3/4 flex flex-col gap-8">
          <AnimatePresence>
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <RoomCard room={room} />
                </motion.div>
              ))
            ) : (
              <motion.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full"
              >
                <p className="text-center text-gray-500">
                  No rooms match your search criteria.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ExploreRooms;
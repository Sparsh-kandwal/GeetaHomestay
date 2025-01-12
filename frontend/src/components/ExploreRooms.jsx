// src/components/ExploreRooms.jsx

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RoomCard from './RoomCard';
import { rooms } from '../constants/Rooms';// Adjusted import path based on your data file
import SearchFilter from './SearchFilter';

const ExploreRooms = () => {
  const [searchTermInput, setSearchTermInput] = useState('');
  const [selectedAmenitiesInput, setSelectedAmenitiesInput] = useState([]);
  const [maxPriceInput, setMaxPriceInput] = useState(4000); // Only max price
  const [guestCountInput, setGuestCountInput] = useState('');
  const amenitiesOptions = ['AC', 'Non-AC', 'Balcony', 'Coffe-Kettle'];


  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // 2. Match selected amenities if any are selected
      let matchesAmenities = true;
      if (selectedAmenitiesInput.length > 0) {
        const hasAC = room.amenities.some(
          (a) => a.name.trim().toLowerCase() === 'air conditioning'
        );
        const hasBalcony = room.amenities.some(
          (a) => a.name.trim().toLowerCase() === 'balcony' || a.name.trim().toLowerCase() === 'private balcony'
          );
        const hasCoffeKettle = room.amenities.some(
          (a) => a.name.trim().toLowerCase() === 'hot-water/coffee kettle'
          );
        if (selectedAmenitiesInput.includes('Balcony')) matchesAmenities &= hasBalcony;
        if (selectedAmenitiesInput.includes('Coffe-Kettle')) matchesAmenities &= hasCoffeKettle;
        const filterAC = selectedAmenitiesInput.includes('AC');
        const filterNonAC = selectedAmenitiesInput.includes('Non-AC');
        
        if (filterAC && filterNonAC) {
          matchesAmenities &= true; // Both filters selected, include all rooms
        } else if (filterAC) {
          matchesAmenities &= hasAC;
        } else if (filterNonAC) {
          matchesAmenities &= !hasAC;
        }
      }

      const matchesPrice = room.price <= Number(maxPriceInput);

      const matchesGuests = guestCountInput
        ? room.maxGuests >= Number(guestCountInput)
        : true;

      return matchesAmenities && matchesPrice && matchesGuests;
    });
  }, [searchTermInput, selectedAmenitiesInput, maxPriceInput, guestCountInput]);
  // States for filter inputs
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-semibold text-center text-gray-800 mb-10">
        Explore Our Rooms
      </h2>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Search and Filters Component */}
        <SearchFilter searchTermInput={searchTermInput} selectedAmenitiesInput={searchTermInput} maxPriceInput={maxPriceInput} guestCountInput={guestCountInput} amenitiesOptions={amenitiesOptions} setSearchTermInput={setSearchTermInput} setSelectedAmenitiesInput={setSelectedAmenitiesInput} setMaxPriceInput={setMaxPriceInput} setGuestCountInput={setGuestCountInput} />

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
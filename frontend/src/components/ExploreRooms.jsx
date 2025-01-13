import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RoomCard from './RoomCard';
import { rooms } from '../constants/Rooms';
import SearchFilter from './SearchFilter';
import SearchBar from './SearchBar';

const ExploreRooms = () => {
  const [searchTermInput, setSearchTermInput] = useState('');
  const [selectedAmenitiesInput, setSelectedAmenitiesInput] = useState([]);
  const [maxPriceInput, setMaxPriceInput] = useState(4000);
  const [guestCountInput, setGuestCountInput] = useState('');
  const amenitiesOptions = ['AC', 'Non-AC', 'Balcony', 'Coffe-Kettle'];
  const bedOptions = ['2 Bed', '3 Bed', '4 Bed'];

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      let matchesAmenities = true;

      if (selectedAmenitiesInput.length > 0) {
        const bed2 = room.name.trim().toLowerCase().includes('double');
        const bed3 = room.name.trim().toLowerCase().includes('triple');
        const bed4 = room.name.trim().toLowerCase().includes('four');
        const hasAC = room.amenities.some(
          (a) => a.name.trim().toLowerCase() === 'air conditioning'
        );
        const hasBalcony = room.amenities.some(
          (a) => a.name.trim().toLowerCase() === 'balcony' || a.name.trim().toLowerCase() === 'private balcony'
        );
        const hasCoffeeKettle = room.amenities.some(
        );
        const hasCoffeKettle = room.amenities.some(
          (a) => a.name.trim().toLowerCase() === 'hot-water/coffee kettle'
        );
        );
  
        if (selectedAmenitiesInput.includes('Balcony')) matchesAmenities &= hasBalcony;
        if (selectedAmenitiesInput.includes('Coffee-Kettle')) matchesAmenities &= hasCoffeeKettle;
        if (selectedAmenitiesInput.includes('Coffe-Kettle')) matchesAmenities &= hasCoffeKettle;
  
        const filter2bed = selectedAmenitiesInput.includes('2 Bed');
        const filter3bed = selectedAmenitiesInput.includes('3 Bed');
        const filter4bed = selectedAmenitiesInput.includes('4 Bed');
  
        // Combine filters for beds using logical OR
        if (filter2bed || filter3bed || filter4bed) {
          matchesAmenities &=
            (filter2bed && bed2) ||
            (filter3bed && bed3) ||
            (filter4bed && bed4);
        }
  
        const filterAC = selectedAmenitiesInput.includes('AC');
        const filterNonAC = selectedAmenitiesInput.includes('Non-AC');

  
        if (filterAC && filterNonAC) {
          matchesAmenities &= true;
          matchesAmenities &= true; // Include all rooms if both are selected
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
  }, [selectedAmenitiesInput, maxPriceInput, guestCountInput]);

  return (
    <div className="relative min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl sm:text-3xl font-semibold text-center text-gray-800 mb-6 sm:mb-10">
        Explore Our Rooms
      </h2>
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 pb-16 sm:pb-24">
        <SearchFilter
          searchTermInput={searchTermInput}
          selectedAmenitiesInput={selectedAmenitiesInput}
          maxPriceInput={maxPriceInput}
          guestCountInput={guestCountInput}
          amenitiesOptions={amenitiesOptions}
          setSearchTermInput={setSearchTermInput}
          setSelectedAmenitiesInput={setSelectedAmenitiesInput}
          setMaxPriceInput={setMaxPriceInput}
          setGuestCountInput={setGuestCountInput}
        />

        <div className="w-full lg:w-3/4 xl:w-4/5 flex flex-col gap-6 sm:gap-8">

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Search and Filters Component */}
        <SearchFilter bedOptions={bedOptions} searchTermInput={searchTermInput} selectedAmenitiesInput={searchTermInput} maxPriceInput={maxPriceInput} guestCountInput={guestCountInput} amenitiesOptions={amenitiesOptions} setSearchTermInput={setSearchTermInput} setSelectedAmenitiesInput={setSelectedAmenitiesInput} setMaxPriceInput={setMaxPriceInput} setGuestCountInput={setGuestCountInput} />

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

      <div className="sticky bottom-5 w-2/4 max-w-7xl mx-auto px-4">
        <SearchBar />
      </div>
    </div>
  );
};

export default ExploreRooms;
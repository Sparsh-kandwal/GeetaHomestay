import React, { useState, useMemo, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RoomCard from './RoomCard';
import SearchFilter from './SearchFilter';
import SearchBar from './SearchBar';
import { RoomContext } from '../auth/Userprovider';
import SkeletonRoom from './SkeletonRoom';

const ExploreRooms = () => {
  const [searchTermInput, setSearchTermInput] = useState('');
  const [selectedAmenitiesInput, setSelectedAmenitiesInput] = useState([]);
  const [maxPriceInput, setMaxPriceInput] = useState(4000);
  const [guestCountInput, setGuestCountInput] = useState('');
  const [availableRooms, setAvailableRooms] = useState({});
  const [roomAvailLoading, setRoomAvailLoading] = useState(true);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [rooms, setRooms] = useState([]);

  const amenitiesOptions = ['AC', 'Non-AC', 'Balcony', 'Coffe-Kettle'];
  const bedOptions = ['2 Bed', '3 Bed', '4 Bed'];

  const { fetchRooms, roomsLoading } = useContext(RoomContext);

  // Fetch initial rooms
  useEffect(() => {
    const storedRooms = sessionStorage.getItem('rooms');
    if (storedRooms) {
      setRooms(JSON.parse(storedRooms));
    } else {
      fetchRooms();
    }
  }, [fetchRooms]);

  useEffect(() => {
    if (Object.keys(availableRooms).length > 0) {
      setRooms((prevRooms) => {
        const updatedRooms = prevRooms.map((room) => {
          const availability = availableRooms[room.roomType];
          if (availability) {
            return {
              ...room,
              price: availability.price,
              totalRooms: availability.totalRooms,
              availableRooms: availability.availableRooms,
            };
          }
          return room;
        });
        // Check if the updatedRooms are the same as the previous rooms to avoid unnecessary re-renders
        if (JSON.stringify(prevRooms) !== JSON.stringify(updatedRooms)) {
          return updatedRooms;
        }
        return prevRooms;
      });
    } 
  }, [availableRooms]);
  

  // Filter rooms based on inputs
  useEffect(() => {
    const filterRooms = () => {
      return rooms.filter((room) => {
        let matchesAmenities = true;
        if (selectedAmenitiesInput.length > 0) {
          const bed2 = room.roomName.trim().toLowerCase().includes('double');
          const bed3 = room.roomName.trim().toLowerCase().includes('triple');
          const bed4 = room.roomName.trim().toLowerCase().includes('four');
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

          const filter2bed = selectedAmenitiesInput.includes('2 Bed');
          const filter3bed = selectedAmenitiesInput.includes('3 Bed');
          const filter4bed = selectedAmenitiesInput.includes('4 Bed');

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
          } else if (filterAC) {
            matchesAmenities &= hasAC;
          } else if (filterNonAC) {
            matchesAmenities &= !hasAC;
          }
        }
        const matchesPrice = room.price <= Number(maxPriceInput);
        const matchesGuests = guestCountInput
          ? room.maxAdults >= Number(guestCountInput)
          : true;
        const isAvailable = room.availableRooms > 0;

        return matchesAmenities && matchesPrice && matchesGuests && isAvailable;
      });
    };

    setFilteredRooms(filterRooms());
  }, [rooms, selectedAmenitiesInput, maxPriceInput, guestCountInput]);

  return (
    <div className="mt-12 min-h-screen w-full bg-gray-50 py-8 px-8">
      <h2 className="text-5xl font-semibold text-center text-gray-800 mb-10">
        Explore Our Rooms
      </h2>

      {/* <SearchBar setAvailableRooms= {setAvailableRooms}/> */}


      <div className="flex flex-col lg:flex-row gap-8">
        <SearchFilter
          bedOptions={bedOptions}
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

        <div className="w-full xl:w-4/5 lg:w-3/4 flex flex-col gap-8">
          <AnimatePresence>
            {roomsLoading ? (
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SkeletonRoom />
                  </motion.div>
                ))
            ) : filteredRooms.length > 0 ? (
              filteredRooms.map((room) => (
                <motion.div
                  key={room.roomType}
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
                <p className="text-center text-gray-500 min-w-screen">
                  No rooms match your search criteria.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <SearchBar setAvailableRooms={setAvailableRooms} />
    </div>
  );
};

export default ExploreRooms;

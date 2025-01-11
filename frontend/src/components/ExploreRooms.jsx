import React, { useState, useEffect } from 'react';
import SearchFilter from './SearchFilter';
import RoomList from './RoomList';
import { rooms } from '../constants/Rooms'; // Assuming constants are here
import { debounce } from 'lodash'; // For debouncing

const ExploreRooms = () => {
  const [priceRange, setPriceRange] = useState(5000);
  const [capacity, setCapacity] = useState(3);
  const [filteredRooms, setFilteredRooms] = useState(rooms);

  // Filter rooms based on search term, price range, and capacity
  const filterRooms = () => {
    const filtered = rooms.filter((room) => {
  
      // Assuming priceRange is a number and is the maximum price
      const matchesPrice =
        (priceRange === '' || room.price <= priceRange);
  
      // Assuming capacity is the total number of people
      const matchesCapacity =
        (capacity === '' || room.maxAdults >= capacity); // Assuming room has maxCapacity property
  
      return matchesPrice && matchesCapacity;
    });
  
    setFilteredRooms(filtered);
  };
  

  // Use lodash's debounce to delay the filtering logic on search term changes
  const debouncedFilter = debounce(filterRooms, 300); // 300ms debounce

  useEffect(() => {
    // Call the debounced filter whenever any search or filter value changes
    debouncedFilter();
    // Cleanup on unmount to avoid memory leaks
    return () => debouncedFilter.cancel();
  }, [ priceRange, capacity]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <h2 className="text-3xl font-semibold text-center text-gray-800 mb-10">Explore Our Rooms</h2>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/4 space-y-6">
          <SearchFilter
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            capacity={capacity}
            setCapacity={setCapacity}
          />
        </div>
        <div className="w-full lg:w-3/4">
          <RoomList rooms={filteredRooms} />
        </div>
      </div>
    </div>
  );
};

export default ExploreRooms;

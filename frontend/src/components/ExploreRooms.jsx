import React, { useState, useEffect } from 'react';
import SearchFilter from './SearchFilter';
import RoomList from './RoomList';
import { rooms } from '../constants/Rooms'; // Assuming constants are here
import { debounce } from 'lodash'; // For debouncing

const ExploreRooms = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [capacity, setCapacity] = useState({ adults: '', children: '' });
  const [filteredRooms, setFilteredRooms] = useState(rooms);

  // Filter rooms based on search term, price range, and capacity
  const filterRooms = () => {
    const filtered = rooms.filter((room) => {
      const matchesName = searchTerm
        ? room.name.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      const matchesPrice =
        (priceRange.min === '' || room.price >= Number(priceRange.min)) &&
        (priceRange.max === '' || room.price <= Number(priceRange.max));
      const matchesAdults = capacity.adults
        ? room.maxAdults >= Number(capacity.adults)
        : true;
      const matchesChildren = capacity.children
        ? room.maxChildren >= Number(capacity.children)
        : true;
      return matchesName && matchesPrice && matchesAdults && matchesChildren;
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
  }, [searchTerm, priceRange, capacity]);

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
            setSearchTerm={setSearchTerm} // Pass search term setter to the search bar
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

import React, { useState } from 'react';
import RoomCard from './RoomCard';
import { rooms } from '../constants/Rooms';
// Import a slider library. You can use 'rc-slider' or 'react-slider'.
// Here, we'll use a basic HTML range input for simplicity.

const ExploreRooms = () => {
  // States for filter inputs
  const [searchTermInput, setSearchTermInput] = useState('');
  const [priceRangeInput, setPriceRangeInput] = useState({ min: 0, max: 10000 }); // Adjust max as per your data
  const [capacityInput, setCapacityInput] = useState({ adults: '', children: '' });
  const [acInput, setAcInput] = useState(null); // null: any, true: AC, false: Non-AC

  // States for applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: '',
    priceRange: { min: 0, max: 10000 },
    capacity: { adults: '', children: '' },
    ac: null,
  });

  // Determine the global min and max price for the slider
  const prices = rooms.map(room => room.price);
  const globalMinPrice = Math.min(...prices);
  const globalMaxPrice = Math.max(...prices);

  // Handle capacity changes (input state)
  const handleCapacityChangeInput = (type, value) => {
    setCapacityInput(prev => ({
      ...prev,
      [type]: value
    }));
  };

  // Handle AC selection
  const handleAcChangeInput = (value) => {
    setAcInput(value);
  };

  // Handle Search button click
  const handleSearch = () => {
    setAppliedFilters({
      searchTerm: searchTermInput.trim(),
      priceRange: { ...priceRangeInput },
      capacity: { ...capacityInput },
      ac: acInput,
    });
  };

  // Handle Reset button click
  const handleReset = () => {
    // Reset input states
    setSearchTermInput('');
    setPriceRangeInput({ min: globalMinPrice, max: globalMaxPrice });
    setCapacityInput({ adults: '', children: '' });
    setAcInput(null);

    // Reset applied filters
    setAppliedFilters({
      searchTerm: '',
      priceRange: { min: globalMinPrice, max: globalMaxPrice },
      capacity: { adults: '', children: '' },
      ac: null,
    });
  };

  // Filter rooms based on applied filters
  const filteredRooms = rooms.filter(room => {
    const { searchTerm, priceRange, capacity, ac } = appliedFilters;

    // 1. Match room name if searchTerm is provided
    const matchesName = searchTerm
      ? room.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    // 2. Match price range
    const matchesPrice =
      room.price >= Number(priceRange.min) &&
      room.price <= Number(priceRange.max);

    // 3. Match capacity for adults if specified
    const matchesAdults = capacity.adults
      ? room.maxAdults >= Number(capacity.adults)
      : true;

    // 4. Match capacity for children if specified
    const matchesChildren = capacity.children
      ? room.maxChildren >= Number(capacity.children)
      : true;

    // 5. Match AC preference
    const matchesAc = ac !== null ? room.ac === ac : true;

    return matchesName && matchesPrice && matchesAdults && matchesChildren && matchesAc;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-semibold text-center text-gray-800 mb-10">Explore Our Rooms</h2>

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

          {/* Filter by Price Range Using Slider */}
          <div className="mb-6">
            <h4 className="text-md font-semibold mb-3">Filter by Price (₹)</h4>
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between">
                <span>Min: ₹{priceRangeInput.min}</span>
                <span>Max: ₹{priceRangeInput.max}</span>
              </div>
              {/* Min Price Slider */}
              <div>
                <input
                  type="range"
                  min={globalMinPrice}
                  max={priceRangeInput.max}
                  value={priceRangeInput.min}
                  onChange={(e) =>
                    setPriceRangeInput(prev => ({
                      ...prev,
                      min: Number(e.target.value)
                    }))
                  }
                  className="w-full"
                />
              </div>
              {/* Max Price Slider */}
              <div>
                <input
                  type="range"
                  min={priceRangeInput.min}
                  max={globalMaxPrice}
                  value={priceRangeInput.max}
                  onChange={(e) =>
                    setPriceRangeInput(prev => ({
                      ...prev,
                      max: Number(e.target.value)
                    }))
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Filter by Capacity */}
          <div className="mb-6">
            <h4 className="text-md font-semibold mb-3">Filter by Capacity</h4>
            <div className="space-y-4">
              {/* Adults */}
              <div>
                <label className="block text-gray-700">Adults</label>
                <select
                  value={capacityInput.adults}
                  onChange={(e) => handleCapacityChangeInput('adults', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Any</option>
                  <option value="1">1 Adult</option>
                  <option value="2">2 Adults</option>
                  <option value="3">3 Adults</option>
                  <option value="4">4 Adults</option>
                  <option value="5">5 Adults</option>
                </select>
              </div>

              {/* Children */}
              <div>
                <label className="block text-gray-700">Children</label>
                <select
                  value={capacityInput.children}
                  onChange={(e) => handleCapacityChangeInput('children', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Any</option>
                  <option value="0">0 Children</option>
                  <option value="1">1 Child</option>
                  <option value="2">2 Children</option>
                  <option value="3">3 Children</option>
                  <option value="4">4 Children</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filter by AC */}
          <div className="mb-6">
            <h4 className="text-md font-semibold mb-3">Filter by AC</h4>
            <div className="space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="ac"
                  value="any"
                  checked={acInput === null}
                  onChange={() => handleAcChangeInput(null)}
                  className="form-radio h-5 w-5 text-indigo-600"
                />
                <span className="ml-3 text-gray-700">Any</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="ac"
                  value="ac"
                  checked={acInput === true}
                  onChange={() => handleAcChangeInput(true)}
                  className="form-radio h-5 w-5 text-indigo-600"
                />
                <span className="ml-3 text-gray-700">AC</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="ac"
                  value="non-ac"
                  checked={acInput === false}
                  onChange={() => handleAcChangeInput(false)}
                  className="form-radio h-5 w-5 text-indigo-600"
                />
                <span className="ml-3 text-gray-700">Non-AC</span>
              </label>
            </div>
          </div>

          {/* Search and Reset Buttons */}
          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleSearch}
              className="w-1/2 bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              Search
            </button>
            <button
              onClick={handleReset}
              className="w-1/2 bg-gray-300 text-gray-700 p-3 rounded-lg hover:bg-gray-400 transition duration-200"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Room Cards */}
        <div className="w-full lg:w-3/4 flex flex-col gap-8">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))
          ) : (
            <div className="col-span-full">
              <p className="text-center text-gray-500">No rooms match your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExploreRooms;
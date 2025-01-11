
import React, { useState } from 'react';
import RoomCard from './RoomCard';
import { rooms } from '../constants/Rooms';

const ExploreRooms = () => {
  // States for filter inputs
  const [searchTermInput, setSearchTermInput] = useState('');
  const [selectedAmenitiesInput, setSelectedAmenitiesInput] = useState([]);
  const [priceRangeInput, setPriceRangeInput] = useState({ min: '', max: '' });
  const [capacityInput, setCapacityInput] = useState({ adults: '', children: '' });

  // States for applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: '',
    selectedAmenities: [],
    priceRange: { min: '', max: '' },
    capacity: { adults: '', children: '' },
  });

  // Extract unique amenities for filter options
  const allAmenities = Array.from(
    new Set(rooms.flatMap(room => room.amenities.map(amenity => amenity.name)))
  );

  // Handle amenity selection (input state)
  const handleAmenityChangeInput = (amenity) => {
    setSelectedAmenitiesInput(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  // Handle capacity changes (input state)
  const handleCapacityChangeInput = (type, value) => {
    setCapacityInput(prev => ({
      ...prev,
      [type]: value
    }));
  };

  // Handle Search button click
  const handleSearch = () => {
    setAppliedFilters({
      searchTerm: searchTermInput.trim(),
      selectedAmenities: selectedAmenitiesInput,
      priceRange: { ...priceRangeInput },
      capacity: { ...capacityInput },
    });
  };

  // Handle Reset button click
  const handleReset = () => {
    // Reset input states
    setSearchTermInput('');
    setSelectedAmenitiesInput([]);
    setPriceRangeInput({ min: '', max: '' });
    setCapacityInput({ adults: '', children: '' });

    // Reset applied filters
    setAppliedFilters({
      searchTerm: '',
      selectedAmenities: [],
      priceRange: { min: '', max: '' },
      capacity: { adults: '', children: '' },
    });
  };

  // Filter rooms based on applied filters
  const filteredRooms = rooms.filter(room => {
    const { searchTerm, selectedAmenities, priceRange, capacity } = appliedFilters;

    // 1. Match room name if searchTerm is provided
    const matchesName = searchTerm
      ? room.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    // 2. Match selected amenities if any are selected
    const matchesAmenities = selectedAmenities.length > 0
      ? selectedAmenities.every(amenity =>
          room.amenities.some(a => a.name === amenity)
        )
      : true;

    // 3. Match price range if min or max is provided
    const matchesPrice =
      (priceRange.min === '' || room.price >= Number(priceRange.min)) &&
      (priceRange.max === '' || room.price <= Number(priceRange.max));

    // 4. Match capacity for adults if specified
    const matchesAdults = capacity.adults
      ? room.maxAdults >= Number(capacity.adults)
      : true;

    // 5. Match capacity for children if specified
    const matchesChildren = capacity.children
      ? room.maxChildren >= Number(capacity.children)
      : true;

    return matchesName && matchesAmenities && matchesPrice && matchesAdults && matchesChildren;
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

          {/* Filter by Amenities */}
          <div className="mb-6">
            <h4 className="text-md font-semibold mb-2">Filter by Amenities</h4>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {allAmenities.map((amenity, index) => (
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

          {/* Filter by Price Range */}
          <div className="mb-6">
            <h4 className="text-md font-semibold mb-3">Filter by Price (₹)</h4>
            <div className="flex space-x-3">
              <input
                type="number"
                placeholder="Min"
                value={priceRangeInput.min}
                onChange={(e) => setPriceRangeInput(prev => ({ ...prev, min: e.target.value }))}
                className="w-1/2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="0"
              />
              <input
                type="number"
                placeholder="Max"
                value={priceRangeInput.max}
                onChange={(e) => setPriceRangeInput(prev => ({ ...prev, max: e.target.value }))}
                className="w-1/2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="0"
              />
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
            filteredRooms.map((room) => ( // Removed index and used room.id
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
import React from 'react';

const SearchFilter = ({
  searchTermInput,
  selectedAmenitiesInput,
  maxPriceInput,
  guestCountInput,
  amenitiesOptions,
  setSearchTermInput,
  setSelectedAmenitiesInput,
  setMaxPriceInput,
  setGuestCountInput
}) => {
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

  return (
    <div className="sticky top-20 h-fit w-full lg:w-1/4 p-6 bg-white shadow-md rounded-lg">
      <h3 className="text-lg font-semibold mb-6">Search & Filters</h3>

      {/* Filter by Amenities */}
      <div className="mb-6">
        <h4 className="text-md font-semibold mb-2">Filter by Amenities</h4>
        <div className="space-y-2">
          {amenitiesOptions.map((amenity) => (
            <label key={amenity} className="inline-flex items-center">
              <input
                type="checkbox"
                
                onChange={() => handleAmenityChangeInput(amenity)}
                className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-gray-700">{amenity}</span>
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
              min="1200"
              max="4000" // Adjusted max based on data
              step="100"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(Number(e.target.value))}
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
              onChange={(e) => setGuestCountInput(e.target.value ? Number(e.target.value) : '')}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Any</option>
              {[...Array(8)].map((_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1} {index + 1 === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
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
  );
};

export default SearchFilter;
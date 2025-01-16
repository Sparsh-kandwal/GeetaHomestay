import React, { useEffect, useState } from 'react';

const SearchFilter = ({
  bedOptions,
  maxPriceInput,
  guestCountInput,
  amenitiesOptions,
  setSearchTermInput,
  setSelectedAmenitiesInput,
  setMaxPriceInput,
  setGuestCountInput,
}) => {
  const [isFilterVisible, setIsFilterVisible] = useState(false); 


  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && !isFilterVisible) {
        setIsFilterVisible(true);
      } else if (window.innerWidth < 768 && isFilterVisible) {
        setIsFilterVisible(false);
      }
    };
  
    // Initial check
    handleResize();
  
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isFilterVisible]);
  

  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const handleAmenityChangeInput = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
    setSelectedAmenitiesInput((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleReset = () => {
    setSearchTermInput('');
    setSelectedAmenitiesInput([]);
    setMaxPriceInput(4000);
    setGuestCountInput('');
    setSelectedAmenities([]);
  };

  return (
    <div className="lg:sticky top-20 h-fit w-full lg:w-1/4 p-6 bg-white shadow-md rounded-lg">
      {/* Toggle Button for Mobile View */}
      <button
        onClick={() => setIsFilterVisible((prev) => !prev)}
        className=" mb-4 w-full text-white bg-indigo-500 p-3 rounded-lg hover:bg-indigo-600 transition duration-200"
      >
        {isFilterVisible ? 'Hide Filters' : 'Show Filters'}
      </button>

      {/* Filter Section */}
      <div className={isFilterVisible ? 'space-y-6' : 'hidden'}>
        <h3 className="text-lg font-semibold mb-6">Search & Filters</h3>

        {/* Filter by Beds */}
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-2">Filter by Beds</h4>
          <div className="space-y-2">
            {bedOptions.map((beds, index) => (
              <label key={index} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(beds)}
                  onChange={() => handleAmenityChangeInput(beds)}
                  className="h-5 w-5"
                />
                <span className="ml-1 mr-3 text-gray-700">{beds}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Filter by Amenities */}
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-2">Filter by Amenities</h4>
          <div className="space-y-2">
            {amenitiesOptions.map((amenity, index) => (
              <label key={index} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity)}
                  onChange={() => handleAmenityChangeInput(amenity)}
                  className="h-5 w-5"
                />
                <span className="ml-1 mr-3 text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Filter by Price Range */}
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
                max="4000"
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
              </select>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <div className="mt-4">
          <button
            onClick={handleReset}
            className="w-full bg-red-500 text-gray-100 p-3 rounded-lg hover:bg-red-700 transition duration-200"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};


export default SearchFilter;
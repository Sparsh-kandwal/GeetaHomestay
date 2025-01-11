import React, { useState } from 'react';
import ReactSlider from 'react-slider';

const SearchFilter = ({ priceRange, setPriceRange, capacity, setCapacity, setSearchTerm, acAvailable, setAcAvailable }) => {
  const [sliderValue, setSliderValue] = useState(priceRange.max);

  const handleSliderChange = (value) => {
    setSliderValue(value);
    setPriceRange({ min: priceRange.min, max: value });
  };

  const handleMaxPriceChange = (e) => {
    const value = Math.max(priceRange.min, Math.min(e.target.value, 5000));
    setPriceRange({ min: priceRange.min, max: value });
    setSliderValue(value);
  };

  return (
    <div className="space-y-6 bg-gray-50 p-8 rounded-lg shadow-xl max-w-lg mx-auto transition-all duration-300">
      
      {/* Search Bar */}
      <div className="mb-4">
        <label className="block text-lg font-semibold text-gray-800 mb-2">Search Rooms</label>
        <input
          type="text"
          className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 placeholder-gray-500"
          placeholder="Enter room details"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Price Range */}
      <div className="mb-4">
        <label className="block text-lg font-semibold text-gray-800 mb-2">Price Range</label>
        <div className="text-sm text-gray-600 mb-2">Adjust the price range</div>
        
        <ReactSlider
          className="w-full"
          value={sliderValue}
          onChange={handleSliderChange}
          min={0}
          max={5000}
          step={100}
          renderTrack={(props, state) => (
            <div {...props} className="h-2 bg-indigo-200 rounded-full" />
          )}
          renderThumb={(props) => (
            <div {...props} className="w-6 h-6 bg-indigo-500 rounded-full cursor-pointer" />
          )}
        />
        
        <div className="flex justify-between mt-2 text-xs text-gray-700">
          <span>${priceRange.min}</span>
          <span>${sliderValue}</span>
        </div>

        {/* Max Price Input */}
        <div className="mt-4">
          <input
            type="number"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Max Price"
            value={sliderValue}
            onChange={handleMaxPriceChange}
          />
        </div>
      </div>

      {/* Capacity */}
      <div className="mb-4">
        <label className="block text-lg font-semibold text-gray-800 mb-2">Capacity</label>
        <div className="text-sm text-gray-600 mb-2">Specify the number of guests</div>
        <div className="flex gap-4">
          <input
            type="number"
            className="w-1/2 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 placeholder-gray-500"
            placeholder="Adults"
            value={capacity.adults}
            onChange={(e) => setCapacity({ ...capacity, adults: e.target.value })}
          />
          <input
            type="number"
            className="w-1/2 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 placeholder-gray-500"
            placeholder="Children"
            value={capacity.children}
            onChange={(e) => setCapacity({ ...capacity, children: e.target.value })}
          />
        </div>
      </div>

      {/* Air Conditioner Availability */}
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">Air Conditioner</label>
        <div className="text-sm text-gray-600 mb-2">Check if you prefer rooms with air conditioning</div>
        <label className="inline-flex items-center text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            className="form-checkbox text-indigo-500 focus:ring-indigo-500"
            checked={acAvailable}
            onChange={(e) => setAcAvailable(e.target.checked)}
          />
          <span className="ml-2">Air Conditioner Available</span>
        </label>
      </div>
    </div>
  );
};

export default SearchFilter;

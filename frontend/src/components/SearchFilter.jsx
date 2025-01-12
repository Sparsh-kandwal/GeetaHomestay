import React, { useState } from 'react';
import ReactSlider from 'react-slider';

const SearchFilter = ({ priceRange, setPriceRange, capacity, setCapacity, acAvailable, setAcAvailable }) => {
  const [sliderValue, setSliderValue] = useState(priceRange);
  const [peopleCount, setPeopleCount] = useState(capacity || 1); 
  const handleSliderChange = (value) => {
    setSliderValue(value);
    setPriceRange(value);
  };


  const handlePeopleChange = (value) => {
    setPeopleCount(value);
    setCapacity(value); // Update the capacity based on peopleCount
  };

  return (
    <div className="space-y-6 bg-gray-50 p-8 rounded-lg shadow-xl max-w-lg mx-auto transition-all duration-300">
      
      {/* Search Bar */}
      <div className="mb-4">
        <label className="block text-xl font-bold text-gray-800 mb-2">Filters</label>
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
          renderTrack={(props) => (
            <div {...props} className="h-2 bg-indigo-200 rounded-full" />
          )}
          renderThumb={(props) => (
            <div {...props} className="w-6 h-6 bg-indigo-500 rounded-full cursor-pointer" />
          )}
        />
        
        <div className="flex justify-between mt-2 text-xs text-gray-700">
          <span className="text-xl mt-4 font-semibold text-indigo-600">₹{sliderValue}</span> {/* Make slider value noticeable */}
        </div>
      </div>

      {/* Number of People */}
      <div className="mb-4">
        <label className="block text-lg font-semibold text-gray-800 mb-2">Number of People</label>
        <div className="text-sm text-gray-600 mb-2">Specify the total number of people</div>
        
        <ReactSlider
          className="w-full"
          value={peopleCount}
          onChange={handlePeopleChange}
          min={1}
          max={10}  // You can adjust the max value as needed
          step={1}
          renderTrack={(props) => (
            <div {...props} className="h-2 bg-indigo-200 rounded-full" />
          )}
          renderThumb={(props) => (
            <div {...props} className="w-6 h-6 bg-indigo-500 rounded-full cursor-pointer" />
          )}
          renderMark={(props) => (
            <div {...props} className="w-3 h-3 bg-indigo-600 rounded-full" /> // Blot for each step
          )}
        />

        <div className="flex justify-between mt-2 text-xs text-gray-700">
          <span className="text-xl mt-4 font-semibold text-indigo-600">{peopleCount}</span> {/* Make slider value noticeable */}
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

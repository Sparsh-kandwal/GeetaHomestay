import React from 'react';
const SearchBar = () => {
    return (
    <div className="relative flex justify-center items-center mt-40">
        <div className="flex items-center bg-white rounded-3xl shadow-md p-4 w-3/4 lg:w-1/2">
          <div className="flex flex-col items-center mx-10 text-gray-500">
            <strong className="text-gray-800">GeetaHomeStay-KarnPrayag</strong>
          </div>
          <div className="flex flex-col items-center mx-10 text-gray-500">
            <strong className="text-gray-800">Check in</strong>
            <span className="text-sm">Date</span> 
          </div>
          <div className="flex flex-col items-center mx-10 text-gray-500">
            <strong className="text-gray-800">Arrival</strong>
            <span className="text-sm">Time</span>
          </div>
          <div className="flex flex-col items-center mx-10 text-gray-500">
            <strong className="text-gray-800">Check Out</strong>
            <span className="text-sm">Date</span>
          </div>
          <div className="flex flex-col items-center mx-10 text-gray-500">
            <strong className="text-gray-800">Guests</strong>
            <span className="text-sm">Add guests</span>
          </div>
          <div className="bg-yellow-400 rounded-full p-3 cursor-pointer hover:bg-yellow-500">
            <img src="https://img.icons8.com/ios-filled/24/000000/search.png" alt="Search Icon" />
          </div>
        </div>
      </div>
    );
  };
  
  export default SearchBar;
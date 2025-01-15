import React from 'react';

const SkeletonRoom = () => {
  return (
    <div className="w-full bg-white shadow-lg rounded-lg overflow-hidden flex flex-col md:flex-row animate-pulse">
      {/* Image Gallery */}
      <div className="relative md:w-1/3 w-full h-56 md:h-auto bg-gray-300 rounded-lg">
        <div className="w-full h-full bg-gray-400 rounded-lg"></div>
        <div className="absolute top-1/2 left-3 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full">
          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
        </div>
        <div className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full">
          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
        </div>
        <div className="absolute top-3 right-3 bg-white bg-opacity-75 text-red-500 p-2 rounded-full">
          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      {/* Room Details */}
      <div className="p-4 flex flex-col flex-grow md:w-2/3">
        {/* Room Name and Price */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <div className="w-32 h-6 bg-gray-300 rounded"></div>
          <div className="w-24 h-6 bg-gray-300 rounded"></div>
        </div>

        {/* Description */}
        <div className="w-full h-16 bg-gray-300 rounded mb-4"></div>

        {/* Amenities */}
        <div className="mb-4">
          <h4 className="w-32 h-4 bg-gray-300 rounded mb-2"></h4>
          <div className="flex flex-wrap gap-2">
            <div className="w-24 h-8 bg-gray-300 rounded-lg"></div>
            <div className="w-24 h-8 bg-gray-300 rounded-lg"></div>
          </div>
        </div>

        {/* Capacity */}
        <div className="mb-6 flex flex-wrap items-center text-gray-600 text-sm">
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg shadow-sm mr-4 mb-3">
            <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
            <div className="w-20 h-4 bg-gray-300 rounded"></div>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg shadow-sm mb-3">
            <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
            <div className="w-20 h-4 bg-gray-300 rounded"></div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-auto flex justify-end">
          <div className="w-32 h-10 bg-gray-300 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonRoom;

import React from 'react';
import { Link } from 'react-router-dom';

const RoomCard = ({ room }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-lg flex flex-col md:flex-row">
      {/* Room Image */}
      <img
        src={room.image}
        alt={room.name}
        className="w-full md:w-72 h-72 object-cover" // Increased image size
      />

      <div className="p-4 flex-grow flex flex-col justify-between">
        {/* Room Name */}
        <h3 className="text-xl font-semibold">{room.name}</h3>
        
        {/* Room Price */}
        <p className="text-lg font-bold text-green-600">₹{room.price} / night</p>
        
        {/* Room Description */}
        <p className="text-gray-700 mt-2">{room.description}</p>

        {/* Room Amenities */}
        <div className="mt-4">
          <h4 className="font-semibold">Amenities:</h4>
          <ul className="grid grid-cols-2 gap-4 mt-2 text-gray-600">
            {room.amenities.map((amenity, index) => (
              <li key={index} className="flex items-center">
                {/* Displaying icon and name */}
                <span className="mr-2">{amenity.icon}</span>
                <span>{amenity.name}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Max Adults and Children */}
        <div className="mt-4 flex justify-between">
          <p className="text-gray-700">Max Adults: {room.maxAdults}</p>
          <p className="text-gray-700">Max Children: {room.maxChildren}</p>
        </div>
      </div>

      {/* Book Room Button */}
      <div className="p-4 bg-gray-100 w-full md:w-auto">
        <Link
          to={`/book-room/${room.id}`} // Use Link to navigate to the booking page
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Book Room
        </Link>
      </div>
    </div>
  );
};

export default RoomCard;

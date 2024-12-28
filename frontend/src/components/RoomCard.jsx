import React from 'react';

const RoomCard = ({ room }) => {
  return (
    <div className=" border rounded-lg overflow-hidden shadow-lg flex flex-col md:flex-row">
      {/* Room Image */}
      <img
        src={room.image}
        alt={room.name}
        className="w-full md:w-56 h-56 object-cover"
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
          <ul className="list-disc ml-4 mt-2 text-gray-600">
            {room.amenities.map((amenity, index) => (
              <li key={index}>{amenity}</li>
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
        <button
          className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
          onClick={() => alert(`Booking room: ${room.name}`)} // Example action on button click
        >
          Book Room
        </button>
      </div>
    </div>
  );
};

export default RoomCard;

import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';

const RoomCard = ({ room }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-lg flex flex-col md:flex-row">
      {/* Room Image Carousel */}
      <Swiper
        pagination={{ clickable: true }} // Use pagination directly here
        className="w-full md:w-72 h-72"
        style={{ backgroundColor: '#f3f3f3' }}
      >
        {room.gallery && room.gallery.length > 0 ? (
          room.gallery.map((image, index) => (
            <SwiperSlide key={index}>
              <img
                src={image}
                alt={`Room ${room.name} - Image ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </SwiperSlide>
          ))
        ) : (
          <SwiperSlide>
            <img
              src="default-image.jpg"
              alt={`Default image for ${room.name}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </SwiperSlide>
        )}
      </Swiper>

      <div className="p-4 flex-grow flex flex-col justify-between">
        {/* Room Name */}
        <h3 className="text-xl font-semibold">{room.name || 'Room Name'}</h3>

        {/* Room Price */}
        <p className="text-lg font-bold text-green-600">₹{room.price || 'N/A'} / night</p>

        {/* Room Description */}
        <p className="text-gray-700 mt-2">{room.description || 'No description available.'}</p>

        {/* Room Amenities */}
        <div className="mt-4">
          <h4 className="font-semibold">Amenities:</h4>
          <ul className="grid grid-cols-2 gap-4 mt-2 text-gray-600">
            {room.amenities && room.amenities.length > 0 ? (
              room.amenities.map((amenity, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-2">{amenity.icon || '🏷️'}</span>
                  <span>{amenity.name || 'Amenity'}</span>
                </li>
              ))
            ) : (
              <p className="text-sm text-gray-500">No amenities available.</p>
            )}
          </ul>
        </div>

        {/* Max Adults and Children */}
        <div className="mt-4 flex justify-between">
          <p className="text-gray-700">Max Adults: {room.maxAdults || 0}</p>
          <p className="text-gray-700">Max Children: {room.maxChildren || 0}</p>
        </div>
      </div>

      {/* Book Room Button */}
      <div className="p-4 bg-gray-100 w-full md:w-auto">
        <Link
          to={`/book-room/${room.id}`}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Book Room
        </Link>
      </div>
    </div>
  );
};

export default RoomCard;

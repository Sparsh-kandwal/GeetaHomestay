import React from 'react';
import RoomCard from './RoomCard';
import { rooms } from '../constants/Rooms';

const ExploreRooms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-semibold text-center text-gray-800 mb-10">Explore Our Rooms</h2>
      <div className="flex flex-col gap-8">
        {rooms.map((room, index) => (
          <RoomCard key={index} room={room} />
        ))}
      </div>
    </div>
  );
};

export default ExploreRooms;

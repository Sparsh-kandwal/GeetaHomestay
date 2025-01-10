import React from 'react';

const ExploreRooms = ({ rooms }) => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Available Rooms</h2>
      {rooms.length === 0 ? (
        <p>No rooms available. Please search to see results.</p>
      ) : (
        <ul className="space-y-2">
          {rooms.map((room) => (
            <li key={room.roomID} className="border p-2 rounded-md shadow">
              Room ID: {room.roomID}, Count: {room.count}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExploreRooms;

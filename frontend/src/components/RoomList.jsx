import React from 'react';
import { FixedSizeList as List } from 'react-window';
import RoomCard from './RoomCard';

const RoomList = ({ rooms, loading }) => {
  // Row component to render individual room cards
  const Row = ({ index, style }) => (
    <div style={{ ...style, marginBottom: '16px' }}>
      <RoomCard key={rooms[index].roomType} room={rooms[index]} />
    </div>
  );

  return (
    <div >
      {loading ? (
        // Show loading skeletons when data is still loading
        <div className="flex flex-col gap-4">
          {Array(4)
            .fill(null)
            .map((_, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 shadow rounded-lg animate-pulse bg-gray-100"
              >
                <div className="h-32 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
        </div>
      ) : rooms.length > 0 ? (
        // Render the list of rooms using react-window's FixedSizeList for optimized rendering
        <List
          height={600} // Viewport height
          itemCount={rooms.length}
          itemSize={400} // Height of each item, adjusted for spacing
          width="100%" // Full width of the container
          style={{ overflowX: 'hidden' }}
        >
          {Row}
        </List>
      ) : (
        // Message when no rooms match the search criteria
        <p className="text-center text-gray-500 w-screen">No rooms match your search criteria.</p>
      )}
    </div>
  );
};

export default RoomList;

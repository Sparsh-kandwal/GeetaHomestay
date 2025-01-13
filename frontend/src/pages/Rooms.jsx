import React, { useState, useCallback } from 'react';
import ExploreRooms from '../components/ExploreRooms';

const Rooms = () => {
  const [roomData, setRoomData] = useState([]);



  return (
    <div className="mt">
      <div className="flex flex-col items-center gap-6">
        <ExploreRooms roomData={roomData} />
      </div>
     
    </div>
  );
};

export default Rooms;

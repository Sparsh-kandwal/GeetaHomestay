import React, { useState, useCallback } from 'react';
import ExploreRooms from '../components/ExploreRooms';
import SearchBar from '../components/SearchBar';

const Rooms = () => {
  const [roomData, setRoomData] = useState([]);

  const handleSearchResults = useCallback((data) => {
    setRoomData(data);
  }, []); 

  return (
    <div className="mt-24">
      <div className="flex flex-col items-center gap-6">
        <SearchBar onSearch={handleSearchResults} />
        <ExploreRooms roomData={roomData} />
      </div>
     
    </div>
  );
};

export default Rooms;

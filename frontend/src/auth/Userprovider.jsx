import React, { createContext, useState, useEffect, useCallback } from 'react';

const UserContext = createContext();
const RoomContext = createContext();

const RoomProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/allRooms`, { method: 'GET' });
      const data = await response.json();
      console.log(data)
      if (data) {
        sessionStorage.setItem('rooms', JSON.stringify(data)); // Save rooms to sessionStorage
        setRooms(data); // Set rooms state
      } else {
        console.error('Invalid data received from API:', data);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setRoomsLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedRooms = sessionStorage.getItem('rooms');
    if (storedRooms) {
      try {
        const parsedRooms = JSON.parse(storedRooms);
        if (Array.isArray(parsedRooms)) {
          setRooms(parsedRooms);
        } else {
          console.error('Invalid rooms data in sessionStorage');
        }
      } catch (error) {
        console.error('Error parsing rooms from sessionStorage:', error);
      }
      setRoomsLoading(false);
    } else {
      fetchRooms();
    }
  }, [fetchRooms]);

  return (
    <RoomContext.Provider value={{ rooms, setRooms, roomsLoading, fetchRooms }}>
      {children}
    </RoomContext.Provider>
  );
};
const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
  
    const fetchUser = useCallback(async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/profile`, {
          method: 'POST',
          credentials: 'include',
        });
        if (response.status === 401) {
          alert('Your session has expired. Please log in again.');
          setUser(null);
        } else if (response.status === 200) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }, []);
  
    useEffect(() => {
      fetchUser();
    }, [fetchUser]);
  
    return (
      <UserContext.Provider value={{ user, setUser, isLoading, setIsLoading }}>
        {children}
      </UserContext.Provider>
    );
};



  
export { UserContext, UserProvider, RoomContext, RoomProvider};
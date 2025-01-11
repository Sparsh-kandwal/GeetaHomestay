import React, { createContext, useState, useEffect, useCallback } from 'react';

const UserContext = createContext();

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
  
export { UserContext, UserProvider};
// DateContext.js
import React, { createContext, useContext, useState } from 'react';

// Create the context
const DateContext = createContext();

// Provide the context to the application
export const DateProvider = ({ children }) => {
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');

  return (
    <DateContext.Provider value={{ checkInDate, setCheckInDate, checkOutDate, setCheckOutDate }}>
      {children}
    </DateContext.Provider>
  );
};

// Custom hook to use the context
export const useDateContext = () => useContext(DateContext);
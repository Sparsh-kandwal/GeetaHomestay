import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem('cart');
    return storedCart ? JSON.parse(storedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const exists = prevItems.some(
        (cartItem) =>
          cartItem.room.id === item.room.id &&
          new Date(cartItem.bookingDetails.arrivalDate).getTime() === new Date(item.bookingDetails.arrivalDate).getTime() &&
          new Date(cartItem.bookingDetails.departureDate).getTime() === new Date(item.bookingDetails.departureDate).getTime()
      );

      if (exists) {
        toast.info('This booking already exists in your cart.');
        return prevItems;
      } else {
        toast.success('Room added to cart!');
        return [...prevItems, item];
      }
    });
  };

  const removeFromCart = (roomId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.room.id !== roomId)
    );
    toast.success('Room removed from cart.');
  };

  const clearCart = () => {
    setCartItems([]);
    toast.success('Cart cleared.');
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart }}
    >
      {children}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </CartContext.Provider>
  );
};
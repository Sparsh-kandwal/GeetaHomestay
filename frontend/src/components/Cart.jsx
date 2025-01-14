import React, { useEffect, useState, useContext } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { RoomContext } from '../auth/Userprovider';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const { fetchRooms, rooms, setRooms } = useContext(RoomContext);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRooms = sessionStorage.getItem('rooms');
    if (storedRooms) {
      setRooms(JSON.parse(storedRooms));
    } else {
      fetchRooms();
    }
  }, [fetchRooms]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + `/getCart`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        const data = await response.json();
        if (data.cart) {
          const enrichedCart = data.cart.map((item) => {
            const roomDetails = rooms.find((room) => room.roomType === item.roomType);
            return {
              ...item,
              room: roomDetails || {},
            };
          });
          setCartItems(enrichedCart);
        }
      } catch (error) {
        console.error('Error Fetching Cart Items', error);
      }
    };

    fetchCart();
  }, [rooms, fetchRooms]);

  const removeFromCart = async (roomType) => {
    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + `/removeFromCart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ roomType }),
      });

      if (response.ok) {
        setCartItems((prev) => prev.filter((item) => item.room.roomType !== roomType));
      } else {
        console.error('Failed to remove item from cart.');
      }
    } catch (error) {
      console.error('Error removing item from cart', error);
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + `/clearCart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        setCartItems([]);
      } else {
        console.error('Failed to clear cart.');
      }
    } catch (error) {
      console.error('Error clearing cart', error);
    }
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  const totalAmount = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="container mx-auto px-4 py-12 lg:py-24">
      <h1 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-800">Your Cart</h1>

      {cartItems.length === 0 ? (
        <p className="text-gray-700">Your cart is empty.</p>
      ) : (
        <div className="space-y-6">
          {cartItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow-sm"
            >
              <div className="flex items-center">
                <img
                  src={import.meta.env.VITE_CLOUDINARY_CLOUD + item.room.coverImage}
                  alt={item.room.roomName || 'Room'}
                  className="w-24 h-16 object-cover rounded-md mr-4"
                />
                <div>
                  <h2 className="text-xl font-semibold">{item.room.roomName || 'Room'}</h2>
                  <p className="text-gray-600">₹{(item.price).toLocaleString()} per room</p>
                  <p className="text-gray-600">
                    Quantity: {item.quantity}
                  </p>
                  <p className="text-gray-600">
                    Check-in: {new Date(item.checkIn).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600">
                    Check-out: {new Date(item.checkOut).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700 font-semibold">
                    Total Price: ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFromCart(item.room.roomType)}
                className="text-red-500 hover:text-red-700 focus:outline-none"
                aria-label="Remove from cart"
              >
                <FaTrashAlt />
              </button>
            </div>
          ))}

          <div className="flex justify-between items-center mt-6">
            <button
              onClick={clearCart}
              className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200"
            >
              Clear Cart
            </button>
            <div className="text-xl font-semibold">
              Total: ₹{totalAmount.toLocaleString()}
            </div>
            <button
              onClick={handleProceedToCheckout}
              className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

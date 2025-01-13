// src/components/Cart.jsx

import React from 'react';
import { useCart } from '../contexts/CartContext';
import { FaTrashAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const totalAmount = cartItems.reduce((acc, item) => acc + item.bookingDetails.totalPrice, 0);

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    // Navigate to booking confirmation or checkout page
    navigate('/checkout', { state: { cartItems, totalAmount } });
  };

  return (
    <div className="container mx-auto px-4 py-12 lg:py-24">
      <h1 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-800">Your Cart</h1>

      {cartItems.length === 0 ? (
        <p className="text-gray-700">Your cart is empty.</p>
      ) : (
        <div className="space-y-6">
          {cartItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <img src={import.meta.env.VITE_CLOUDINARY_CLOUD +item.room.gallery[0]} alt={item.room.name} className="w-24 h-16 object-cover rounded-md mr-4" />
                <div>
                  <h2 className="text-xl font-semibold">{item.room.name}</h2>
                  <p className="text-gray-600">₹{item.bookingDetails.totalPrice.toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={() => removeFromCart(item.room.id)}
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
import React, { useEffect, useState, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { RoomContext } from '../auth/Userprovider';
import { UserContext } from '../auth/Userprovider';
import CartItem from './Cartitem'
import OpacityLoader from './OpacityLoader';
import { AnimatePresence } from 'framer-motion';
import { checkouthandler } from '../utils/Payment';
import axios from 'axios';
const Cart = () => {
    const [availableItems, setAvailableItems] = useState([]);
    const [removedItems, setRemovedItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const { fetchRooms, rooms, setRooms, roomsLoading } = useContext(RoomContext);
    const navigate = useNavigate()
    const { user } = useContext(UserContext);
    const [paymentStatus ,setPaymentStatus] = useState(false)

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
                const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/getCart', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });
                const data = await response.json();
                let Price = 0;
                if (data.available) {
                    const enrichedAvailable = data.available.map((item) => ({
                        ...item,
                        room: rooms.find((room) => room.roomType === item.roomType) || {},
                    }));
                    setAvailableItems(enrichedAvailable);
                    Price += data.available.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                }
                if (data.removed) {
                    const enrichedRemoved = data.removed.map((item) => ({
                        ...item,
                        room: rooms.find((room) => room.roomType === item.roomType) || {},
                    }));
                    setRemovedItems(enrichedRemoved);
                }
                setTotalAmount(Price || 0);
            } catch (error) {
                console.error('Error Fetching Cart Items', error);
            } finally {
              setLoading(false);
            }
        };
        if (!roomsLoading) fetchCart();
    }, [roomsLoading]);


    const handleProceedToCheckout = async () => {
        try {
            const bookingResponse = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/bookroom`,
                { 
                    userId: user._id,  
                    totalAmount
                },
                { withCredentials: true } 
            );
            console.log("🟢 Booking Response:", bookingResponse.data);
    
            if (bookingResponse.data.success) {
                checkouthandler(totalAmount, user, async (paymentId) => {
                    console.log(`Saumil payment : ${paymentId}`);
                
                    const statusRes = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/payment/checkPaymentStatus`, {
                      paymentId,
                      userId: user._id,
                    },
                    { withCredentials: true } 
                    );


                    try {
                        navigate('/booking-confirmation', { 
                            state: { 
                                bookingDetails: bookingResponse.data,
                                fromCart: true
                            } 
                        });
                    } catch (error) {
                        console.error("🔴 Navigation Error:", error);
                    }
                    
                    
                  });
                
            }     
            else {
                alert("Booking failed! Please try again.");
            }
           
        } catch (error) {
            console.error("🔴 Booking Error:", error);
            alert("Booking request failed. Please try again.");
        }
    };

    if (loading || roomsLoading) {
      return <OpacityLoader />;
    }

    return (
        <div className="container mx-auto px-4 py-12 lg:py-24 mt-5 md:mt-0">
            <AnimatePresence>
            <h1 className="text-5xl font-bold mt-5 mb-8 text-blue-900 text-center">Your Cart</h1>

            {availableItems.length === 0 && removedItems.length === 0 ? (
                <p className="text-gray-700 text-center text-lg">Your cart is empty. Start adding rooms to your cart!</p>
            ) : (
                <div className="space-y-8">
                    {removedItems.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-semibold text-red-700">Unavailable Items</h2>
                            {removedItems.map((item) => (
                                <CartItem key={`removed-${item.id || item.roomType}`} item={item} isRemoved={true} setAvailableItems={setAvailableItems} />
                            ))}
                        </div>
                    )}
                    {availableItems.length > 0 && (
                        <div className="space-y-4">
                            {availableItems.map((item) => (
                                <CartItem key={`available-${item.id || item.roomType}`} item={item} setAvailableItems={setAvailableItems}/>
                            ))}
                        </div>
                    )}
                    {availableItems.length > 0 && (
                        <div className="border-t border-gray-200 pt-8 mt-8">
                            <div className="flex justify-between items-center mx-auto max-w-4xl">
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        Total Amount: ₹{totalAmount.toLocaleString()}
                                    </div>
                                    <div className="text-sm font-italic text-gray-500">(inclusive of all taxes)</div>
                                </div>
                                <button
                                    onClick={handleProceedToCheckout}
                                    className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"  
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            </AnimatePresence>
        </div>
    );
};

export default Cart;
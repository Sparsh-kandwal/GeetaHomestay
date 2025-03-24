import React, { useEffect, useState, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { RoomContext } from '../auth/Userprovider';
import { UserContext } from '../auth/Userprovider';
import CartItem from './Cartitem'
import OpacityLoader from './OpacityLoader';
import { AnimatePresence } from 'framer-motion';
import { checkouthandler } from '../utils/Payment';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Cart = () => {
    const [availableItems, setAvailableItems] = useState([]);
    const [removedItems, setRemovedItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const { fetchRooms, rooms, setRooms, roomsLoading } = useContext(RoomContext);
    const navigate = useNavigate()
    const { user } = useContext(UserContext);
    const [paymentStatus, setPaymentStatus] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false);
    const [cartAction, setCartAction] = useState(null);

    useEffect(() => {
        const storedRooms = sessionStorage.getItem('rooms');
        if (storedRooms) {
            setRooms(JSON.parse(storedRooms));
        } else {
            fetchRooms();
        }
    }, [fetchRooms]);

    useEffect(() => {
        // Recalculate total amount whenever availableItems changes
        const newTotalAmount = availableItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        setTotalAmount(newTotalAmount);
    }, [availableItems]);

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
                if (data.available) {
                    const enrichedAvailable = data.available.map((item) => ({
                        ...item,
                        room: rooms.find((room) => room.roomType === item.roomType) || {},
                    }));
                    setAvailableItems(enrichedAvailable);
                    
                    // Add toast notification when new items are added
                    if (enrichedAvailable.length > availableItems.length) {
                        toast.success('Room added to cart successfully!');
                    }
                }
                if (data.removed) {
                    const enrichedRemoved = data.removed.map((item) => ({
                        ...item,
                        room: rooms.find((room) => room.roomType === item.roomType) || {},
                    }));
                    setRemovedItems(enrichedRemoved);
                }
            } catch (error) {
                console.error('Error Fetching Cart Items', error);
                toast.error('Failed to fetch cart items');
            } finally {
                setLoading(false);
            }
        };
        if (!roomsLoading) fetchCart();
    }, [roomsLoading, rooms]);



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
                    console.log(`🟢 Payment Successful: ${paymentId}`);
    
                    // Verify payment status on backend
                    const statusRes = await axios.post(
                        `${import.meta.env.VITE_BACKEND_URL}/payment/checkPaymentStatus`,
                        {
                            paymentId,
                            userId: user._id,
                        },
                        { withCredentials: true }
                    );
    
                    console.log("🟢 Payment Status Response:", statusRes.data);
    
                    // Proceed to booking confirmation
                    try {
                        navigate('/booking-confirmation', {
                            state: {
                                bookingDetails: bookingResponse.data,
                                fromCart: true
                            }
                        });
                        console.log("🟢 Navigation to /booking-confirmation successful");
                    } catch (error) {
                        console.error("🔴 Navigation Error:", error);
                    }
                });
    
            } else {
                alert("Booking failed! Please try again.");
            }
    
        } catch (error) {
            console.error("🔴 Booking Error:", error);
            alert("Booking request failed. Please try again.");
        }
    };


    if (loading || roomsLoading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-6xl mx-auto">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="mb-4 bg-gray-100 p-6 rounded-lg animate-pulse">
                            <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-12  mx-auto px-4 py-8 lg:py-12">
            <AnimatePresence mode="wait">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Main Cart Content */}
                        <div className="lg:w-2/3">
                            <div className="flex justify-between items-center mb-8">
                                <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
                               
                            </div>

                            {availableItems.length === 0 && removedItems.length === 0 ? (
                                <div className="text-center py-16 bg-gray-50 rounded-lg shadow-sm">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
                                    <p className="mt-1 text-sm text-gray-500">Start adding rooms to begin your booking!</p>
                                    <div className="mt-6">
                                        <button
                                            onClick={() => navigate('/rooms')}
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            View Rooms
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {removedItems.length > 0 && (
                                        <div className="bg-red-50 p-4 rounded-lg">
                                            <h2 className="text-lg font-semibold text-red-700 mb-4">Unavailable Items</h2>
                                            {removedItems.map((item) => (
                                                <CartItem 
                                                    key={`removed-${item.id || item.roomType}`} 
                                                    item={item} 
                                                    isRemoved={true}
                                                    setAvailableItems={setAvailableItems}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    {availableItems.map((item) => (
                                        <CartItem 
                                            key={`available-${item.id || item.roomType}`} 
                                            item={item}
                                            setAvailableItems={setAvailableItems}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Order Summary Sidebar */}
                        {availableItems.length > 0 && (
                            <div className="lg:w-1/3">
                                <div className="bg-gray-50 rounded-lg p-6 shadow-sm sticky top-4">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                                    <div className="space-y-4">
                                        <div className="flex justify-between font-semibold">
                                            <span>Total Amount</span>
                                            <span>₹{totalAmount.toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">(inclusive of all taxes)</p>
                                        <button
                                            onClick={handleProceedToCheckout}
                                            disabled={isProcessing}
                                            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                                        >
                                            {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </AnimatePresence>
        </div>
    );
};

export default Cart;
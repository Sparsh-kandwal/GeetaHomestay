import React from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const removeFromCart = async (roomType, checkIn, checkOut, setAvailableItems) => {
    try {
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/deleteFromCart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ roomType, checkIn, checkOut }),
        });
        if (response.ok) {
            setAvailableItems((prev) =>
                prev.filter((item) =>
                    !(item.roomType === roomType &&
                        item.checkIn === checkIn &&
                        item.checkOut === checkOut)
                )
            );
        }
    } catch (error) {
        console.error('Error removing item from cart', error);
    }
};

const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
    removed: { opacity: 0, y: -50, transition: { duration: 0.5 } },
};

const CartItem = ({ item, isRemoved = false, setAvailableItems }) => (
    <motion.div
        className={`relative flex items-center justify-between bg-white border border-gray-200 p-6 rounded-lg shadow-md mx-auto max-w-4xl mt-4 ${isRemoved ? 'bg-blue-50' : ''}`}
        initial="visible"
        animate={isRemoved ? "removed" : "visible"}
        exit="removed"
        variants={variants}
    >
        {isRemoved && (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-red-100 rounded-lg text-red-700 text-xl font-bold">
                {`${item.removedQuantity} room${item.removedQuantity > 1 ? 's' : ''} removed - No longer available`}
            </div>
        )}

        <div className="flex flex-col md:flex-row items-center gap-6 w-full">
            <img
                src={import.meta.env.VITE_CLOUDINARY_CLOUD + item.room.coverImage}
                alt={item.room.roomName || 'Room'}
                className="w-auto md:h-40 object-cover rounded-md"
            />
            <div className="w-full">
                <h1 className="text-2xl font-semibold text-gray-900">{item.room.roomName || 'Room'}</h1>
                <h2 className="text-md font-semibold text-gray-900">
                    <p className="text-gray-600">₹{item.price.toLocaleString()} per room</p>
                </h2>
                <div className="flex flex-col md:flex-row md:items-center md:gap-20 items-start text-left">
                    <div>
                        <p className="text-gray-600">
                            {isRemoved ? `` : `Quantity: ${item.quantity}`}
                        </p>
                        <p className="text-gray-600">Members: {item.members}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">
                            Check-in: {new Date(item.checkIn).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-gray-600">
                            Check-out: {new Date(item.checkOut).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {!isRemoved && (
                    <div className='flex items-center justify-between'>
                        <p className="text-xl font-semibold text-blue-700 mt-2">
                            Total: ₹{(item.price * item.quantity).toLocaleString()}
                        </p>

                        <button
                            onClick={() => removeFromCart(item.roomType, item.checkIn, item.checkOut, setAvailableItems)}
                            className="md:absolute md:right-6 md:top-6 text-blue-600 hover:text-blue-800 focus:outline-none transition"
                            aria-label="Remove from cart"
                        >
                            <FaTrashAlt className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    </motion.div>
);

export default CartItem;
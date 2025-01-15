import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaHome, FaShoppingCart, FaFilePdf } from 'react-icons/fa';
import jsPDF from 'jspdf';

const BookingConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { state } = location;
    const bookingData = state?.bookingDetails;
    const room = state?.room;

    if (!bookingData || !room) {
        return (
            <div className="min-h-screen flex mt-10 items-center justify-center p-4 bg-gray-100">
                <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg text-center">
                    <h2 className="text-2xl font-semibold text-red-600 mb-4">
                        Oops! Booking Details Missing
                    </h2>
                    <p className="text-gray-700 mb-6">
                        It seems like we couldn't retrieve your booking details. Please try booking again.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        <FaHome className="mr-2" />
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    const {
        checkInDate,
        checkOutDate,
        guests,
        roomCount,
        totalPrice,
    } = bookingData;

    const formattedCheckIn = format(new Date(checkInDate), 'PPP');
    const formattedCheckOut = format(new Date(checkOutDate), 'PPP');

    const handleNavigateHome = () => {
        navigate('/');
        toast.success('Welcome back!');
    };

    const handleViewCart = () => {
        navigate('/cart');
        toast.info('Here is your cart!');
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('Booking Receipt', 20, 20);
        doc.setFontSize(12);
        doc.text(`Room: ${room.name}`, 20, 40);
        doc.text(`Check-In Date: ${formattedCheckIn}`, 20, 50);
        doc.text(`Check-Out Date: ${formattedCheckOut}`, 20, 60);
        doc.text(`Guests: ${guests}`, 20, 70);
        doc.text(`Rooms Booked: ${roomCount}`, 20, 80);
        doc.text(`Total Price: ₹${totalPrice.toLocaleString()}`, 20, 90);
        doc.save('booking-receipt.pdf');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-300 p-4" style={{ marginTop: '50px' }}>
            <div className="bg-gradient-to-br from-blue-200 to-white shadow-2xl rounded-2xl p-8 max-w-4xl w-full">
                <div className="flex flex-col items-center mb-8">
                    <FaCheckCircle className="text-green-500 text-6xl" />
                    <h1 className="text-3xl font-bold text-green-600 mt-4">Booking Confirmed!</h1>
                    <p className="text-gray-600 mt-2 text-center">
                        Thank you for your reservation. Here are your booking details:
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Booking Information</h2>
                        <div className="space-y-3">
                            <div>
                                <h3 className="text-gray-500">Room</h3>
                                <p className="text-gray-700">{room.name}</p>
                            </div>
                            <div>
                                <h3 className="text-gray-500">Check-In Date</h3>
                                <p className="text-gray-700">{formattedCheckIn}</p>
                            </div>
                            <div>
                                <h3 className="text-gray-500">Check-Out Date</h3>
                                <p className="text-gray-700">{formattedCheckOut}</p>
                            </div>
                            <div>
                                <h3 className="text-gray-500">Guests</h3>
                                <p className="text-gray-700">{guests} {guests > 1 ? 'guests' : 'guest'}</p>
                            </div>
                            <div>
                                <h3 className="text-gray-500">Rooms Booked</h3>
                                <p className="text-gray-700">{roomCount} {roomCount > 1 ? 'rooms' : 'room'}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Total Price</h2>
                        <div className="bg-gradient-to-br from-teal-400 to-indigo-500 p-6 rounded-lg text-center shadow-lg transform transition-transform hover:scale-105">
                            <p className="text-4xl font-bold text-white drop-shadow-lg">₹{totalPrice.toLocaleString()}</p>
                            <p className="text-gray-100 mt-2">
                                Total for {roomCount} {roomCount > 1 ? 'rooms' : 'room'}
                            </p>
                        </div>
                        <button
                            onClick={handleDownloadPDF}
                            className="mt-4 flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                        >
                            <FaFilePdf className="mr-2" />
                            Download Receipt
                        </button>
                    </div>
                </div>

                <hr className="my-8 border-gray-300" />

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleNavigateHome}
                        className="flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        <FaHome className="mr-2" />
                        Go to Home
                    </button>
                    <button
                        onClick={handleViewCart}
                        className="flex items-center justify-center border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition"
                    >
                        <FaShoppingCart className="mr-2" />
                        View Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmation;
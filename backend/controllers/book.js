import Booking from '../models/booking.js'; 
import Room from '../models/room.js';
import BookedDate from '../models/bookedDates.js';

const createOrder = async (req, res) => {
    try {
        const { roomType, checkIn, checkOut, roomsBooked, adults, children } = req.body;
        const userId = req.user.id;
        const room = await Room.findOne({ roomType });
        if (!room) return res.status(404).json({ message: 'Room type not found' });
        const totalDays = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
        const totalAmount = totalDays * roomsBooked * room.price * 100; // Amount in paise
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        // Update BookedDate for each date between check-in and check-out
        for (let date = new Date(checkInDate); date < checkOutDate; date.setDate(date.getDate() + 1)) {
            const formattedDate = new Date(date).toISOString().split('T')[0]; // Format date to YYYY-MM-DD
            const existingDate = await BookedDate.findOne({ date: formattedDate, roomType });

            if (existingDate) {
                existingDate.quantity += roomsBooked;
                await existingDate.save();
            } else {
                await BookedDate.create({
                    date: formattedDate,
                    roomType,
                    quantity: roomsBooked
                });
            }
        }
        const booking = await Booking.create({
            userId,
            adults,
            children,
            roomType,
            checkIn,
            checkOut,
            roomsBooked,
            totalAmount,
            status: 'pending'
        });

        res.status(200).json({
            success: true,
            message: 'Booking created successfully',
            booking
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to create order' });
    }
};

export default createOrder;

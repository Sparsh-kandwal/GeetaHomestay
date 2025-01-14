import Room from '../models/room.js';
import BookedDate from '../models/bookedDates.js';

export const calculateRoomAvailability = async (checkIn, checkOut) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const rooms = await Room.find({});
    if (!rooms || rooms.length === 0) {
        throw new Error('No rooms available in the database');
    }
    const availability = {};
    for (const room of rooms) {
        availability[room._doc.roomType] = {
            availableRooms: room._doc.totalRooms,
            price: room._doc.price,
            discount: room._doc.discount,
        };
    }
    const bookedDates = await BookedDate.find({
        date: { $gte: checkInDate, $lt: checkOutDate },
    });
    const maxBookings = {};
    for (const booking of bookedDates) {
        const { roomType, quantity } = booking;

        if (!maxBookings[roomType]) {
            maxBookings[roomType] = 0;
        }
        maxBookings[roomType] = Math.max(maxBookings[roomType], quantity);
    }

    for (const roomType in availability) {
        if (maxBookings[roomType]) {
            availability[roomType].availableRooms -= maxBookings[roomType];
        }

        if (availability[roomType].availableRooms < 0) {
            availability[roomType].availableRooms = 0;
        }
    }
    console.log(availability);
    return availability;
};

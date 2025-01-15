import Room from '../models/room.js';
import BookedDate from '../models/bookedDates.js';
import Cart_item from '../models/cart.js';

export const calculateRoomAvailability = async (checkIn, checkOut, userId = null, excludeCartItemId = null) => {
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
            maxAdults: room._doc.maxAdults
        };
    }

    const dateBookings = {};
    const currentDate = new Date(checkInDate);
    while (currentDate < checkOutDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        dateBookings[dateStr] = {};
        for (const room of rooms) {
            dateBookings[dateStr][room._doc.roomType] = 0;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    const bookedDates = await BookedDate.find({
        date: { $gte: checkInDate, $lt: checkOutDate },
    });

    for (const booking of bookedDates) {
        const dateStr = booking.date.toISOString().split('T')[0];
        dateBookings[dateStr][booking.roomType] = booking.quantity;
    }

    if (userId) {
        const cartItems = await Cart_item.find({
            userId,
            checkIn: { $lt: checkOutDate },
            checkOut: { $gt: checkInDate }
        });

        for (const cartItem of cartItems) {
            if (excludeCartItemId && String(cartItem._id) === String(excludeCartItemId)) {
                continue; // Exclude the current cart item
            }
            const cartStartDate = new Date(cartItem.checkIn);
            const cartEndDate = new Date(cartItem.checkOut);
            const current = new Date(Math.max(cartStartDate, checkInDate));
            const end = new Date(Math.min(cartEndDate, checkOutDate));

            while (current < end) {
                const dateStr = current.toISOString().split('T')[0];
                dateBookings[dateStr][cartItem.roomType] += cartItem.quantity;
                current.setDate(current.getDate() + 1);
            }
        }
    }

    const maxBookings = {};
    for (const dateStr in dateBookings) {
        for (const roomType in dateBookings[dateStr]) {
            if (!maxBookings[roomType]) {
                maxBookings[roomType] = 0;
            }
            maxBookings[roomType] = Math.max(maxBookings[roomType], dateBookings[dateStr][roomType]);
        }
    }

    for (const roomType in availability) {
        if (maxBookings[roomType]) {
            availability[roomType].availableRooms -= maxBookings[roomType];
        }
        if (availability[roomType].availableRooms < 0) {
            availability[roomType].availableRooms = 0;
        }
    }
    return availability;
};

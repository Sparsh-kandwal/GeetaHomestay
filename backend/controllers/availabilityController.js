import { calculateRoomAvailability } from '../utils/roomAvailability.js';

const getRoomAvailability = async (req, res) => {
    try {
        const { checkIn, checkOut } = req.body;

        if (!checkIn || !checkOut) {
            return res.status(400).json({ message: 'Check-in and Check-out dates are required' });
        }

        const availability = await calculateRoomAvailability(checkIn, checkOut);

        res.status(200).json({ success: true, availability });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export default getRoomAvailability;

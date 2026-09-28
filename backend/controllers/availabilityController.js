import { calculateRoomAvailability } from '../utils/roomAvailability.js';

const getRoomAvailability = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { checkIn, checkOut } = req.body;
        let availability;
        if (checkIn && checkOut) {
            availability = await calculateRoomAvailability(checkIn, checkOut, userId);
        }
        res.status(200).json({ success: true, availability });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};



export default getRoomAvailability;

import Room from "../models/room.js";



export const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find({});
        
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving rooms', error });
    }
};


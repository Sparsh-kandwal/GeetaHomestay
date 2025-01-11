import mongoose from 'mongoose';

const room = new mongoose.Schema({
    roomtType: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number},
    images: [{ type: String, required: false }],
    amenities: [{ type: String, required: false }],
    description: { type: String, required: false },
    maxAdults: { type: Number, required: false },
    maxChildren: { type: Number, required: false },
    totalRooms: { type: Number, required: true }
});

const Room = mongoose.model('Room', room);
export default Room;

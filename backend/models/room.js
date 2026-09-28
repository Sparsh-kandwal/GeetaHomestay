import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    amenities: [{ name: String, icon: String }],
    maxGuests: { type: Number, required: true },
    totalRooms: { type: Number, required: true },
    gallery: [String]
});

const Room = mongoose.model('Room', roomSchema);

export default Room

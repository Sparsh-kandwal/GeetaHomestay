import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    roomType: { type: String, required: true },
    roomName: { type: String },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    coverImage: { type: String },
    description: { type: String },
    amenities: [{ name: String, icon: String }],
    maxAdults: { type: Number, required: true },
    totalRooms: { type: Number, required: true },
    gallery: [String],
    // Legacy schema compatibility
    id: { type: String },
    name: { type: String },
    image: { type: String },
    maxGuests: { type: Number },
  },
  { strict: false }
);

const Room = mongoose.model('Room', roomSchema);

export default Room;

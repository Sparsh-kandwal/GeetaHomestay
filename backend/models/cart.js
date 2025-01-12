import mongoose from 'mongoose';
import User from './user.js';

const cart_item = new mongoose.Schema ({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true},   // Reference to the user who made the booking
    roomType: {type: String, required: true},   // Room type booked
    members: {type: Number, required: true, default: 1},   // Number of adults booked
    checkIn: {type: Date, required: true},   // Check-in date
    checkOut: {type: Date, required: true},   // Check-out date
    quantity: {type: Number, required: true},   // Number of rooms booked
});

const Cart_item = mongoose.model('Cart', cart_item, 'Cart');
export default Cart_item;
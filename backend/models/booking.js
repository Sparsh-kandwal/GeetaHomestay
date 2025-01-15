import mongoose from 'mongoose';
import User from './user.js';

const booking = new mongoose.Schema ({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true},   // Reference to the user who made the booking
    roomType: {type: String, required: true},   // Room type booked
    Members: {type: Number, required: true, default: 1},   // Number of adults booked
    checkIn: {type: Date, required: true},   // Check-in date
    checkOut: {type: Date, required: true},   // Check-out date
    roomsBooked: {type: Number, required: true},   // Number of rooms booked
    totalAmount: {type: Number, required: true},   // Total amount paid
    discount: {type: Number, required: true, default: 0},   // Discount applied
    payementStatus: {type: String, required: true, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending'},   // Payment status (paid or unpaid)
});

const Booking = mongoose.model('Booking', booking);
export default Booking;
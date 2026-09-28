import mongoose from 'mongoose'

const bookedDate = mongoose.Schema({
    date: { type: Date, required: true },
    roomType: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 }
});

// Compound unique index: one document per (date, roomType) — prevents duplicate inserts
bookedDate.index({ date: 1, roomType: 1 }, { unique: true });

const BookedDate = mongoose.model('BookedDate', bookedDate);
export default BookedDate;
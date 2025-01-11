import mongoose from 'mongoose'

const bookedDate = mongoose.Schema({
    date: { type: Date, required: true },
    roomType: { type: String, required: true },
    quantity: { type: Number, required: true }
});

const BookedDate = mongoose.model('BookedDate', bookedDate);
export default BookedDate;
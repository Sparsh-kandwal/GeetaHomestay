import mongoose from 'mongoose';

const user = new mongoose.Schema({
    id: { type: String },
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String},
    photo: { type: String }
});

const User = mongoose.model('User', user);
export default User;

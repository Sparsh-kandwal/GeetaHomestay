// backend/models/user.js

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String },
    photo: { type: String },
    // Uncomment the following line if implementing password-based auth
    // password: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
// backend/routes/authrouter.js

import express from 'express';
import { googleAuth, getMyProfile, updateProfile, logout } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const Router = express.Router();

// Google Authentication Route
Router.post("/google", googleAuth);

// Get User Profile Route
Router.get("/profile", verifyToken, getMyProfile);

// Update User Profile Route
Router.put("/profile", verifyToken, updateProfile);

// Logout Route
Router.post("/logout", verifyToken, logout);

export default Router;
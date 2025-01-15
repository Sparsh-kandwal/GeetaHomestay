// backend/routes/authrouter.js




import express from 'express';
import { googleAuth, getMyProfile,updateProfile, logout } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const Router = express.Router();
Router.post("/google", googleAuth);
Router.post("/profile", verifyToken, getMyProfile);
Router.put("/profile", verifyToken, updateProfile);
Router.post("/logout", verifyToken, logout);
export default Router;
import express from 'express';
import { googleAuth, getMyprofile, logout } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const Router = express.Router();
Router.post("/google", googleAuth);
Router.post("/profile", verifyToken, getMyprofile);
Router.post("/logout", verifyToken, logout);
export default Router;
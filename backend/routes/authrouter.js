// backend/routes/authrouter.js
import express from 'express';
import { googleAuth, logout, getMyprofile } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const Router = express.Router();
Router.post("/google", googleAuth);
Router.post("/profile", requireAuth, getMyprofile);
Router.post("/logout", requireAuth, logout);
export default Router;
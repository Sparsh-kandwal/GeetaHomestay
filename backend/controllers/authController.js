// backend/controllers/authController.js

import jwt from 'jsonwebtoken';
import User from "../models/user.js";
import { emailTemplate } from '../constants/EmailTemplate.js';
import { transporter } from '../utils/MailClient.js';
// import fetch from 'node-fetch'; // Ensure node-fetch is installed

/**
 * Google Authentication Handler
 */
export const googleAuth = async (req, res) => {
    const code = req.body.code; // Authorization code from frontend

    if (!code) {
        return res.status(400).json({ message: 'Authorization code is missing' });
    }

    try {
        const data = {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: "authorization_code",
        };

        // Exchange authorization code for access token
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(data).toString(),
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            throw new Error(JSON.stringify(errorData));
        }

        const accessTokenData = await tokenResponse.json();
        const { access_token } = accessTokenData;

        // Fetch user info using the access token
        const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v1/userinfo", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        if (!userInfoResponse.ok) {
            const errorData = await userInfoResponse.json();
            throw new Error(JSON.stringify(errorData));
        }

        const userInfo = await userInfoResponse.json();

        // Find or create the user
        let user = await User.findOne({ email: userInfo.email });
        let isNewUser = false;

        if (!user) {
            user = await User.create({
                userName: userInfo.name,
                email: userInfo.email,
                photo: userInfo.picture,
            });
            isNewUser = true;
        }

        // Generate JWT
        const tokenPayload = { id: user._id, email: user.email };
        const secretKey = process.env.JWT_SECRET;
        const token = jwt.sign(tokenPayload, secretKey, { expiresIn: '5d' });

        // Set JWT in HttpOnly cookie
        res.cookie('accessToken', token, {
            httpOnly: true,
            expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
            secure: process.env.NODE_ENV === 'production', // Set to true in production
            sameSite: 'strict',
        });

        // Send welcome email only for new users
        if (isNewUser) {
            try {
                const emailContent = emailTemplate(user.userName);

                await transporter.sendMail({
                    from: '"Geeta Home Stay" <geetahomestaykaranprayag@gmail.com>',
                    to: user.email,
                    subject: "Welcome to Geeta Home Stay!",
                    html: emailContent,
                });

                console.log("Welcome email sent successfully to:", user.email);
            } catch (emailError) {
                console.error("Error sending welcome email:", emailError.message);
            }
        }

        res.status(200).json({
            message: "User authenticated successfully",
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                photo: user.photo,
            },
        });

    } catch (error) {
        console.error('Error during Google Auth:', error.message);
        res.status(500).json({
            message: 'Failed to retrieve user info',
            error: {
                message: error.message,
                response: error.response ? error.response.data : null,
            },
        });
    }
};

/**
 * Get Current User Profile
 */
export const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-__v');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "User profile retrieved", user });
    } catch (error) {
        console.error('Error during getMyProfile:', error.message);
        res.status(500).json({
            message: 'Failed to retrieve user profile',
            error: error.message
        });
    }
};

/**
 * Update User Profile
 */
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { userName, phoneNumber, photo } = req.body;

        const updatedData = {
            userName,
            phoneNumber,
            photo,
        };

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updatedData },
            { new: true, runValidators: true }
        ).select('-__v');

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Optionally, update the JWT if necessary
        // For simplicity, we'll keep the existing token until it expires

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error('Error during updateProfile:', error.message);
        res.status(500).json({
            message: 'Failed to update profile',
            error: error.message
        });
    }
};

/**
 * Logout Handler
 */
export const logout = (req, res) => {
    try {
        res
            .status(200)
            .clearCookie("accessToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Ensure secure flag in production
                sameSite: "strict"
            })
            .json({
                success: true,
                message: "Logged out successfully",
            });
    } catch (error) {
        console.error('Error during logout:', error.message);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};